import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Where to Stay: editorial, admin-curated stays per city (`city_stays` + `stays_services`).
 * Real provider-owned stays stay in `accommodations` and appear as "Local hosts".
 */
export type StayBadge =
  | "pick-view" | "pick-beach" | "pick-resort" | "pick-service" | "pick-price" | "pick-location" | "pick-local"
  | "not-recommended" | "seasonal" | "booking-only";

export const STAY_BADGES: Record<StayBadge, { en: string; ar: string; caution: boolean }> = {
  "pick-view": { en: "Pick for the view", ar: "الأجمل إطلالة", caution: false },
  "pick-beach": { en: "Pick for the beach", ar: "الأفضل للشاطئ", caution: false },
  "pick-resort": { en: "Pick for the resort experience", ar: "الأفضل كمنتجع", caution: false },
  "pick-service": { en: "Pick for service", ar: "الأفضل خدمة", caution: false },
  "pick-price": { en: "Pick for price", ar: "الأوفر سعرًا", caution: false },
  "pick-location": { en: "Pick for location", ar: "الأفضل موقعًا", caution: false },
  "pick-local": { en: "Pick for a local stay", ar: "الأفضل لإقامة محلية", caution: false },
  "not-recommended": { en: "Not recommended", ar: "غير مُستحسن", caution: true },
  seasonal: { en: "Seasonal", ar: "موسمي", caution: true },
  "booking-only": { en: "Booking sites only", ar: "عبر مواقع الحجز فقط", caution: true },
};

export const useCityStays = (cityId?: string) =>
  useQuery({
    queryKey: ["where-to-stay", cityId],
    enabled: !!cityId,
    queryFn: async () => {
      const [page, stays] = await Promise.all([
        (supabase as any).from("city_stays").select("*").eq("city_id", cityId!).eq("status", "published").maybeSingle(),
        (supabase as any).from("stays_services").select("*").eq("city_id", cityId!).eq("status", "published").order("order_rank"),
      ]);
      return { page: page.data as any | null, stays: (stays.data || []) as any[] };
    },
  });
