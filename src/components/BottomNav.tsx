import { Compass, Heart, MessageCircle, User, LayoutDashboard } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

const visitorTabs = [
  { key: "explore", icon: Compass, labelEn: "Explore", labelAr: "استكشف", path: "/" },
  { key: "wishlists", icon: Heart, labelEn: "Wishlists", labelAr: "المفضلة", path: "/wishlists" },
  { key: "inbox", icon: MessageCircle, labelEn: "Inbox", labelAr: "الرسائل", path: "/inbox" },
  { key: "profile", icon: User, labelEn: "Profile", labelAr: "الملف", path: "/profile" },
];

const providerTabs = (dashboardPath: string) => [
  { key: "dashboard", icon: LayoutDashboard, labelEn: "Dashboard", labelAr: "لوحة التحكم", path: dashboardPath },
  { key: "inbox", icon: MessageCircle, labelEn: "Inbox", labelAr: "الرسائل", path: "/inbox" },
  { key: "profile", icon: User, labelEn: "Profile", labelAr: "الملف", path: "/profile" },
];

const BottomNav = () => {
  const { lang } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { isProvider, isVisitorMode, dashboardPath } = useUserRole();

  const showProviderNav = isProvider && !isVisitorMode;
  const tabs = showProviderNav && dashboardPath ? providerTabs(dashboardPath) : visitorTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary shadow-elevated safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ key, icon: Icon, labelEn, labelAr, path }) => {
          const active = location.pathname === path || (key === "dashboard" && location.pathname.startsWith("/dashboard"));
          return (
            <button
              key={key}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all ${
                active ? "text-primary-foreground scale-105" : "text-primary-foreground/60"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{lang === "ar" ? labelAr : labelEn}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;