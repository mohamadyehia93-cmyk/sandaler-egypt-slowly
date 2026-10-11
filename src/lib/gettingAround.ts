import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Getting Around: editorial, admin-curated intercity services per destination city.
 * Lives in its own tables (not `transport`, which holds provider-owned listings).
 */
export type Badge =
  | "pick-frequency" | "pick-comfort" | "pick-price" | "pick-speed" | "pick-groups" | "pick-ease" | "pick-view"
  | "not-recommended" | "intermittent" | "summer-only" | "no-regular-service";

export const BADGES: Record<Badge, { en: string; ar: string; caution: boolean }> = {
  "pick-frequency": { en: "Pick for frequency", ar: "الأكثر تكرارًا", caution: false },
  "pick-comfort": { en: "Pick for comfort", ar: "الأكثر راحة", caution: false },
  "pick-price": { en: "Pick for price", ar: "الأرخص", caution: false },
  "pick-speed": { en: "Pick for speed", ar: "الأسرع", caution: false },
  "pick-groups": { en: "Pick for groups", ar: "الأنسب للمجموعات", caution: false },
  "pick-ease": { en: "Pick for ease", ar: "الأسهل", caution: false },
  "pick-view": { en: "Pick for the view", ar: "الأجمل منظرًا", caution: false },
  "not-recommended": { en: "Not recommended", ar: "غير مُستحسن", caution: true },
  intermittent: { en: "Intermittent", ar: "متقطّع", caution: true },
  "summer-only": { en: "Summer only", ar: "في الصيف فقط", caution: true },
  "no-regular-service": { en: "No regular service", ar: "لا توجد خدمة منتظمة", caution: true },
};

export const useCityGettingAround = (cityId?: string) =>
  useQuery({
    queryKey: ["getting-around", cityId],
    enabled: !!cityId,
    queryFn: async () => {
      const [page, services] = await Promise.all([
        (supabase as any).from("city_getting_around").select("*").eq("city_id", cityId!).eq("status", "published").maybeSingle(),
        (supabase as any).from("getting_around_services").select("*").eq("city_id", cityId!).eq("status", "published").order("order_rank"),
      ]);
      return { page: page.data as any | null, services: (services.data || []) as any[] };
    },
  });

/** "Bus · state operator" -> "Bus" (chip label). */
export const shortMode = (s?: string | null) => (s || "").split("·")[0].trim();

export const checkedLabel = (iso: string | null | undefined, ar: boolean) => {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00").toLocaleDateString(ar ? "ar-EG" : "en-GB", { month: "short", year: "numeric" });
  return ar ? `آخر مراجعة ${d}` : `Last checked ${d}`;
};
