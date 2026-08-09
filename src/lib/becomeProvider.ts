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
  regionEn?: string | null;
  regionAr?: string | null;
  avatar?: string | null;
  specialties?: string[] | null;
  languages?: string | null;
};

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
