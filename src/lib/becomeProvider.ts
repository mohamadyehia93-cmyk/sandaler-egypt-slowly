import { supabase } from "@/integrations/supabase/client";
import type { LocalRole } from "@/hooks/useUserRole";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48) || "provider";

export type ProviderDetails = {
  nameEn?: string | null;
  nameAr?: string | null;
  bioEn?: string | null;
  bioAr?: string | null;
  taglineEn?: string | null;
  taglineAr?: string | null;
  cityEn?: string | null;
  cityAr?: string | null;
  cityId?: string | null;
  regionEn?: string | null;
  regionAr?: string | null;
  regionId?: string | null;
  avatar?: string | null;
  specialties?: string[] | null;
  languages?: string | null;
  /** Human-readable labels for the role quiz answers, used to seed satellites. */
  answerLabels?: string[] | null;
};

/**
 * Three roles have their own richer "satellite" profile table. Onboarding
 * seeds a row there so those directories are never empty for a new provider,
 * and — for organizations — so causes/programs have a real owner.
 * Keyed on the owner column (partial unique index) so re-running onboarding
 * updates instead of duplicating. Failures never block provider creation.
 */
async function upsertSatellite(
  role: LocalRole,
  userId: string,
  nameEn: string,
  slug: string,
  details?: ProviderDetails
): Promise<void> {
  const nameAr = details?.nameAr?.trim() || nameEn; // these tables require name_ar
  const labels = (details?.answerLabels || []).filter(Boolean);
  const bioEn = details?.bioEn?.trim() || null;
  const avatar = details?.avatar || null;

  try {
    if (role === "organization") {
      await supabase.from("organizations").upsert(
        {
          owner_id: userId,
          name_en: nameEn,
          name_ar: nameAr,
          slug: `org-${slug}`,
          logo: avatar,
          description_en: bioEn,
          city_id: details?.cityId || null,
          region_id: details?.regionId || null,
          location_en: details?.cityEn || null,
          location_ar: details?.cityAr || null,
          focus_areas_en: labels.length ? labels : null,
          status: "published",
        } as never,
        { onConflict: "owner_id" }
      );
    } else if (role === "whos-who") {
      await supabase.from("whos_who").upsert(
        {
          user_id: userId,
          name_en: nameEn,
          name_ar: nameAr,
          slug: `ww-${slug}`,
          role_en: labels[0] || null,
          bio_en: bioEn,
          image: avatar,
          city_id: details?.cityId || null,
          region_id: details?.regionId || null,
          interests_en: labels.length ? labels : null,
          languages_en: details?.languages
            ? details.languages.split(",").map((l) => l.trim()).filter(Boolean)
            : null,
          status: "published",
        } as never,
        { onConflict: "user_id" }
      );
    } else if (role === "culture-actor") {
      await supabase.from("culture_actors").upsert(
        {
          user_id: userId,
          name_en: nameEn,
          name_ar: nameAr,
          slug: `ca-${slug}`,
          title_en: labels[0] || null,
          bio_en: bioEn,
          image: avatar,
          region_id: details?.regionId || null,
          expertise_en: labels.length ? labels : null,
          status: "published",
        } as never,
        { onConflict: "user_id" }
      );
    }
  } catch {
    // soft-fail: the provider row is what matters for the role to work
  }
}


/**
 * Creates (or updates) the current user's provider profile so that the
 * server-derived role in `useUserRole` resolves to the chosen provider role.
 *
 * The `providers` table is the single source of truth for a user's role,
 * guarded by RLS (`auth.uid() = user_id`). A partial unique index on
 * `user_id` lets us upsert safely so a user has exactly one profile.
 *
 * Optional `details` carry everything collected during onboarding. When they
 * are absent the behaviour is unchanged (name/role/slug only).
 */
export async function becomeProvider(
  role: LocalRole,
  details?: ProviderDetails
): Promise<{ error: string | null }> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { error: "not-authenticated" };

  // Resolve a display name for the required name_en column.
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const displayName =
    details?.nameEn?.trim() ||
    profile?.display_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    (user.email ? user.email.split("@")[0] : null) ||
    "Provider";

  const slug = `${slugify(displayName)}-${user.id.slice(0, 6)}`;

  const bioEn = details?.bioEn?.trim() || null;
  const avatar = details?.avatar || null;

  // A provider profile is only worth showing publicly once it carries some
  // identity: a bio or an avatar. Until then it stays a draft. The public
  // SELECT policy on `providers` is unfiltered, so a draft owner can still
  // read and edit their own row.
  const status = bioEn || details?.bioAr || avatar ? "published" : "draft";

  // Only send fields we actually have, so re-running onboarding never wipes
  // data that already exists on the row.
  const payload: Record<string, unknown> = {
    user_id: user.id,
    role,
    name_en: displayName,
    slug,
    status,
  };

  // Never mirror the English name into name_ar — a NULL means "no Arabic name"
  // and the UI falls back to name_en for display.
  if (details?.nameAr?.trim()) payload.name_ar = details.nameAr.trim();
  if (bioEn) payload.bio_en = bioEn;
  if (details?.bioAr?.trim()) payload.bio_ar = details.bioAr.trim();
  if (details?.taglineEn?.trim()) payload.tagline_en = details.taglineEn.trim();
  if (details?.taglineAr?.trim()) payload.tagline_ar = details.taglineAr.trim();
  if (details?.cityEn) payload.city_en = details.cityEn;
  if (details?.cityAr) payload.city_ar = details.cityAr;
  if (details?.regionEn) payload.region_en = details.regionEn;
  if (details?.regionAr) payload.region_ar = details.regionAr;
  if (avatar) payload.avatar = avatar;
  if (details?.specialties?.length) payload.specialties = details.specialties;
  if (details?.languages) payload.languages = details.languages;

  const { error } = await supabase
    .from("providers")
    .upsert(payload as never, { onConflict: "user_id" });

  return { error: error?.message ?? null };
}
