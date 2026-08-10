import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useMessages";
import type { MessagingTargetKind } from "@/lib/messagingTarget";
import BottomNav from "@/components/BottomNav";
import ConversationList from "@/components/inbox/ConversationList";
import ChatView from "@/components/inbox/ChatView";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Inbox = () => {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { conversations, loading, findOrCreateConversation } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Handle deep-link: ?personId=<id>&kind=user|provider|culture_actor
  useEffect(() => {
    const personId = searchParams.get("personId");
    const kind = (searchParams.get("kind") || "auto") as MessagingTargetKind;
    if (personId && user) {
      findOrCreateConversation(personId, kind).then(({ conversationId, reason }) => {
        if (conversationId) setActiveId(conversationId);
        else if (reason === "unclaimed")
          setNotice(lang === "ar"
            ? "لم ينضم هذا المضيف إلى ساندال بعد، لذا لا يمكن إرسال رسالة إليه."
            : "This host hasn't joined Sandal yet, so they can't receive messages.");
        else
          setNotice(lang === "ar"
            ? "لا يمكن بدء محادثة مع هذا الحساب."
            : "We couldn't start a conversation with this account.");
      });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, user]);

  const activeConvo = conversations.find((c) => c.id === activeId);

  if (!user) {
    return (
      <div className="min-h-screen bg-surface pb-20">
        <header className="px-4 py-4 bg-background sticky top-0 z-40">
          <h1 className="text-xl font-bold text-foreground">{t("nav.inbox")}</h1>
        </header>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
          <MessageCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-1">{t("nav.inbox")}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {lang === "ar" ? "سجّل الدخول لبدء المحادثات" : "Sign in to start conversations"}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (activeConvo) {
    return (
      <ChatView
        conversationId={activeConvo.id}
        otherName={activeConvo.otherUser?.display_name || (lang === "ar" ? "عضو" : "Member")}
        otherAvatar={activeConvo.otherUser?.avatar_url || null}
        onBack={() => setActiveId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="px-4 py-4 bg-background sticky top-0 z-40">
        <h1 className="text-xl font-bold text-foreground">{t("nav.inbox")}</h1>
      </header>
      {notice && (
        <div className="mx-4 mb-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          {notice}
        </div>
      )}
      <ConversationList
        conversations={conversations}
        loading={loading}
        onSelect={(id) => setActiveId(id)}
      />
      <BottomNav />
    </div>
  );
};

export default Inbox;
