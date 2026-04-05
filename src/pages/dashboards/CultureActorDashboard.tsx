import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, FileText, Eye, Bookmark, TrendingUp, Plus, Sparkles, Mic, ChevronRight, Bell } from "lucide-react";

const CultureActorDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const stats = [
    { value: "12", label: lang === "ar" ? "منشور" : "Published", icon: FileText, path: "/dashboard/culture-actor/my-content" },
    { value: "3", label: lang === "ar" ? "مسودات" : "Drafts", icon: FileText, path: "/dashboard/culture-actor/my-content" },
    { value: "2", label: lang === "ar" ? "قيد المراجعة" : "Under Review", icon: Eye, path: "/dashboard/culture-actor/my-content" },
  ];

  const prompts = [
    { en: "Write about your town's hidden food traditions", ar: "اكتب عن تقاليد الطعام المخفية في بلدتك" },
    { en: "Share a photo essay on local craftsmanship", ar: "شارك مقالاً مصوراً عن الحرف المحلية" },
  ];

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "📊", active: true, path: "/dashboard/culture-actor" },
    { label: lang === "ar" ? "محتواي" : "My Content", icon: "✍️", active: false, path: "/dashboard/culture-actor/my-content" },
    { label: lang === "ar" ? "الرسائل" : "Inbox", icon: "💬", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="bg-role-culture-actor text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/profile")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => navigate("/inbox")} className="relative p-1">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">✍️</div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "صانع محتوى" : "Culture Actor"}</p>
            <h1 className="text-lg font-bold">{lang === "ar" ? "أحمد حسن" : "Ahmed Hassan"}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="flex gap-3">
          {stats.map((s, i) => (
            <div key={i} onClick={() => navigate(s.path)} className="flex-1 bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <s.icon className="w-4 h-4 text-role-culture-actor mx-auto mb-1" />
              <span className="text-lg font-bold text-foreground block">{s.value}</span>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Today's Analytics */}
        <div onClick={() => navigate("/profile/impact")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-role-culture-actor" />
            {lang === "ar" ? "تحليلات اليوم" : "Today's Analytics"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          <div className="flex justify-between text-center">
            <div><span className="text-lg font-bold text-foreground">248</span><p className="text-[10px] text-muted-foreground">{lang === "ar" ? "مشاهدات" : "Views"}</p></div>
            <div><span className="text-lg font-bold text-foreground">18</span><p className="text-[10px] text-muted-foreground">{lang === "ar" ? "حفظ" : "Saves"}</p></div>
            <div><span className="text-lg font-bold text-foreground">5</span><p className="text-[10px] text-muted-foreground">{lang === "ar" ? "حجوزات" : "Bookings"}</p></div>
          </div>
        </div>

        {/* Earnings */}
        <div onClick={() => navigate("/profile/impact")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">{lang === "ar" ? "أرباح هذا الشهر" : "Earnings This Month"}</h3>
              <span className="text-2xl font-bold text-role-culture-actor">2,450 {lang === "ar" ? "ج.م" : "EGP"}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Active Prompts */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-role-culture-actor" />
            {lang === "ar" ? "أفكار محتوى من صندل" : "Content Prompts from Sandal"}
          </h3>
          {prompts.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <span className="text-xs text-foreground flex-1">{p[lang]}</span>
              <button onClick={() => navigate("/dashboard/culture-actor/new-article")} className="text-[10px] font-semibold text-primary-foreground bg-role-culture-actor px-3 py-1.5 rounded-md ml-2">
                {lang === "ar" ? "اكتب" : "Write"}
              </button>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button onClick={() => navigate("/dashboard/culture-actor/new-article")} className="w-full bg-role-culture-actor text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {lang === "ar" ? "مقال جديد" : "New Article"}
          </button>
          <button onClick={() => navigate("/dashboard/culture-actor/new-article")} className="w-full border-2 border-role-culture-actor text-role-culture-actor rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2">
            <Mic className="w-4 h-4" /> {lang === "ar" ? "سرد صوتي جديد" : "New Audio Narrative"}
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-role-culture-actor flex justify-around py-2 z-50">
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

export default CultureActorDashboard;