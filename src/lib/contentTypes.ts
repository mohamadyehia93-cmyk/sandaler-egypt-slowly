/**
 * Single source of truth for the small "what is this?" label shown on every
 * card. Bilingual, quiet styling handled by ContentCard.
 */
export type ContentType =
  | "experience"
  | "stay"
  | "ride"
  | "trip"
  | "product"
  | "audio-tour"
  | "story"
  | "event"
  | "cause"
  | "program"
  | "collection"
  | "region"
  | "person";

export const CONTENT_TYPE_LABEL: Record<ContentType, { en: string; ar: string }> = {
  experience: { en: "Experience", ar: "تجربة" },
  stay: { en: "Stay", ar: "إقامة" },
  ride: { en: "Ride", ar: "تنقّل" },
  trip: { en: "Trip", ar: "رحلة" },
  product: { en: "Product", ar: "منتج" },
  "audio-tour": { en: "Audio tour", ar: "جولة صوتية" },
  story: { en: "Story", ar: "حكاية" },
  event: { en: "Event", ar: "فعالية" },
  cause: { en: "Cause", ar: "قضية" },
  program: { en: "Program", ar: "برنامج" },
  collection: { en: "Collection", ar: "مجموعة" },
  region: { en: "Region", ar: "منطقة" },
  person: { en: "Person", ar: "شخص" },
};

export const contentTypeLabel = (type: ContentType, lang: "en" | "ar") =>
  CONTENT_TYPE_LABEL[type][lang];
