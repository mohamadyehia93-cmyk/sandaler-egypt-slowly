import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PostComment {
  id: string;
  post_key: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  text: string;
  created_at: string;
}

const commentsKey = (postKeys: string[]) => ["post_comments", [...postKeys].sort().join(",")];

/** Fetch comments for one or many post_keys at once. */
export const usePostComments = (postKeys: string[]) =>
  useQuery({
    queryKey: commentsKey(postKeys),
    enabled: postKeys.length > 0,
    queryFn: async (): Promise<PostComment[]> => {
      const { data, error } = await supabase
        .from("post_comments")
        .select("*")
        .in("post_key", postKeys)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PostComment[];
    },
  });

export const useAddComment = (postKeys: string[]) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      post_key: string;
      text: string;
      author_name: string;
      author_avatar: string | null;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("auth_required");
      const { data, error } = await supabase
        .from("post_comments")
        .insert({
          post_key: input.post_key,
          user_id: auth.user.id,
          text: input.text,
          author_name: input.author_name,
          author_avatar: input.author_avatar,
        })
        .select()
        .single();
      if (error) throw error;
      return data as PostComment;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: commentsKey(postKeys) }),
  });
};
