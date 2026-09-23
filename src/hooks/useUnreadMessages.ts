import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Real unread count: messages in my conversations, not sent by me, not read. */
export const useUnreadMessages = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["unread-messages", user?.id],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async () => {
      const { data: convos } = await supabase
        .from("conversations")
        .select("id")
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`);
      const ids = (convos ?? []).map((c) => c.id);
      if (ids.length === 0) return 0;
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", ids)
        .is("read_at", null)
        .neq("sender_id", user!.id);
      return count ?? 0;
    },
  });
};
