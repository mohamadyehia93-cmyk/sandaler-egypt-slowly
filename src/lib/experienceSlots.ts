import { supabase } from "@/integrations/supabase/client";
import { fetchMyProviderId } from "@/lib/providerRecord";

/** Wizard day labels (types.ts daysOfWeek) mapped to JS getDay() values. */
const DAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export type SlotDraft = {
  slot_date: string;
  start_time: string;
  end_time: string;
  price: number;
  spots_available: number;
};

/**
 * Expands "these weekdays, this time, between these two dates" into concrete
 * slot rows. Capped at 180 rows so a wide range can't flood the table.
 */
export function generateSlotDrafts(opts: {
  days: string[];
  startTime: string;
  endTime: string;
  from: string;
  to: string;
  price: number;
  spots: number;
}): SlotDraft[] {
  const { days, startTime, endTime, from, to, price, spots } = opts;
  if (!days.length || !from || !to || !startTime || !endTime) return [];

  const wanted = new Set(days.map((d) => DAY_INDEX[d]).filter((n) => n !== undefined));
  if (!wanted.size) return [];

  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return [];

  const out: SlotDraft[] = [];
  const cursor = new Date(start);
  while (cursor <= end && out.length < 180) {
    if (wanted.has(cursor.getDay())) {
      out.push({
        slot_date: cursor.toISOString().slice(0, 10),
        start_time: startTime,
        end_time: endTime,
        price,
        spots_available: spots,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

export type OwnedExperienceResult =
  | { state: "ok"; experience: { id: string; title_en: string; title_ar: string; price: number; status: string; capacity_max: number | null } }
  | { state: "signed-out" }
  | { state: "not-provider" }
  | { state: "not-found" }
  | { state: "not-owner" };

/**
 * Ownership check for provider-only listing screens.
 * Uses the platform convention: experiences.provider_id holds providers.id
 * (see src/lib/providerRecord.ts). Never compares against auth.uid() directly.
 * Returns a discriminated state so screens can render a clear message instead
 * of hanging on a spinner.
 */
export async function fetchOwnedExperience(
  experienceId: string,
  userId: string | null | undefined
): Promise<OwnedExperienceResult> {
  if (!userId) return { state: "signed-out" };

  const providerId = await fetchMyProviderId(userId);
  if (!providerId) return { state: "not-provider" };

  const { data, error } = await supabase
    .from("experiences")
    .select("id, title_en, title_ar, price, status, capacity_max, provider_id")
    .eq("id", experienceId)
    .maybeSingle();

  if (error || !data) return { state: "not-found" };
  if (data.provider_id !== providerId) return { state: "not-owner" };

  return {
    state: "ok",
    experience: {
      id: data.id,
      title_en: data.title_en,
      title_ar: data.title_ar,
      price: data.price,
      status: data.status ?? "draft",
      capacity_max: data.capacity_max,
    },
  };
}
