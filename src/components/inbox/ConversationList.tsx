import { MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConversationWithProfile } from "@/hooks/useMessages";

interface ConversationListProps {
  conversations: ConversationWithProfile[];
  loading: boolean;
  onSelect: (id: string) => void;
}

const ConversationList = ({ conversations, loading, onSelect }: ConversationListProps) => {
  const { lang, t } = useI18n();

  if (loading) {
    return (
      <div className="space-y-0 divide-y divide-border">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <MessageCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-1">{t("nav.inbox")}</h2>
        <p className="text-sm text-muted-foreground">
          {lang === "ar"
            ? "رسائلك مع المضيفين والمرشدين ستظهر هنا"
            : "Messages from hosts and guides will appear here"}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((c) => {
        const name = c.otherUser?.display_name || "User";
        const avatar = c.otherUser?.avatar_url;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
          >
            {avatar ? (
              <img src={avatar} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-bold flex-shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">{name}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {c.last_message_text || (lang === "ar" ? "ابدأ المحادثة…" : "Start the conversation…")}
              </p>
            </div>
            {c.last_message_at && (
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                {new Date(c.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;
