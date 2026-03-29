import { Compass, Heart, MessageCircle, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { key: "explore", icon: Compass, labelKey: "nav.explore", path: "/" },
  { key: "wishlists", icon: Heart, labelKey: "nav.wishlists", path: "/wishlists" },
  { key: "inbox", icon: MessageCircle, labelKey: "nav.inbox", path: "/inbox" },
  { key: "profile", icon: User, labelKey: "nav.profile", path: "/profile" },
];

const BottomNav = () => {
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary shadow-elevated safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ key, icon: Icon, labelKey, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={key}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all ${
                active ? "text-primary-foreground scale-105" : "text-primary-foreground/60"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
