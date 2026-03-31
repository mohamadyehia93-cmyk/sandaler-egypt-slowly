import { useState, useEffect } from "react";
import { User, MapPin, Star, ChevronRight, Eye, ArrowRightLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useI18n } from "@/lib/i18n";

const roleDashboardRoutes: Record<string, string> = {
  "culture-actor": "/dashboard/culture-actor",
  "service-provider": "/dashboard/service-provider",
  "whos-who": "/dashboard/whos-who",
  "organization": "/dashboard/organization",
  "ambassador": "/dashboard/ambassador",
  "product-seller": "/dashboard/product-seller",
  "trip-organizer": "/dashboard/trip-organizer",
  "subject-expert": "/dashboard/subject-expert",
};

const roleLabels: Record<string, { en: string; ar: string }> = {
  "visitor": { en: "Visitor", ar: "زائر" },
  "culture-actor": { en: "Culture Actor", ar: "فاعل ثقافي" },
  "service-provider": { en: "Service Provider", ar: "مقدم خدمة" },
  "whos-who": { en: "Who's Who", ar: "شخصية بارزة" },
  "organization": { en: "Organization", ar: "مؤسسة" },
  "ambassador": { en: "Ambassador", ar: "سفير" },
  "product-seller": { en: "Product Seller", ar: "بائع منتجات" },
  "trip-organizer": { en: "Trip Organizer", ar: "منظم رحلات" },
  "subject-expert": { en: "Subject Expert", ar: "خبير متخصص" },
};

const Profile = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("visitor");

  useEffect(() => {
    const saved = localStorage.getItem("sandal-role");
    if (saved) setUserRole(saved);
  }, []);

  const stats = [
    { value: "3", label: lang === "ar" ? "رحلات" : "Trips" },
    { value: "7", label: lang === "ar" ? "تقييمات" : "Reviews" },
    { value: "1", label: lang === "ar" ? "سنة" : "Year" },
  ];

  const menuItems = [
    { label: lang === "ar" ? "لوحة التأثير" : "Impact Dashboard", path: "/profile/impact" },
    { label: lang === "ar" ? "الشارات والمهام" : "Badges & Quests", path: "/profile/badges" },
    { label: lang === "ar" ? "الإعدادات" : "Settings", path: "/profile/settings" },
    { label: lang === "ar" ? "المساعدة والدعم" : "Help & Support", path: "/profile/help" },
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
            <span className="text-xs font-medium text-primary">{roleLabels[userRole]?.[lang] || (lang === "ar" ? "مستكشف" : "Explorer")}</span>
          </div>
        </div>

        {/* Switch to Dashboard / View as Visitor */}
        {userRole !== "visitor" && roleDashboardRoutes[userRole] && (
          <button
            onClick={() => navigate(roleDashboardRoutes[userRole])}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 mb-6"
          >
            <ArrowRightLeft className="w-4 h-4" />
            {lang === "ar" ? "الذهاب للوحة التحكم" : "Go to Dashboard"}
          </button>
        )}

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
            <button key={i} onClick={() => navigate(item.path)} className={`w-full flex items-center justify-between px-4 py-3.5 text-sm text-foreground ${i < menuItems.length - 1 ? "border-b border-border" : ""}`}>
              {item.label}
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
