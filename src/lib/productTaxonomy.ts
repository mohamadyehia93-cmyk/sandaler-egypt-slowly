/**
 * Product categories — single source of truth for the seller form and for
 * labelling a stored category on the public page.
 *
 * The stored value is the ENGLISH string (that is what the seeded rows and the
 * original form already wrote); Arabic is display only. Never rename an existing
 * `en` value — that would orphan every row already carrying it.
 */
export type ProductCategory = { en: string; ar: string };

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  // original six
  { en: "Handmade Jewelry", ar: "مجوهرات يدوية" },
  { en: "Textiles & Weaving", ar: "نسيج وحياكة" },
  { en: "Pottery & Ceramics", ar: "فخار وخزف" },
  { en: "Food & Spices", ar: "طعام وتوابل" },
  { en: "Palm & Wood Crafts", ar: "حرف نخيل وخشب" },
  { en: "Art & Paintings", ar: "فنون ولوحات" },
  // added for Egyptian craft
  { en: "Leatherwork", ar: "أشغال جلدية" },
  { en: "Copper & Brass Metalwork", ar: "نحاس ومعادن" },
  { en: "Khayamiya (Tentmaking Appliqué)", ar: "خيامية" },
  { en: "Glass", ar: "زجاج" },
  { en: "Basketry", ar: "أشغال الخوص والسلال" },
  { en: "Perfume Oils", ar: "زيوت وعطور" },
  { en: "Papyrus", ar: "ورق البردي" },
];

/** Arabic label when we know the category, otherwise the stored text as-is. */
export const productCategoryLabel = (value: string | null | undefined, lang: string) => {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (lang !== "ar") return raw;
  return PRODUCT_CATEGORIES.find((c) => c.en === raw)?.ar || raw;
};
