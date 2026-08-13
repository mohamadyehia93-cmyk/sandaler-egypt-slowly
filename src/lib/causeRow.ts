import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";

/**
 * The four cause-support flows used to resolve their cause from src/lib/sampleData,
 * so a real cause id/slug either 404'd or (worse) matched a sample id and attached
 * a completely different organisation's title, image and funding numbers to the
 * pledge the visitor was about to make. This reads the real row instead and exposes
 * only columns that exist on it.
 *
 * `goal` / `raised` / `supporters` are deliberately NOT exposed: no payment path
 * exists in the app, no contribution has ever been recorded, and those columns hold
 * seed values. Nothing may render fundraising progress from them.
 */
export type CauseRow = {
  id: string;
  ownerId: string | null;
  title: { en: string; ar: string };
  category: { en: string; ar: string };
  image: string | null;
};

export function useCauseRow(idOrSlug?: string) {
  const q = useQuery({
    queryKey: ["cause", idOrSlug],
    enabled: !!idOrSlug,
    queryFn: () => fetchByIdOrSlug("causes", idOrSlug!),
  });

  const row = q.data;
  const cause: CauseRow | null = row
    ? {
        id: row.id,
        ownerId: row.owner_id ?? null,
        title: { en: row.title_en, ar: row.title_ar },
        category: { en: row.category_en || "", ar: row.category_ar || "" },
        image: row.image ?? null,
      }
    : null;

  return { cause, isLoading: q.isLoading };
}
