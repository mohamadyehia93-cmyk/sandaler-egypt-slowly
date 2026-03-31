import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Bell, Moon, Shield, LogOut, ChevronRight, Eye } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const Settings = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useI18n();

  const sections = [
    {
      title: { en: "Preferences", ar: "التفضيلات" },
      items: [
        {
          icon: Globe,
          label: { en: "Language", ar: "اللغة" },
          value: lang === "ar" ? "العربية" : "English",
          action: () => setLang(lang === "ar" ? "en" : "ar"),
        },
        {
          icon: Moon,
          label: { en: "Dark Mode", ar: "الوضع الداكن" },
          value: { en: "Off", ar: "مغلق" },
        },
        {
          icon: Bell,
          label: { en: "Notifications", ar: "الإشعارات" },
          value: { en: "On", ar: "مفعّل" },
        },
      ],
    },
    {
      title: { en: "Privacy & Security", ar: "الخصوصية والأمان" },
      items: [
        {
          icon: Shield,
          label: { en: "Privacy Settings", ar: "إعدادات الخصوصية" },
        },
        {
          icon: Eye,
          label: { en: "Profile Visibility", ar: "ظهور الملف" },
          value: { en: "Public", ar: "عام" },
        },
      ],
    },
    {
      title: { en: "Account", ar: "الحساب" },
      items: [
        {
          icon: LogOut,
          label: { en: "Log Out", ar: "تسجيل الخروج" },
          danger: true,
          action: () => navigate("/welcome"),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {lang === "ar" ? "الإعدادات" : "Settings"}
        </h1>
      </header>

      <div className="px-4 pt-5 space-y-6">
        {sections.map((section, si) => (
          <div key={si}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title[lang]}
            </h2>
            <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
              {section.items.map((item, ii) => {
                const val = typeof item.value === "object" ? item.value?.[lang] : item.value;
                return (
                  <button
                    key={ii}
                    onClick={item.action}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 ${
                      ii < section.items.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <item.icon className={`w-4.5 h-4.5 ${item.danger ? "text-destructive" : "text-muted-foreground"}`} />
                    <span className={`flex-1 text-sm text-start ${item.danger ? "text-destructive font-medium" : "text-foreground"}`}>
                      {item.label[lang]}
                    </span>
                    {val && <span className="text-xs text-muted-foreground">{val}</span>}
                    {!item.danger && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
