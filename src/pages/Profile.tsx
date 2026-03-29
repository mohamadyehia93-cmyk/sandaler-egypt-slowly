import { User, MapPin, Star, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useI18n } from "@/lib/i18n";

const Profile = () => {
  const { t, lang } = useI18n();

  const stats = [
    { value: "3", label: lang === "ar" ? "رحلات" : "Trips" },
    { value: "7", label: lang === "ar" ? "تقييمات" : "Reviews" },
    { value: "1", label: lang === "ar" ? "سنة" : "Year" },
  ];

  const menuItems = [
    lang === "ar" ? "لوحة التأثير" : "Impact Dashboard",
    lang === "ar" ? "الشارات والمهام" : "Badges & Quests",
    lang === "ar" ? "الإعدادات" : "Settings",
    lang === "ar" ? "المساعدة والدعم" : "Help & Support",
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="px-4 py-4 bg-background">
        <h1 className="text-xl font-bold text-primary-dark">{t("nav.profile")}</h1>
      </header>

      <div className="px-4 py-6">
        {/* Profile Card */}
        <div className="bg-card rounded-xl shadow-card p-5 flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{lang === "ar" ? "مسافر" : "Traveler"}</h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3 h-3" />
            <span>{lang === "ar" ? "القاهرة، مصر" : "Cairo, Egypt"}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-medium text-primary">{lang === "ar" ? "مستكشف" : "Explorer"}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex bg-card rounded-xl shadow-card mb-6">
          {stats.map((s, i) => (
            <div key={i} className={`flex-1 py-4 text-center ${i < stats.length - 1 ? "border-r border-border" : ""}`}>
              <span className="text-xl font-bold text-primary-dark block">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          {menuItems.map((item, i) => (
            <button key={i} className={`w-full flex items-center justify-between px-4 py-3.5 text-sm text-foreground ${i < menuItems.length - 1 ? "border-b border-border" : ""}`}>
              {item}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
