import { ArrowLeft, Bell, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { NAV_TABS } from "@/lib/nav/tabs";

/**
 * The slim app header: back (only when not on a root tab), page title,
 * search, and one bell that also carries unread messages.
 */
const PageHeader = ({
  title,
  showSearch = true,
  showBell = true,
}: {
  title?: string;
  showSearch?: boolean;
  showBell?: boolean;
}) => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: unread = 0 } = useUnreadMessages();
  const isRootTab = NAV_TABS.some((t) => t.path === pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-1 px-2 py-1.5">
        {!isRootTab && (
          <button
            onClick={() => navigate(-1)}
            aria-label={lang === "ar" ? "رجوع" : "Back"}
            className="tap-target focus-ring rounded-full text-foreground"
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
        )}
        <h1 className="flex-1 truncate px-1 text-[15px] font-bold text-foreground">{title}</h1>
        {showSearch && (
          <button
            onClick={() => navigate("/search")}
            aria-label={lang === "ar" ? "بحث" : "Search"}
            className="tap-target focus-ring rounded-full text-foreground"
          >
            <Search className="h-5 w-5" />
          </button>
        )}
        {showBell && (
          <button
            onClick={() => navigate("/inbox")}
            aria-label={
              unread > 0
                ? lang === "ar"
                  ? `التنبيهات، ${unread} غير مقروء`
                  : `Notifications, ${unread} unread`
                : lang === "ar"
                  ? "التنبيهات"
                  : "Notifications"
            }
            className="tap-target focus-ring relative rounded-full text-foreground"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute end-2 top-2 min-w-[16px] rounded-full bg-destructive px-1 text-[9px] font-bold leading-4 text-destructive-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
