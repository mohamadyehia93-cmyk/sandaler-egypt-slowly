import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const KEY = ["follows", "me"] as const;

export type Follow = {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  created_at: string;
};

/** Fetch all of the current user's follows. */
export function useMyFollows() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...KEY, user?.id ?? null],
    enabled: !!user,
    queryFn: async (): Promise<Follow[]> => {
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Convenience: is this specific target followed by the current user? */
export function useIsFollowing(targetType: string, targetId: string) {
  const { data } = useMyFollows();
  return !!data?.some(
    (f) => f.target_type === targetType && f.target_id === targetId
  );
}

/** Toggle follow on a target. Requires auth. */
export function useToggleFollow() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      targetType,
      targetId,
      currentlyFollowing,
    }: {
      targetType: string;
      targetId: string;
      currentlyFollowing: boolean;
    }) => {
      if (!user) throw new Error("AUTH_REQUIRED");
      if (currentlyFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("user_id", user.id)
          .eq("target_type", targetType)
          .eq("target_id", targetId);
        if (error) throw error;
        return { followed: false };
      } else {
        const { error } = await supabase.from("follows").insert({
          user_id: user.id,
          target_type: targetType,
          target_id: targetId,
        });
        if (error) throw error;
        return { followed: true };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...KEY, user?.id ?? null] });
      qc.invalidateQueries({ queryKey: ["follower_count"] });
    },
  });
}

/** Public follower count for any target. */
export function useFollowerCount(targetType: string, targetId: string) {
  return useQuery({
    queryKey: ["follower_count", targetType, targetId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("target_type", targetType)
        .eq("target_id", targetId);
      if (error) throw error;
      return count ?? 0;
    },
  });
}
