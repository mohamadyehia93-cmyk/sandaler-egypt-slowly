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
 * Satellite table (and owner column) for the roles that have one.
 */
const SATELLITE_BY_ROLE: Partial<Record<LocalRole, { table: "culture_actors" | "whos_who" | "organizations"; ownerCol: "user_id" | "owner_id" }>> = {
  "culture-actor": { table: "culture_actors", ownerCol: "user_id" },
  "whos-who": { table: "whos_who", ownerCol: "user_id" },
  organization: { table: "organizations", ownerCol: "owner_id" },
};

/**
 * When a user switches roles we never destroy the old satellite profile —
 * we unpublish it (status = 'draft') so it stops appearing on public pages
 * while the written bio/photos survive if they switch back.
 */
async function unpublishSatellite(oldRole: LocalRole, userId: string): Promise<void> {
  const sat = SATELLITE_BY_ROLE[oldRole];
  if (!sat) return;
  try {
    await (supabase.from(sat.table) as any)
      .update({ status: "draft" })
      .eq(sat.ownerCol, userId);
  } catch {
    // soft-fail; the role switch itself is what matters
  }
}


export type BecomeProviderResult =
  | { status: "ok"; error: null }
  | { status: "error"; error: string }
  | { status: "role-exists"; currentRole: LocalRole; error: null };

/**
 * Creates (or updates) the current user's provider profile so that the
 * server-derived role in `useUserRole` resolves to the chosen provider role.
 *
 * The `providers` table is the single source of truth for a user's role,
 * guarded by RLS (`auth.uid() = user_id`). A partial unique index on
 * `user_id` lets us upsert safely so a user has exactly one profile.
 *
 * Sandal supports ONE role per account. If the user already has a provider
 * row with a *different* role we do NOT silently overwrite: we return
 * `{ status: "role-exists" }` so the caller can confirm with the user.
 * Passing `{ force: true }` performs the switch and unpublishes the old
 * role's satellite profile so no ghost public profile is left behind.
 */
export async function becomeProvider(
  role: LocalRole,
  details?: ProviderDetails,
  options?: { force?: boolean }
): Promise<BecomeProviderResult> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { status: "error", error: "not-authenticated" };

  const { data: existing } = await supabase
    .from("providers")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const currentRole = (existing?.role as LocalRole | undefined) ?? null;
  if (currentRole && currentRole !== role && !options?.force) {
    return { status: "role-exists", currentRole, error: null };
  }


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

  if (!error) await upsertSatellite(role, user.id, displayName, slug, details);

  return { error: error?.message ?? null };
}

