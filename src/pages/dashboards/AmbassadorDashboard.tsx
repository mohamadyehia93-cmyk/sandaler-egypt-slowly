import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Bell, MapPin, CheckCircle, AlertTriangle, Clock, Flag, Plus } from "lucide-react";

const AmbassadorDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const taskSummary = [
    { value: "3", label: lang === "ar" ? "للتنفيذ" : "To Do", color: "bg-warning" },
    { value: "1", label: lang === "ar" ? "قيد التنفيذ" : "In Progress", color: "bg-role-ambassador" },
    { value: "12", label: lang === "ar" ? "مكتمل" : "Done", color: "bg-success" },
  ];

  const urgentTasks = [
    { type: lang === "ar" ? "توثيق" : "Verification", provider: lang === "ar" ? "أم فاطمة — طبخ دلتا" : "Om Fatma — Delta Cooking", deadline: "Dec 29", priority: "urgent" },
    { type: lang === "ar" ? "تدريب" : "Onboarding", provider: lang === "ar" ? "علي — جولة فلوكة" : "Ali — Felucca Tour", deadline: "Jan 2", priority: "normal" },
  ];

  const bottomNav = [
    { label: lang === "ar" ? "المنطقة" : "Zone", icon: "🗺️", active: true, path: "/dashboard/ambassador" },
    { label: lang === "ar" ? "المهام" : "Tasks", icon: "✅", active: false, path: "/dashboard/ambassador" },
    { label: lang === "ar" ? "الرسائل" : "Inbox", icon: "💬", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الأداء" : "Performance", icon: "📊", active: false, path: "/profile/impact" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-ambassador text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/profile")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => navigate("/inbox")} className="relative p-1"><Bell className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">🛡️</div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "سفير" : "Ambassador"}</p>
            <h1 className="text-lg font-bold">{lang === "ar" ? "سارة أحمد" : "Sara Ahmed"}</h1>
            <p className="text-[10px] opacity-70 flex items-center gap-1"><MapPin className="w-3 h-3" />{lang === "ar" ? "منطقة دلتا النيل" : "Nile Delta Zone"}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Zone Map Placeholder */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="h-40 bg-secondary flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "خريطة المنطقة" : "Zone Map"}</p>
            </div>
          </div>
          <div className="p-3 flex justify-around text-center">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /><span className="text-[10px] text-muted-foreground">8 {lang === "ar" ? "موثق" : "Verified"}</span></div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /><span className="text-[10px] text-muted-foreground">3 {lang === "ar" ? "معلق" : "Pending"}</span></div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /><span className="text-[10px] text-muted-foreground">1 {lang === "ar" ? "مبلغ" : "Flagged"}</span></div>
          </div>
        </div>

        {/* Task Summary */}
        <div className="flex gap-3">
          {taskSummary.map((t, i) => (
            <div key={i} className="flex-1 bg-card rounded-xl shadow-card p-3 text-center">
              <div className={`w-2 h-2 rounded-full ${t.color} mx-auto mb-1`} />
              <span className="text-lg font-bold text-foreground block">{t.value}</span>
              <span className="text-[10px] text-muted-foreground">{t.label}</span>
            </div>
          ))}
        </div>

        {/* Urgent Tasks */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">{lang === "ar" ? "مهام عاجلة" : "Urgent Tasks"}</h3>
          {urgentTasks.map((t, i) => (
            <div key={i} className={`flex items-center justify-between py-2.5 border-b border-border last:border-0 ${t.priority === "urgent" ? "border-l-2 border-l-destructive pl-2" : ""}`}>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-primary-foreground bg-role-ambassador px-1.5 py-0.5 rounded">{t.type}</span>
                  <span className="text-xs font-semibold text-foreground">{t.provider}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{t.deadline}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full bg-role-ambassador text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
          <Flag className="w-4 h-4" /> {lang === "ar" ? "إبلاغ عن مشكلة" : "Flag Issue"}
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-role-ambassador flex justify-around py-2 z-50">
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

export default AmbassadorDashboard;
