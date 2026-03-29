import { MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useI18n } from "@/lib/i18n";

const Inbox = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="px-4 py-4 bg-background">
        <h1 className="text-xl font-bold text-primary-dark">{t("nav.inbox")}</h1>
      </header>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <MessageCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-1">
          {t("nav.inbox")}
        </h2>
        <p className="text-sm text-muted-foreground">
          Messages from hosts and travelers will appear here
        </p>
      </div>
      <BottomNav />
    </div>
  );
};

export default Inbox;
