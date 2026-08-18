/**
 * Programs and causes are two different tables but one visitor-facing idea:
 * community initiatives you can support. This normalises both row shapes into a
 * single feed item so every surface can list them together with an honest
 * "Program" / "Cause" label instead of two separate, confusing sections.
 */

export type FeedKind = "program" | "cause";

export type ProgramCauseItem = {
  kind: FeedKind;
  id: string;
  href: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  cityId: string | null;
  regionId: string | null;
  category: string | null;
  orgName: string | null;
  orgLogo: string | null;
  startDate: string | null;
  volunteersNeeded: number | null;
  managed: boolean;
};

const pick = (lang: "en" | "ar", en: unknown, ar: unknown) =>
  (lang === "ar" ? (ar as string) || (en as string) : (en as string)) || null;

export const programToItem = (p: any, lang: "en" | "ar"): ProgramCauseItem => ({
  kind: "program",
  id: p.id,
  href: `/program/${p.slug || p.id}`,
  title: pick(lang, p.title_en, p.title_ar) || "",
  subtitle: pick(lang, p.description_en, p.description_ar),
  image: p.image ?? null,
  cityId: p.city_id ?? null,
  regionId: p.region_id ?? null,
  category: p.program_type ?? null,
  orgName: null,
  orgLogo: null,
  startDate: p.start_date ?? null,
  volunteersNeeded: p.volunteers_needed ?? null,
  managed: !!p.owner_id,
});

export const causeToItem = (c: any, lang: "en" | "ar"): ProgramCauseItem => ({
  kind: "cause",
  id: c.id,
  href: `/cause/${c.slug || c.id}`,
  title: pick(lang, c.title_en, c.title_ar) || "",
  subtitle: pick(lang, c.summary_en, c.summary_ar) || pick(lang, c.description_en, c.description_ar),
  image: c.image ?? null,
  cityId: c.city_id ?? null,
  regionId: c.region_id ?? null,
  category: pick(lang, c.category_en, c.category_ar),
  orgName: pick(lang, c.org_name_en, c.org_name_ar),
  orgLogo: c.org_logo ?? null,
  startDate: null,
  volunteersNeeded: null,
  managed: !!c.owner_id,
});

export const kindLabel = (kind: FeedKind, lang: "en" | "ar") =>
  kind === "program"
    ? lang === "ar"
      ? "برنامج"
      : "Program"
    : lang === "ar"
      ? "قضية"
      : "Cause";

export const mergeProgramsCauses = (
  programs: any[],
  causes: any[],
  lang: "en" | "ar"
): ProgramCauseItem[] => [
  ...(programs || []).map((p) => programToItem(p, lang)),
  ...(causes || []).map((c) => causeToItem(c, lang)),
];
