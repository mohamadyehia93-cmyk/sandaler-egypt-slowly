import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatViewProps {
  conversationId: string;
  otherName: string;
  otherAvatar: string | null;
  onBack: () => void;
}

const ChatView = ({ conversationId, otherName, otherAvatar, onBack }: ChatViewProps) => {
  const { lang } = useI18n();
  const { user } = useAuth();
  const { messages, loading, sendMessage, broadcastTyping, otherTyping } = useMessages(conversationId);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingDebounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    await sendMessage(text);
  }, [draft, sendMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    if (typingDebounce.current) clearTimeout(typingDebounce.current);
    typingDebounce.current = setTimeout(() => broadcastTyping(), 300);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        {otherAvatar ? (
          <img src={otherAvatar} alt="" className="w-9 h-9 rounded-full object-cover" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">
            {otherName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-foreground truncate">{otherName}</h1>
          {otherTyping && (
            <p className="text-[11px] text-primary">{lang === "ar" ? "يكتب…" : "typing…"}</p>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <Skeleton className="h-12 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="text-center py-12">
                {otherAvatar ? (
                  <img src={otherAvatar} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xl font-bold mx-auto mb-3">
                    {otherName.charAt(0).toUpperCase()}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {lang === "ar"
                    ? `ابدأ محادثة مع ${otherName}`
                    : `Start a conversation with ${otherName}`}
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} isMe={msg.sender_id === user?.id} />
            ))}
            {otherTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={lang === "ar" ? "اكتب رسالة…" : "Type a message…"}
            className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
