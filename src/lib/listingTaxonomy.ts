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

/**
 * Display metadata for the six themes above. Reference/taxonomy data — it is not
 * sample content: nothing here is presented to a visitor as a real listing.
 * Moved out of the deleted src/lib/sampleData module.
 */
export const EXPERIENCE_THEMES: {
  key: ExperienceTheme;
  label: { en: string; ar: string };
  emoji: string;
}[] = [
  { key: "nature", label: { en: "Nature", ar: "طبيعة" }, emoji: "🌿" },
  { key: "history", label: { en: "History & Heritage", ar: "تاريخ وتراث" }, emoji: "🏛️" },
  { key: "food", label: { en: "Food & Gastronomy", ar: "طعام وفن الطهي" }, emoji: "🍽️" },
  { key: "adventure", label: { en: "Adventure", ar: "مغامرة" }, emoji: "🏄" },
  { key: "culture", label: { en: "Art & Culture", ar: "فن وثقافة" }, emoji: "🎨" },
  { key: "community", label: { en: "Community", ar: "مجتمع" }, emoji: "🤝" },
];

/** accommodations_accommodation_type_check — the ONLY accepted stay types. */
export type AccommodationType = "homestay" | "eco-lodge" | "guesthouse" | "camp" | "hotel";

export const ACCOMMODATION_TYPES: {
  key: AccommodationType;
  label: { en: string; ar: string };
  emoji: string;
}[] = [
  { key: "homestay", label: { en: "Homestay", ar: "بيت ضيافة عائلي" }, emoji: "🏡" },
  { key: "guesthouse", label: { en: "Guesthouse", ar: "بيت ضيافة" }, emoji: "🛏️" },
  { key: "eco-lodge", label: { en: "Eco-lodge", ar: "لودج بيئي" }, emoji: "🌿" },
  { key: "camp", label: { en: "Camp", ar: "كامب" }, emoji: "⛺" },
  { key: "hotel", label: { en: "Hotel", ar: "فندق" }, emoji: "🏨" },
];

export const accommodationTypeLabel = (key: string | null | undefined, lang: "en" | "ar"): string => {
  const hit = ACCOMMODATION_TYPES.find((t) => t.key === key);
  return hit ? hit.label[lang] : key || "";
};

/** transport_transport_type_check — the ONLY accepted vehicle types. */
export const TRANSPORT_TYPES: { key: string; label: { en: string; ar: string }; emoji: string }[] = [
  { key: "felucca", label: { en: "Felucca", ar: "فلوكة" }, emoji: "⛵" },
  { key: "boat", label: { en: "Boat", ar: "قارب" }, emoji: "🛥️" },
  { key: "ferry", label: { en: "Ferry", ar: "معدية" }, emoji: "⛴️" },
  { key: "cruise", label: { en: "Cruise", ar: "رحلة نيلية" }, emoji: "🛳️" },
  { key: "tuk-tuk", label: { en: "Tuk-tuk", ar: "توك توك" }, emoji: "🛺" },
  { key: "private-car", label: { en: "Private car", ar: "سيارة خاصة" }, emoji: "🚗" },
  { key: "4x4", label: { en: "4x4", ar: "سيارة دفع رباعي" }, emoji: "🚙" },
  { key: "microbus", label: { en: "Microbus", ar: "ميكروباص" }, emoji: "🚐" },
  { key: "shuttle", label: { en: "Shuttle", ar: "باص نقل" }, emoji: "🚐" },
  { key: "bus", label: { en: "Bus", ar: "أتوبيس" }, emoji: "🚌" },
  { key: "service-taxi", label: { en: "Service taxi", ar: "تاكسي سيرفيس" }, emoji: "🚖" },
  { key: "train", label: { en: "Train", ar: "قطار" }, emoji: "🚆" },
  { key: "flight", label: { en: "Flight", ar: "رحلة جوية" }, emoji: "✈️" },
  { key: "balloon", label: { en: "Hot-air balloon", ar: "بالون" }, emoji: "🎈" },
  { key: "horse-carriage", label: { en: "Horse carriage", ar: "حنطور" }, emoji: "🛞" },
  { key: "horse-cart", label: { en: "Horse cart", ar: "كارو" }, emoji: "🐎" },
  { key: "donkey-cart", label: { en: "Donkey cart", ar: "عربة حمار" }, emoji: "🫏" },
  { key: "camel", label: { en: "Camel", ar: "جمل" }, emoji: "🐪" },
  { key: "bicycle", label: { en: "Bicycle", ar: "دراجة" }, emoji: "🚲" },
  { key: "walking", label: { en: "Walking", ar: "سيراً" }, emoji: "🚶" },
];

export const TRANSPORT_EMOJI: Record<string, string> = Object.fromEntries(
  TRANSPORT_TYPES.map((t) => [t.key, t.emoji])
);

export const transportTypeLabel = (key: string | null | undefined, lang: "en" | "ar"): string => {
  const hit = TRANSPORT_TYPES.find((t) => t.key === key);
  return hit ? hit.label[lang] : key || "";
};

/** transport_hire_type_check */
export const HIRE_TYPES: { key: "fixed-route" | "on-demand"; label: { en: string; ar: string } }[] = [
  { key: "fixed-route", label: { en: "Fixed route", ar: "خط ثابت" } },
  { key: "on-demand", label: { en: "On-demand hire", ar: "تأجير حسب الطلب" } },
];

/** transport_price_basis_check */
export const PRICE_BASES: { key: "per-person" | "per-vehicle"; label: { en: string; ar: string } }[] = [
  { key: "per-person", label: { en: "Per person", ar: "للفرد" } },
  { key: "per-vehicle", label: { en: "Per vehicle / whole trip", ar: "للمركبة / الرحلة كاملة" } },
];

export const hireTypeLabel = (key: string | null | undefined, lang: "en" | "ar") =>
  HIRE_TYPES.find((h) => h.key === key)?.label[lang] || "";

export const priceBasisLabel = (key: string | null | undefined, lang: "en" | "ar") =>
  PRICE_BASES.find((p) => p.key === key)?.label[lang] || "";
