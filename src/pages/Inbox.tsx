import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useI18n } from "@/lib/i18n";

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  time: string;
}

interface Conversation {
  id: string;
  name: { en: string; ar: string };
  image: string;
  messages: Message[];
  lastActive: string;
}

const Inbox = () => {
  const { lang, t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem("inbox_conversations");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle incoming ?personId=...&name=...&nameAr=...&image=...
  useEffect(() => {
    const personId = searchParams.get("personId");
    const name = searchParams.get("name");
    const nameAr = searchParams.get("nameAr");
    const image = searchParams.get("image");

    if (personId && name) {
      const existing = conversations.find((c) => c.id === personId);
      if (existing) {
        setActiveId(personId);
      } else {
        const newConvo: Conversation = {
          id: personId,
          name: { en: name, ar: nameAr || name },
          image: image || "",
          messages: [],
          lastActive: new Date().toISOString(),
        };
        setConversations((prev) => [newConvo, ...prev]);
        setActiveId(personId);
      }
      // Clear params without losing state
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Persist conversations
  useEffect(() => {
    localStorage.setItem("inbox_conversations", JSON.stringify(conversations));
  }, [conversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, conversations]);

  const activeConvo = conversations.find((c) => c.id === activeId);

  const sendMessage = () => {
    if (!draft.trim() || !activeId) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: Message = {
      id: `${Date.now()}`,
      text: draft.trim(),
      fromMe: true,
      time: timeStr,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastActive: now.toISOString() }
          : c
      )
    );
    setDraft("");
  };

  // ── Conversation list view ──
  if (!activeConvo) {
    return (
      <div className="min-h-screen bg-surface pb-20">
        <header className="px-4 py-4 bg-background sticky top-0 z-40">
          <h1 className="text-xl font-bold text-foreground">{t("nav.inbox")}</h1>
        </header>

        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
            <MessageCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-1">{t("nav.inbox")}</h2>
            <p className="text-sm text-muted-foreground">
              {lang === "ar"
                ? "رسائلك مع المضيفين والمرشدين ستظهر هنا"
                : "Messages from hosts and guides will appear here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((c) => {
              const lastMsg = c.messages[c.messages.length - 1];
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
                >
                  <img src={c.image} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{c.name[lang]}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {lastMsg
                        ? lastMsg.text
                        : lang === "ar"
                        ? "ابدأ المحادثة…"
                        : "Start the conversation…"}
                    </p>
                  </div>
                  {lastMsg && (
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{lastMsg.time}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <BottomNav />
      </div>
    );
  }

  // ── Chat view ──
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Chat header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => setActiveId(null)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <img src={activeConvo.image} alt="" className="w-9 h-9 rounded-full object-cover" />
        <h1 className="text-base font-bold text-foreground truncate">{activeConvo.name[lang]}</h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {activeConvo.messages.length === 0 && (
          <div className="text-center py-12">
            <img src={activeConvo.image} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {lang === "ar"
                ? `ابدأ محادثة مع ${activeConvo.name[lang]}`
                : `Start a conversation with ${activeConvo.name[lang]}`}
            </p>
          </div>
        )}
        {activeConvo.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                msg.fromMe
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border text-foreground rounded-bl-md"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <span
                className={`text-[10px] mt-1 block ${
                  msg.fromMe ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={lang === "ar" ? "اكتب رسالة…" : "Type a message…"}
            className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={sendMessage}
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

export default Inbox;
