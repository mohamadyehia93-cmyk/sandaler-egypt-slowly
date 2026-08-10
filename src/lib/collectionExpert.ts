import { supabase } from "@/integrations/supabase/client";

/**
 * `collections.expert_id` holds the AUTH USER id (RLS: `auth.uid() = expert_id`),
 * not a `providers.id`. So the public byline is resolved user-first:
 *   1. `providers` where `user_id = expert_id`  -> real public profile at /provider/:slug
 *   2. `profiles` where `user_id = expert_id`   -> display name only, no public page
 */
export type CollectionExpert = {
  userId: string;
  nameEn: string;
  nameAr: string;
  avatar: string | null;
  /** Route to the expert's public profile, or null when they have none. */
  href: string | null;
};

export async function fetchCollectionExperts(
  userIds: string[]
): Promise<Record<string, CollectionExpert>> {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (ids.length === 0) return {};

  const out: Record<string, CollectionExpert> = {};

  const { data: providers } = await supabase
    .from("providers")
    .select("id, user_id, slug, name_en, name_ar, avatar, status")
    .in("user_id", ids);

  for (const p of providers ?? []) {
    if (!p.user_id) continue;
    out[p.user_id] = {
      userId: p.user_id,
      nameEn: p.name_en,
      nameAr: p.name_ar || p.name_en,
      avatar: p.avatar,
      href: p.status === "published" ? `/provider/${p.slug || p.id}` : null,
    };
  }

  const missing = ids.filter((id) => !out[id]);
  if (missing.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", missing);
    for (const pr of profiles ?? []) {
      out[pr.user_id] = {
        userId: pr.user_id,
        nameEn: pr.display_name || "Sandal expert",
        nameAr: pr.display_name || "خبير سندال",
        avatar: pr.avatar_url,
        href: null,
      };
    }
  }

  return out;
}

export function collectionEntries(raw: unknown): { title: string; summary?: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((e: any) => ({
      title: typeof e?.title === "string" ? e.title : "",
      summary: typeof e?.summary === "string" ? e.summary : "",
    }))
    .filter((e) => e.title);
}

export function collectionRefs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => (typeof r === "string" ? r : String(r ?? ""))).filter(Boolean);
}
