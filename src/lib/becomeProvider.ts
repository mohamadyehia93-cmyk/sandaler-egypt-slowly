import { supabase } from "@/integrations/supabase/client";
import { markHuman, markMachine, translateText, type TranslationMeta } from "@/lib/translation";
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
 *
 * WHY select-then-insert/update instead of upsert: the uniqueness on these
 * tables is a PARTIAL unique index (`WHERE user_id IS NOT NULL`), which
 * Postgres cannot use as an ON CONFLICT inference target, so every upsert
 * silently failed — organizations ended up with zero owned rows. Explicit
 * select-then-write needs no schema change, works whatever shape the index
 * has, and returns a real error we can show the user.
 */
async function upsertSatellite(
  role: LocalRole,
  userId: string,
  nameEn: string,
  slug: string,
  details?: ProviderDetails
): Promise<string | null> {
  // Arabic name is optional on the satellite tables now — NULL means "no Arabic
  // name" and display falls back to English. Never mirror English into Arabic.
  const nameAr = details?.nameAr?.trim() || null;
  const labels = (details?.answerLabels || []).filter(Boolean);
  const bioEn = details?.bioEn?.trim() || null;
  const avatar = details?.avatar || null;

  let table: "organizations" | "whos_who" | "culture_actors";
  let ownerCol: "owner_id" | "user_id";
  let payload: Record<string, unknown>;

  if (role === "organization") {
    table = "organizations";
    ownerCol = "owner_id";
    payload = {
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
    };
  } else if (role === "whos-who") {
    table = "whos_who";
    ownerCol = "user_id";
    payload = {
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
    };
  } else if (role === "culture-actor") {
    table = "culture_actors";
    ownerCol = "user_id";
    payload = {
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
    };
  } else {
    return null;
  }

  // Never overwrite an existing value with NULL — re-running onboarding must
  // not wipe a bio or photo the provider already wrote.
  const insertPayload = { ...payload };
  const updatePayload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (v !== null && v !== undefined) updatePayload[k] = v;
  }

  // The three satellite tables have different generated row types, so the
  // shared write path is expressed through this minimal structural view.
  type DbError = { message: string } | null;
  type LooseTable = {
    select: (cols: string) => {
      eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: { id: string } | null; error: DbError }> };
    };
    update: (values: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: DbError }> };
    insert: (values: Record<string, unknown>) => Promise<{ error: DbError }>;
  };
  const db = supabase.from(table) as unknown as LooseTable;

  const { data: existing, error: selectError } = await db.select("id").eq(ownerCol, userId).maybeSingle();

  if (selectError) return selectError.message;

  if (existing?.id) {
    // A previously unpublished satellite (role switch) comes back to life.
    updatePayload.status = "published";
    const { error } = await db.update(updatePayload).eq("id", existing.id);
    return error?.message ?? null;
  }

  const { error } = await db.insert(insertPayload);
  return error?.message ?? null;
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
  | { status: "ok"; error: null; satelliteError?: string | null }
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
  // Resolve the identity AT SUBMIT TIME. getSession() reads (and refreshes)
  // the locally persisted session and never fails on a transient network
  // hiccup; getUser() round-trips to the auth server and returns null on any
  // network/JWT error, which previously surfaced as a misleading
  // "not-authenticated" even though the user was signed in.
  const { data: sessionData } = await supabase.auth.getSession();
  let user = sessionData.session?.user ?? null;
  if (!user) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    user = authData.user ?? null;
    if (!user) {
      return {
        status: "error",
        error: authError?.message
          ? `session-unavailable: ${authError.message}`
          : "session-expired",
      };
    }
  }

  const { data: existing, error: existingError } = await supabase
    .from("providers")
    .select("role, translation_meta")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) return { status: "error", error: existingError.message };


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

  const typedEn = details?.nameEn?.trim() || "";
  const typedAr = details?.nameAr?.trim() || "";

  // ARABIC-FIRST NAMING. An Arabic-first provider types their name in Arabic
  // and may leave English empty, but providers.name_en is NOT NULL. So when
  // only Arabic exists we machine-translate it to English; if that fails we
  // store the Arabic string itself so the constraint is satisfied. Either way
  // translation_meta marks name_en as machine so it is never mistaken for
  // authored English. Nothing is ever mirrored the other way (EN -> AR).
  let englishName = typedEn;
  let nameEnIsMachine = false;
  if (!englishName && typedAr) {
    const res = await translateText({ text: typedAr, from: "ar", to: "en", context: "person or business name" });
    englishName = res.ok ? res.translation : typedAr;
    nameEnIsMachine = true;
  }

  const displayName =
    englishName ||
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

  const baseMeta = (existing?.translation_meta as TranslationMeta | null) || {};
  if (nameEnIsMachine) {
    payload.translation_meta = markMachine(baseMeta, "name_en", "ar");
  } else if (typedEn) {
    payload.translation_meta = markHuman(baseMeta, "name_en");
  }

  // Never mirror the English name into name_ar — a NULL means "no Arabic name"
  // and the UI falls back to name_en for display.
  if (typedAr) payload.name_ar = typedAr;
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

  if (error) return { status: "error", error: error.message };

  // The satellite row is what makes an organization / Who's Who / culture actor
  // appear in its directory. A failure here used to be swallowed twice; it is
  // now returned so the caller can tell the user.
  const satelliteError = await upsertSatellite(role, user.id, displayName, slug, details);
  if (satelliteError) {
    console.error("[becomeProvider] satellite profile failed", { role, satelliteError });
  }

  // A confirmed switch must not leave the previous role's profile public.
  if (currentRole && currentRole !== role) {
    await unpublishSatellite(currentRole, user.id);
  }

  return { status: "ok", error: null, satelliteError };

}


/**
 * Turns a becomeProvider error into a readable bilingual sentence. A wrong or
 * cryptic message costs a provider their whole form, so we name the real cause.
 */
export function providerErrorMessage(error: string | null, lang: string): string {
  const ar = lang === "ar";
  const raw = error || "";
  if (raw.startsWith("session-expired") || raw.startsWith("session-unavailable")) {
    return ar
      ? "انتهت صلاحية جلستك. سجّل الدخول مرة أخرى ثم أعد الإرسال — بياناتك محفوظة."
      : "Your session expired. Sign in again and resubmit — your details are kept.";
  }
  if (/permission denied|row-level security|violates row-level/i.test(raw)) {
    return ar
      ? "لا تسمح صلاحيات الحساب بإنشاء ملف مزوّد. تواصل مع الدعم."
      : "Your account is not permitted to create a provider profile. Contact support.";
  }
  if (/null value in column "(.+?)"/i.test(raw)) {
    const col = raw.match(/null value in column "(.+?)"/i)?.[1];
    return ar
      ? `حقل مطلوب ناقص (${col}). أكمله ثم أعد الإرسال.`
      : `A required field is missing (${col}). Fill it in and resubmit.`;
  }
  if (/duplicate key|already exists/i.test(raw)) {
    return ar
      ? "يوجد ملف مزوّد بهذا الاسم بالفعل. جرّب اسمًا مختلفًا."
      : "A provider profile with these details already exists. Try a different name.";
  }
  if (/fetch|network|failed to/i.test(raw)) {
    return ar
      ? "تعذّر الاتصال بالخدمة. تحقّق من الإنترنت وأعد الإرسال — بياناتك محفوظة."
      : "Could not reach the service. Check your connection and resubmit — your details are kept.";
  }
  const base = ar ? "تعذّر إنشاء ملف المزوّد" : "Could not set up your provider profile";
  return raw ? `${base} — ${raw}` : base;
}
