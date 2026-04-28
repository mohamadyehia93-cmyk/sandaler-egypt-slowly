// Display order + bilingual labels for the 4 regions used to thematically
// group horizontal sliders on the Explore feed.
export const REGION_ORDER = ["nile-delta", "upper-egypt", "suez-canal", "frontiers"] as const;

export const REGION_LABEL: Record<string, { en: string; ar: string }> = {
  "nile-delta": { en: "Nile Delta", ar: "دلتا النيل" },
  "upper-egypt": { en: "Upper Egypt", ar: "صعيد مصر" },
  "suez-canal": { en: "Suez Canal", ar: "قناة السويس" },
  frontiers: { en: "Frontiers", ar: "الحدود" },
};

export function groupByRegion<T extends { region_id?: string | null }>(items: T[]) {
  const grouped: Record<string, T[]> = {};
  items.forEach((it) => {
    const k = it.region_id && REGION_LABEL[it.region_id] ? it.region_id : "other";
    (grouped[k] ||= []).push(it);
  });
  const themes = REGION_ORDER.filter((k) => grouped[k]?.length);
  return { grouped, themes };
}
