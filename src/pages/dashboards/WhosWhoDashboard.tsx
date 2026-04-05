import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Bell, User, MessageSquare, Calendar, ToggleRight, Clock, Plus, ChevronRight } from "lucide-react";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";

const WhosWhoDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "🏠", active: true, path: "/dashboard/whos-who" },
    { label: lang === "ar" ? "ملفي" : "My Profile", icon: "👤", active: false, path: "/profile" },
    { label: lang === "ar" ? "الرسائل" : "Inbox", icon: "💬", active: false, path: "/inbox" },
    { label: lang === "ar" ? "إعدادات" : "Settings", icon: "⚙️", active: false, path: "/profile/settings" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-whos-who text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/profile")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => navigate("/inbox")} className="relative p-1"><Bell className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">📚</div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "من هم" : "Who's Who"}</p>
            <h1 className="text-lg font-bold">{lang === "ar" ? "محمد يحيى" : "Mohamed Yehia"}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Profile Completeness */}
        <div onClick={() => navigate("/profile")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-foreground">{lang === "ar" ? "اكتمال الملف" : "Profile Completeness"}</h3>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-role-whos-who">85%</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div className="bg-role-whos-who h-2 rounded-full" style={{ width: "85%" }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">{lang === "ar" ? "أضف أعمالك المنشورة لاكتمال ملفك" : "Add published works to complete your profile"}</p>
        </div>

        {/* Availability Toggle */}
        <div onClick={() => navigate("/profile/settings")} className="bg-card rounded-xl shadow-card p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <ToggleRight className="w-5 h-5 text-success" />
            <div>
              <h3 className="text-sm font-bold text-foreground">{lang === "ar" ? "متاح للتواصل" : "Available for Contact"}</h3>
              <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "السبت-الخميس، ٩ ص - ١ م" : "Sat–Thu, 9 AM – 1 PM"}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Contact Requests */}
        <div onClick={() => navigate("/inbox")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-role-whos-who" />
            {lang === "ar" ? "طلبات التواصل هذا الشهر" : "Contact Requests This Month"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          <span className="text-3xl font-bold text-role-whos-who">7</span>
          <p className="text-[10px] text-muted-foreground mt-1">{lang === "ar" ? "٣ في انتظار الرد" : "3 awaiting response"}</p>
        </div>

        {/* Upcoming Sessions */}
        <div onClick={() => navigate("/calendar")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-role-whos-who" />
            {lang === "ar" ? "الجلسات القادمة" : "Upcoming Sessions"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          <div className="border border-border rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground">{lang === "ar" ? "أمسية قصص عن طرق صيد المنزلة" : "Evening of stories about Manzala's fishing routes"}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Jan 5 · 6:00 PM · 8/10 {lang === "ar" ? "مقاعد" : "spots"}</p>
          </div>
        </div>

        {/* Quarterly Check-in */}
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-bold text-foreground">{lang === "ar" ? "فحص ربع سنوي" : "Quarterly Check-in"}</h3>
          </div>
          <p className="text-xs text-muted-foreground">{lang === "ar" ? "مستحق في ١٥ يناير — سيتواصل معك السفير" : "Due Jan 15 — Ambassador will reach out"}</p>
        </div>

        <button onClick={() => navigate("/dashboard/whos-who/new-session")} className="w-full border-2 border-role-whos-who text-role-whos-who rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> {lang === "ar" ? "إنشاء جلسة" : "Create Session"}
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-role-whos-who flex justify-around py-2 z-50">
        {bottomNav.map((item, i) => (
          <button key={i} onClick={() => navigate(item.path)} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${item.active ? "opacity-100" : "opacity-60"}`}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] text-white font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default WhosWhoDashboard;