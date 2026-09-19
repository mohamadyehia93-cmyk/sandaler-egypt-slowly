/**
 * The visitor personalisation vocabulary, shared between sign-up (Splash) and
 * the edit-profile screen so a visitor can change after sign-up exactly what
 * they picked during it. Keys must stay identical to the values written to
 * profiles.interests / travel_style / budget.
 */
export type Bilingual = { en: string; ar: string };

export const VISITOR_INTERESTS: { key: string; label: Bilingual }[] = [
  { key: "experiences", label: { en: "Experiences", ar: "تجارب" } },
  { key: "audio-tours", label: { en: "Audio Tours", ar: "جولات صوتية" } },
  { key: "causes", label: { en: "Local Causes", ar: "قضايا محلية" } },
  { key: "food", label: { en: "Food & Cuisine", ar: "طعام ومأكولات" } },
  { key: "photography", label: { en: "Photography", ar: "تصوير" } },
  { key: "music", label: { en: "Music & Folklore", ar: "موسيقى وفلكلور" } },
  { key: "crafts", label: { en: "Crafts & Art", ar: "حرف وفنون" } },
  { key: "stays", label: { en: "Places to Stay", ar: "أماكن إقامة" } },
  { key: "shopping", label: { en: "Local Products", ar: "منتجات محلية" } },
  { key: "trips", label: { en: "Group Trips", ar: "رحلات جماعية" } },
];

export const VISITOR_TRAVEL_STYLES: { key: string; label: Bilingual }[] = [
  { key: "slow", label: { en: "Slow & Immersive", ar: "بطيء وعميق" } },
  { key: "adventure", label: { en: "Adventure & Active", ar: "مغامرة ونشاط" } },
  { key: "social", label: { en: "Social & Community", ar: "اجتماعي ومجتمعي" } },
  { key: "explorer", label: { en: "Explorer & Curious", ar: "مستكشف وفضولي" } },
];

export const VISITOR_BUDGETS: { key: string; label: Bilingual }[] = [
  { key: "budget", label: { en: "Budget-Friendly", ar: "اقتصادي" } },
  { key: "mid", label: { en: "Mid-Range", ar: "متوسط" } },
  { key: "premium", label: { en: "Premium", ar: "فاخر" } },
  { key: "flexible", label: { en: "Flexible", ar: "مرن" } },
];
