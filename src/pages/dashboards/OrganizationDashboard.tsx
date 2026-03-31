import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Bell, Plus, Users, Heart, Calendar, TrendingUp, CheckCircle } from "lucide-react";

const OrganizationDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const overview = [
    { value: "4", label: lang === "ar" ? "برامج نشطة" : "Active Programs" },
    { value: "23", label: lang === "ar" ? "متطوعون هذا الشهر" : "Volunteers This Month" },
    { value: "8,500", label: lang === "ar" ? "تبرعات هذا الشهر" : "Donations This Month", suffix: lang === "ar" ? "ج.م" : "EGP" },
    { value: "2", label: lang === "ar" ? "فعاليات قادمة" : "Upcoming Events" },
  ];

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "🏠", active: true },
    { label: lang === "ar" ? "البرامج" : "Programs", icon: "📋", active: false },
    { label: lang === "ar" ? "الرسائل" : "Inbox", icon: "💬", active: false },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-organization text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <button className="relative p-1"><Bell className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">🏛️</div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "مؤسسة" : "Organization"}</p>
            <h1 className="text-lg font-bold">{lang === "ar" ? "مكتبة أطفال طنطا" : "Children's Library Tanta"}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Verification Badge */}
        <div className="bg-success/10 border border-success/30 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-success" />
          <span className="text-xs font-medium text-foreground">{lang === "ar" ? "مؤسسة موثقة ✓" : "Verified Organization ✓"}</span>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 gap-3">
          {overview.map((o, i) => (
            <div key={i} className="bg-card rounded-xl shadow-card p-3 text-center">
              <span className="text-xl font-bold text-foreground block">{o.value}{o.suffix && <span className="text-xs ml-1">{o.suffix}</span>}</span>
              <span className="text-[10px] text-muted-foreground">{o.label}</span>
            </div>
          ))}
        </div>

        {/* Impact Snapshot */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-role-organization" />
            {lang === "ar" ? "ملخص التأثير" : "Impact Snapshot"}
          </h3>
          <div className="flex justify-between text-center">
            <div><span className="text-lg font-bold text-foreground">156</span><p className="text-[10px] text-muted-foreground">{lang === "ar" ? "متطوعون" : "Volunteers"}</p></div>
            <div><span className="text-lg font-bold text-foreground">480</span><p className="text-[10px] text-muted-foreground">{lang === "ar" ? "ساعات" : "Hours"}</p></div>
            <div><span className="text-lg font-bold text-foreground">32K</span><p className="text-[10px] text-muted-foreground">{lang === "ar" ? "تبرعات" : "Donations"}</p></div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button className="w-full bg-role-organization text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {lang === "ar" ? "إضافة برنامج" : "Add Program"}
          </button>
          <button className="w-full border-2 border-role-organization text-role-organization rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" /> {lang === "ar" ? "إنشاء فعالية" : "Create Event"}
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-role-organization flex justify-around py-2 z-50">
        {bottomNav.map((item, i) => (
          <button key={i} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${item.active ? "opacity-100" : "opacity-60"}`}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] text-white font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default OrganizationDashboard;
