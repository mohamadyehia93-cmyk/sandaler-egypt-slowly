import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

type DbConversation = Tables<"conversations">;
type DbMessage = Tables<"messages">;

export interface ConversationWithProfile extends DbConversation {
  otherUser: { id: string; display_name: string | null; avatar_url: string | null } | null;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) { setConversations([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (error || !data) { setLoading(false); return; }

    const otherIds = data.map(c => c.participant_1 === user.id ? c.participant_2 : c.participant_1);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", otherIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) ?? []);
    const enriched: ConversationWithProfile[] = data.map(c => {
      const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
      const profile = profileMap.get(otherId);
      return { ...c, otherUser: profile ? { id: otherId, display_name: profile.display_name, avatar_url: profile.avatar_url } : null };
    });
    setConversations(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("conversations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        fetchConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchConversations]);

  const findOrCreateConversation = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!user) return null;
    // Check existing
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
      .maybeSingle();
    if (existing) return existing.id;

    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ participant_1: user.id, participant_2: otherUserId })
      .select("id")
      .single();
    if (error || !created) return null;
    await fetchConversations();
    return created.id;
  }, [user, fetchConversations]);

  return { conversations, loading, findOrCreateConversation, refetch: fetchConversations };
};

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!conversationId) { setMessages([]); setLoading(false); return; }

    const fetchMsgs = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      setMessages(data ?? []);
      setLoading(false);
    };
    fetchMsgs();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as DbMessage]);
      })
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.userId !== user?.id) {
          setOtherTyping(true);
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => setOtherTyping(false), 3000);
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user?.id]);

  const sendMessage = useCallback(async (text: string, messageType = "text", bookingMeta?: Record<string, unknown>) => {
    if (!user || !conversationId) return;
    await supabase.from("messages").insert([{
      conversation_id: conversationId,
      sender_id: user.id,
      text,
      message_type: messageType,
      booking_meta: (bookingMeta ?? null) as any,
    }]);
    // Update conversation preview
    await supabase.from("conversations").update({
      last_message_text: text,
      last_message_at: new Date().toISOString(),
    }).eq("id", conversationId);
  }, [user, conversationId]);

  const broadcastTyping = useCallback(() => {
    if (!channelRef.current || !user) return;
    channelRef.current.send({ type: "broadcast", event: "typing", payload: { userId: user.id } });
  }, [user]);

  return { messages, loading, sendMessage, broadcastTyping, otherTyping };
};
