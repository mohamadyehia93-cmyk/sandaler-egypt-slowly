import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** The item types accepted by public.wishlists.item_type. */
export const WISHLIST_ITEM_TYPES = [
  "experience",
  "trip",
  "event",
  "post",
  "audio_tour",
  "product",
  "accommodation",
  "transport",
  "cause",
] as const;

export type WishlistItemType = (typeof WISHLIST_ITEM_TYPES)[number];

export type WishlistRow = {
  id: string;
  user_id: string;
  item_type: WishlistItemType;
  item_id: string;
  created_at: string;
};

const KEY = ["wishlists", "me"] as const;

const wishlistKey = (userId: string | null) => [...KEY, userId] as const;

/** All of the current user's saved items. Empty when signed out. */
export function useMyWishlist() {
  const { user } = useAuth();
  return useQuery({
    queryKey: wishlistKey(user?.id ?? null),
    enabled: !!user,
    queryFn: async (): Promise<WishlistRow[]> => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("id, user_id, item_type, item_id, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WishlistRow[];
    },
  });
}

type ToggleArgs = {
  itemType: WishlistItemType;
  itemId: string;
  /** When provided, skips reading the cache to decide direction. */
  currentlySaved?: boolean;
};

/**
 * Saved-state + add/remove/toggle for a single item.
 *
 * `toggle` resolves to `{ saved: boolean }`, or throws `AUTH_REQUIRED` when the
 * user is signed out so the caller can prompt sign-in.
 */
export function useWishlist(itemType?: WishlistItemType, itemId?: string | null) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useMyWishlist();

  const saved =
    !!itemType && !!itemId
      ? rows.some((r) => r.item_type === itemType && r.item_id === itemId)
      : false;

  const mutation = useMutation({
    mutationFn: async ({ itemType: t, itemId: i, currentlySaved }: ToggleArgs) => {
      if (!user) throw new Error("AUTH_REQUIRED");
      const isSaved =
        currentlySaved ??
        rows.some((r) => r.item_type === t && r.item_id === i);

      if (isSaved) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("item_type", t)
          .eq("item_id", i);
        if (error) throw error;
        return { saved: false };
      }

      const { error } = await supabase
        .from("wishlists")
        .insert({ user_id: user.id, item_type: t, item_id: i });
      // Unique violation just means it is already saved — treat as success.
      if (error && error.code !== "23505") throw error;
      return { saved: true };
    },
    // Optimistic update so the heart responds instantly.
    onMutate: async ({ itemType: t, itemId: i, currentlySaved }) => {
      if (!user) return;
      const key = wishlistKey(user.id);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<WishlistRow[]>(key) ?? [];
      const isSaved =
        currentlySaved ?? previous.some((r) => r.item_type === t && r.item_id === i);

      qc.setQueryData<WishlistRow[]>(
        key,
        isSaved
          ? previous.filter((r) => !(r.item_type === t && r.item_id === i))
          : [
              {
                id: `optimistic-${t}-${i}`,
                user_id: user.id,
                item_type: t,
                item_id: i,
                created_at: new Date().toISOString(),
              },
              ...previous,
            ]
      );
      return { previous, key };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.key) qc.setQueryData(ctx.key, ctx.previous);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: wishlistKey(user?.id ?? null) });
    },
  });

  return {
    saved,
    isLoading,
    isSignedIn: !!user,
    isPending: mutation.isPending,
    /** Toggle the item this hook was created for. */
    toggle: () => {
      if (!itemType || !itemId) return Promise.resolve({ saved: false });
      return mutation.mutateAsync({ itemType, itemId, currentlySaved: saved });
    },
    add: (t: WishlistItemType, i: string) =>
      mutation.mutateAsync({ itemType: t, itemId: i, currentlySaved: false }),
    remove: (t: WishlistItemType, i: string) =>
      mutation.mutateAsync({ itemType: t, itemId: i, currentlySaved: true }),
  };
}
