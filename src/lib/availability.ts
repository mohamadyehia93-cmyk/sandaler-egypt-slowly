/**
 * Structured availability for people-style profiles (Who's Who).
 *
 * Replaces the two free-text `meeting_times_en` / `meeting_times_ar` strings,
 * which allowed the English and Arabic sides to disagree (EN "Friday" vs
 * AR "٣ العصر - ٥ العصر"). Availability is stored once as data and rendered
 * bilingually from the same rows, so the two languages can never drift.
 *
 * Stored shape (jsonb array on `whos_who.availability`):
 *   [{ day: 0..6, from: "15:00", to: "17:00" }]
 * where `day` uses the JS convention (0 = Sunday … 6 = Saturday).
 */

export type AvailabilitySlot = { day: number; from: string; to: string };

/** Week order used across the app: the Egyptian week starts on Saturday. */
export const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5];

const DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export const dayName = (day: number, ar: boolean) => (ar ? DAY_AR[day] : DAY_EN[day]) ?? "";

const isTime = (v: unknown) => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

/** Tolerant parse of whatever the row holds; unknown shapes yield an empty list. */
export const parseAvailability = (value: unknown): AvailabilitySlot[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is AvailabilitySlot => {
      const slot = s as AvailabilitySlot | null;
      return (
        !!slot &&
        typeof slot === "object" &&
        Number.isInteger(slot.day) &&
        slot.day >= 0 &&
        slot.day <= 6 &&
        isTime(slot.from) &&
        isTime(slot.to)
      );
    })
    .sort((a, b) => WEEK_ORDER.indexOf(a.day) - WEEK_ORDER.indexOf(b.day) || a.from.localeCompare(b.from));
};

/** "15:00" → "3:00 PM" / "٣:٠٠ م" */
export const formatTime = (value: string, ar: boolean) => {
  const [h, m] = value.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return value;
  const suffix = h < 12 ? (ar ? "ص" : "AM") : ar ? "م" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const time = `${hour12}:${String(m).padStart(2, "0")}`;
  return ar ? `${time.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)])} ${suffix}` : `${time} ${suffix}`;
};

/** One line per slot, e.g. "Friday · 3:00 PM – 5:00 PM". */
export const formatSlot = (slot: AvailabilitySlot, ar: boolean) =>
  `${dayName(slot.day, ar)} · ${formatTime(slot.from, ar)} – ${formatTime(slot.to, ar)}`;
