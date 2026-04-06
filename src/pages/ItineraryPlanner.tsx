import { useState, useRef, useEffect, useMemo, useCallback, Fragment } from "react";
import { ArrowLeft, Send, Sparkles, MapPin, Calendar, Users, Loader2, Save, Check } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { experiences, audioTours, accommodation, trips } from "@/lib/sampleData";
import BottomNav from "@/components/BottomNav";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/itinerary-chat`;

const quickPrompts = {
  en: [
    { icon: MapPin, text: "Plan 3 days in Luxor & Aswan" },
    { icon: Calendar, text: "Week-long Siwa Oasis adventure" },
    { icon: Users, text: "Family trip to Alexandria" },
    { icon: Sparkles, text: "Off-the-beaten-path Egypt" },
  ],
  ar: [
    { icon: MapPin, text: "خطط لـ 3 أيام في الأقصر وأسوان" },
    { icon: Calendar, text: "مغامرة أسبوع في واحة سيوة" },
    { icon: Users, text: "رحلة عائلية إلى الإسكندرية" },
    { icon: Sparkles, text: "أماكن غير تقليدية في مصر" },
  ],
};

function buildCatalog(lang: "en" | "ar"): string {
  const lines: string[] = [];
  lines.push("EXPERIENCES:");
  experiences.slice(0, 35).forEach((e) => {
    lines.push(`- [${e.title[lang]}](/experience/${e.id}) | ${e.region[lang]} | ${e.theme} | EGP ${e.price} | ⭐${e.rating}`);
  });
  lines.push("\nACCOMMODATION:");
  accommodation.slice(0, 25).forEach((a) => {
    lines.push(`- [${a.title[lang]}](/stay/${a.id}) | ${a.location[lang]} | ${a.type[lang]} | EGP ${a.price}/night | ⭐${a.rating}`);
  });
  lines.push("\nTRIPS:");
  trips.slice(0, 16).forEach((t) => {
    lines.push(`- [${t.title[lang]}](/trip/${t.id}) | ${t.route[lang]} | EGP ${t.price} | ${t.duration}`);
  });
  lines.push("\nAUDIO TOURS:");
  audioTours.slice(0, 28).forEach((a) => {
    lines.push(`- [${a.title[lang]}](/audio-tour/${a.id}) | ${a.region[lang]} | ${a.duration}min | ${a.price === 0 ? "Free" : `EGP ${a.price}`}`);
  });
  return lines.join("\n");
}

async function streamChat({
  messages, catalog, onDelta, onDone, onError,
}: {
  messages: Msg[]; catalog: string;
  onDelta: (t: string) => void; onDone: () => void; onError: (e: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, catalog }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      onError(err.error || `Error ${resp.status}`);
      return;
    }
    if (!resp.body) { onError("No response stream"); return; }
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") break;
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : "Connection failed");
  }
}

// Parse [CHOICES: A | B | C] blocks from message content
function parseChoices(content: string): { textParts: string[]; choiceGroups: string[][] } {
  const regex = /\[CHOICES:\s*(.+?)\]/g;
  const textParts: string[] = [];
  const choiceGroups: string[][] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    textParts.push(content.slice(lastIndex, match.index));
    choiceGroups.push(match[1].split("|").map((s) => s.trim()));
    lastIndex = match.index + match[0].length;
  }
  textParts.push(content.slice(lastIndex));
  return { textParts, choiceGroups };
}

const MarkdownLink = ({ href, children }: { href?: string; children?: React.ReactNode }) => {
  const navigate = useNavigate();
  if (href && (href.startsWith("/experience/") || href.startsWith("/stay/") || href.startsWith("/trip/") || href.startsWith("/audio-tour/"))) {
    return (
      <button
        onClick={() => navigate(href)}
        className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors inline"
      >
        {children}
      </button>
    );
  }
  return <a href={href} className="text-primary underline">{children}</a>;
};

const mdComponents = {
  a: ({ href, children }: any) => <MarkdownLink href={href}>{children}</MarkdownLink>,
  h1: ({ children }: any) => <h3 className="text-base font-bold mt-3 mb-1 text-foreground">{children}</h3>,
  h2: ({ children }: any) => <h4 className="text-sm font-bold mt-3 mb-1 text-foreground">{children}</h4>,
  h3: ({ children }: any) => <h5 className="text-sm font-semibold mt-2 mb-1 text-foreground">{children}</h5>,
  p: ({ children }: any) => <p className="mb-2 text-foreground">{children}</p>,
  ul: ({ children }: any) => <ul className="mb-2 space-y-1 list-none pl-0">{children}</ul>,
  li: ({ children }: any) => <li className="text-foreground flex gap-1.5"><span className="shrink-0">•</span><span>{children}</span></li>,
  hr: () => <hr className="my-3 border-border" />,
};

const ChoiceChips = ({ choices, onSelect, disabled }: { choices: string[]; onSelect: (c: string) => void; disabled: boolean }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {choices.map((c, i) => (
      <button
        key={i}
        disabled={disabled}
        onClick={() => onSelect(c)}
        className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm font-medium text-primary hover:bg-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
      >
        {c}
      </button>
    ))}
  </div>
);

const AssistantMessage = ({ content, onChoiceSelect, isLastMessage, isLoading }: {
  content: string; onChoiceSelect: (c: string) => void; isLastMessage: boolean; isLoading: boolean;
}) => {
  const { textParts, choiceGroups } = useMemo(() => parseChoices(content), [content]);

  return (
    <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-a:no-underline">
      {textParts.map((text, i) => (
        <div key={i}>
          {text.trim() && <ReactMarkdown components={mdComponents}>{text}</ReactMarkdown>}
          {choiceGroups[i] && (
            <ChoiceChips
              choices={choiceGroups[i]}
              onSelect={onChoiceSelect}
              disabled={!isLastMessage || isLoading}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const ItineraryPlanner = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const catalog = useMemo(() => buildCatalog(lang), [lang]);

  // Load saved itinerary if ?id= is present
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id || !user) return;
    supabase
      .from("saved_itineraries")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setMessages(data.messages as Msg[]);
          setSavedId(data.id);
        }
      });
  }, [searchParams, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setError(null);
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: allMessages,
      catalog,
      onDelta: upsert,
      onDone: () => setIsLoading(false),
      onError: (e) => { setError(e); setIsLoading(false); },
    });
  }, [messages, isLoading, catalog]);

  const saveItinerary = useCallback(async () => {
    if (!user || messages.length === 0) {
      if (!user) toast.error(lang === "ar" ? "سجّل دخولك أولاً" : "Sign in to save");
      return;
    }
    setSaving(true);
    const title = messages[0]?.content.slice(0, 60) || "My Itinerary";
    const payload = { user_id: user.id, title, messages: messages as any, destination: null, duration_days: null };

    let result;
    if (savedId) {
      result = await supabase.from("saved_itineraries").update({ messages: messages as any, title }).eq("id", savedId);
    } else {
      result = await supabase.from("saved_itineraries").insert(payload).select("id").single();
      if (result.data) setSavedId(result.data.id);
    }
    setSaving(false);
    if (result.error) toast.error(result.error.message);
    else toast.success(lang === "ar" ? "تم الحفظ!" : "Saved!");
  }, [user, messages, savedId, lang]);

  const prompts = quickPrompts[lang] || quickPrompts.en;

  return (
    <div className="min-h-screen bg-surface pb-20 flex flex-col">
      <header className="flex items-center gap-3 px-4 py-3 bg-background border-b border-border">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">
            {lang === "ar" ? "مخطط الرحلة" : "Trip Planner"}
          </h1>
        </div>
        {messages.length > 0 && (
          <button
            onClick={saveItinerary}
            disabled={saving || !user}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "..." : (savedId ? (lang === "ar" ? "تحديث" : "Update") : (lang === "ar" ? "حفظ" : "Save"))}
          </button>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                {lang === "ar" ? "أهلاً! أنا مخطط رحلتك" : "Hi! I'm your trip planner"}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {lang === "ar"
                  ? "أخبرني عن وجهتك المفضلة وسأبني لك خطة رحلة مخصصة من العروض المتاحة"
                  : "Tell me your dream destination and I'll craft a personalized itinerary from our available experiences, stays & tours"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {prompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => send(p.text)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-background border border-border text-left hover:bg-accent/50 transition-colors"
                >
                  <p.icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium text-foreground leading-tight">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-background border border-border text-foreground rounded-bl-md"
              }`}
            >
              {m.role === "assistant" ? (
                <AssistantMessage
                  content={m.content}
                  onChoiceSelect={send}
                  isLastMessage={i === messages.length - 1}
                  isLoading={isLoading}
                />
              ) : (
                <span className="whitespace-pre-wrap">{m.content}</span>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-background border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}

        {error && (
          <div className="text-center text-xs text-destructive bg-destructive/10 rounded-lg p-3">
            {error}
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-background border-t border-border">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={lang === "ar" ? "اسأل عن رحلتك..." : "Ask about your trip..."}
            className="flex-1 h-10 bg-secondary border-none text-sm"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="h-10 w-10 rounded-full shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
};

export default ItineraryPlanner;
