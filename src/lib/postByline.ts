/**
 * Editorial byline helper.
 *
 * Seeded editorial posts have `author_id = null`. Rather than inventing a
 * phantom auth user, those posts are attributed at display level to the
 * platform's own editorial byline ("Sandal" / "سندل") with the Sandal mark
 * as the avatar. Posts that DO have an `author_id` always keep their real
 * author's name/avatar and remain linkable to that person's profile.
 */

export const SANDAL_BYLINE = { en: "Sandal", ar: "سندل" } as const;
export const SANDAL_MARK = "/sandal-logo.svg";

export type PostAuthorRow = {
  author_id?: string | null;
  author_name_en?: string | null;
  author_name_ar?: string | null;
  author_image?: string | null;
};

/** True when the post has no real authoring account (editorial content). */
export const isEditorialPost = (row: PostAuthorRow) => !row?.author_id;

/** Bilingual byline name: real author when present, otherwise "Sandal". */
export const bylineNames = (row: PostAuthorRow): { en: string; ar: string } => {
  if (isEditorialPost(row)) return { en: SANDAL_BYLINE.en, ar: SANDAL_BYLINE.ar };
  const en = row.author_name_en || row.author_name_ar || "";
  const ar = row.author_name_ar || row.author_name_en || "";
  return { en, ar };
};
