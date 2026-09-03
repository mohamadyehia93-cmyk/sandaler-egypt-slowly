import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, Bell, Moon, Shield, LogOut, ChevronRight, Eye, Repeat } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useI18n();
  const { isProvider } = useUserRole();
  const [userId, setUserId] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      if (!active) return;
      setUserId(uid);
      if (!uid) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("email_notifications")
        .eq("user_id", uid)
        .maybeSingle();
      if (active) setEmailNotifications(profile?.email_notifications ?? true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const toggleEmailNotifications = async () => {
    if (!userId) {
      toast.error(lang === "ar" ? "يجب تسجيل الدخول أولاً" : "Please sign in first");
      return;
    }
    if (saving) return;
    const next = !(emailNotifications ?? true);
    setSaving(true);
    setEmailNotifications(next);
    const { error } = await supabase
      .from("profiles")
      .update({ email_notifications: next })
      .eq("user_id", userId);
    setSaving(false);
    if (error) {
      setEmailNotifications(!next);
      toast.error(lang === "ar" ? "لم يتم حفظ التغيير" : "Could not save that change");
      return;
    }
    toast.success(
      next
        ? lang === "ar"
          ? "تم تشغيل إشعارات البريد الإلكتروني"
          : "Email notifications turned on"
        : lang === "ar"
          ? "تم إيقاف إشعارات البريد الإلكتروني"
          : "Email notifications turned off",
    );
  };

  const changeLanguage = async () => {
    const next = lang === "ar" ? "en" : "ar";
    setLang(next);
    if (userId) {
      await supabase.from("profiles").update({ preferred_language: next }).eq("user_id", userId);
    }
  };

  const notificationValue = !userId
    ? { en: "Sign in", ar: "سجّل الدخول" }
    : emailNotifications === null
      ? { en: "…", ar: "…" }
      : emailNotifications
        ? { en: "On", ar: "مفعّل" }
        : { en: "Off", ar: "مغلق" };

  const sections = [
    {
      title: { en: "Preferences", ar: "التفضيلات" },
      items: [
        {
          icon: Globe,
          label: { en: "Language", ar: "اللغة" },
          value: lang === "ar" ? "العربية" : "English",
          action: changeLanguage,
        },
        {
          icon: Moon,
          label: { en: "Dark Mode", ar: "الوضع الداكن" },
          value: { en: "Off", ar: "مغلق" },
        },
        {
          icon: Bell,
          label: { en: "Email notifications", ar: "إشعارات البريد الإلكتروني" },
          value: notificationValue,
          action: toggleEmailNotifications,
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
          icon: Repeat,
          // An existing provider goes to the one-tap switch; someone with no
          // role still needs the full onboarding.
          label: isProvider
            ? { en: "Switch role", ar: "تغيير الدور" }
            : { en: "Become a provider", ar: "كن مقدم خدمة" },
          action: () => navigate(isProvider ? "/switch-role" : "/welcome"),
        },
        {
          icon: LogOut,
          label: { en: "Log Out", ar: "تسجيل الخروج" },
          danger: true,
          action: async () => {
            await supabase.auth.signOut();
            toast.success(lang === "ar" ? "تم تسجيل الخروج" : "Signed out");
            navigate("/welcome");
          },
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
