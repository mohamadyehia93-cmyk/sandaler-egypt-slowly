/**
 * Explicit, typed maps from user-facing wizard labels to the values the
 * database CHECK constraints actually accept. Never pass a label straight
 * into a constrained column — go through these maps.
 */

/** experiences_theme_check / trips_theme_check */
export type ExperienceTheme = "nature" | "history" | "food" | "adventure" | "culture" | "community";

export const EXPERIENCE_THEME_VALUES: ExperienceTheme[] = [
  "nature",
  "history",
  "food",
  "adventure",
  "culture",
  "community",
];

/** Both the EN and the AR label of a category map to the same stored theme. */
export const CATEGORY_LABEL_TO_THEME: Record<string, ExperienceTheme> = {
  "Nature & Outdoors": "nature",
  "طبيعة وهواء طلق": "nature",
  "Food & Cooking": "food",
  "طعام وطبخ": "food",
  "History & Heritage": "history",
  "تاريخ وتراث": "history",
  "Arts & Crafts": "culture",
  "فنون وحرف": "culture",
  "Adventure & Sports": "adventure",
  "مغامرة ورياضة": "adventure",
  "Spiritual & Wellness": "culture",
  "روحانية وعافية": "culture",
  "Community & Volunteering": "community",
  "مجتمع وتطوع": "community",
};

/** Returns the stored theme for a wizard category label, or null if unknown. */
export const themeForCategory = (label: string): ExperienceTheme | null => {
  const direct = CATEGORY_LABEL_TO_THEME[label?.trim()];
  if (direct) return direct;
  const lower = (label || "").trim().toLowerCase();
  return (EXPERIENCE_THEME_VALUES as string[]).includes(lower) ? (lower as ExperienceTheme) : null;
};

/** trips_trip_type_check */
export type TripType = "one-day" | "multi-day";

export const TRIP_TYPE_LABEL_TO_VALUE: Record<string, TripType> = {
  "One Day": "one-day",
  "يوم واحد": "one-day",
  "Multi Day": "multi-day",
  "متعدد الأيام": "multi-day",
  Weekend: "multi-day",
  "عطلة نهاية الأسبوع": "multi-day",
};

export const tripTypeForLabel = (label: string): TripType | null => {
  const direct = TRIP_TYPE_LABEL_TO_VALUE[label?.trim()];
  if (direct) return direct;
  const lower = (label || "").trim().toLowerCase();
  return lower === "one-day" || lower === "multi-day" ? (lower as TripType) : null;
};

/** Turns a raw Postgres error into a readable bilingual sentence. */
export const readableDbError = (message: string, ar: boolean): string => {
  const m = message || "";
  if (/theme_check/.test(m)) {
    return ar
      ? "الفئة المختارة غير مدعومة. يرجى اختيار فئة من القائمة."
      : "That category isn't supported. Please pick one from the list.";
  }
  if (/trip_type_check/.test(m)) {
    return ar ? "نوع الرحلة غير صالح. اختر يوم واحد أو متعدد الأيام." : "Invalid trip type. Choose One Day or Multi Day.";
  }
  if (/status_check/.test(m)) {
    return ar ? "حالة النشر غير صالحة." : "Invalid publishing status.";
  }
  if (/violates check constraint/.test(m)) {
    return ar
      ? "بعض الحقول تحتوي على قيمة غير مقبولة. راجع خطوات المعالج."
      : "One of the fields has a value the system can't accept. Please review your entries.";
  }
  if (/row-level security|permission denied/.test(m)) {
    return ar ? "لا تملك صلاحية تنفيذ هذا الإجراء." : "You don't have permission to do this.";
  }
  return m;
};
