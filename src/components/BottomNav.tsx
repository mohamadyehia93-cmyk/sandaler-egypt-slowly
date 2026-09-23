import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { NAV_TABS, activeTabKey } from "@/lib/nav/tabs";

/**
 * The single persistent navigation bar. Five tabs, icon + short label,
 * bilingual and RTL-correct (flex order follows the document direction).
 */
const BottomNav = () => {
  const { lang } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const active = activeTabKey(location.pathname);

  return (
    <nav
      aria-label={lang === "ar" ? "التنقل الرئيسي" : "Main navigation"}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary-dark/30 bg-primary shadow-elevated safe-bottom"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {NAV_TABS.map(({ key, icon: Icon, label, path }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => navigate(path)}
              aria-current={isActive ? "page" : undefined}
              aria-label={label[lang]}
              className={`tap-target flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                isActive ? "text-primary-foreground" : "text-primary-foreground/70"
              }`}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.4 : 1.8} />
              <span className={`text-[10px] leading-none ${isActive ? "font-bold" : "font-medium"}`}>
                {label[lang]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
