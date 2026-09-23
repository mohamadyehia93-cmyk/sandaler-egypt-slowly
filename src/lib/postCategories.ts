/** Arabic display labels for the post category values stored in the database. */
const POST_CATEGORY_AR: Record<string, string> = {
  History: "تاريخ",
  Culture: "ثقافة",
  Nature: "طبيعة",
  Food: "أكل",
  "Heritage & History": "تراث وتاريخ",
};

export const postCategoryLabel = (value: string | null | undefined): { en: string; ar: string } => {
  const v = value || "";
  return { en: v, ar: POST_CATEGORY_AR[v] || v };
};
