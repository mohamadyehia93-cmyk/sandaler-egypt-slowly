import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Headphones, Eye, TrendingUp, Plus, Sparkles, Mic, ChevronRight, Bell, MapPin } from "lucide-react";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";
import DailyStatusCard from "@/components/DailyStatusCard";

const NarratorDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const stats = [
    { value: "8", label: lang === "ar" ? "جولات منشورة" : "Published Tours", icon: Headphones, path: "/dashboard/narrator/my-tours" },
    { value: "2", label: lang === "ar" ? "مسودات" : "Drafts", icon: Mic, path: "/dashboard/narrator/my-tours" },
    { value: "1", label: lang === "ar" ? "قيد المراجعة" : "Under Review", icon: Eye, path: "/dashboard/narrator/my-tours" },
  ];

  const prompts = [
    { en: "Record a 5-stop walking tour of your favorite alley", ar: "سجّل جولة مشي من 5 محطات في حارتك المفضلة" },
    { en: "Tell the story of a forgotten landmark in your city", ar: "احكِ قصة معلم منسي في مدينتك" },
  ];

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "📊", active: true, path: "/dashboard/narrator" },
    { label: lang === "ar" ? "جولاتي" : "My Tours", icon: "🎙️", active: false, path: "/dashboard/narrator/my-tours" },
    { label: lang === "ar" ? "الرسائل" : "Inbox", icon: "💬", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-narrator text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/profile")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <VisitorModeHeaderToggle />
            <button onClick={() => navigate("/inbox")} className="relative p-1">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">🎙️</div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "راوي صوتي" : "Audio Narrator"}</p>
            <h1 className="text-lg font-bold">{lang === "ar" ? "صوت المدينة" : "Voice of the City"}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <DailyStatusCard accentBg="bg-role-narrator" accentText="text-role-narrator" />

        <div className="flex gap-3">
          {stats.map((s, i) => (
            <div key={i} onClick={() => navigate(s.path)} className="flex-1 bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <s.icon className="w-4 h-4 text-role-narrator mx-auto mb-1" />
              <span className="text-lg font-bold text-foreground block">{s.value}</span>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        <div onClick={() => navigate("/profile/impact")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-role-narrator" />
            {lang === "ar" ? "أداء هذا الأسبوع" : "This Week's Performance"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          <div className="flex justify-between text-center">
            <div><span className="text-lg font-bold text-foreground">412</span><p className="text-[10px] text-muted-foreground">{lang === "ar" ? "تشغيل" : "Plays"}</p></div>
            <div><span className="text-lg font-bold text-foreground">87%</span><p className="text-[10px] text-muted-foreground">{lang === "ar" ? "إكمال" : "Completion"}</p></div>
            <div><span className="text-lg font-bold text-foreground">14</span><p className="text-[10px] text-muted-foreground">{lang === "ar" ? "حجوزات" : "Bookings"}</p></div>
          </div>
        </div>

        <div onClick={() => navigate("/profile/impact")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">{lang === "ar" ? "أرباح هذا الشهر" : "Earnings This Month"}</h3>
              <span className="text-2xl font-bold text-role-narrator">1,820 {lang === "ar" ? "ج.م" : "EGP"}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">{lang === "ar" ? "بعد رسوم 15%" : "After 15% platform fee"}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-role-narrator" />
            {lang === "ar" ? "أفكار جولات من صندل" : "Tour Ideas from Sandal"}
          </h3>
          {prompts.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <span className="text-xs text-foreground flex-1">{p[lang]}</span>
              <button onClick={() => navigate("/dashboard/narrator/new-tour")} className="text-[10px] font-semibold text-white bg-role-narrator px-3 py-1.5 rounded-md ml-2">
                {lang === "ar" ? "ابدأ" : "Start"}
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <button onClick={() => navigate("/dashboard/narrator/new-tour")} className="w-full bg-role-narrator text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {lang === "ar" ? "جولة صوتية جديدة" : "New Audio Tour"}
          </button>
          <button onClick={() => navigate("/dashboard/narrator/my-tours")} className="w-full border-2 border-role-narrator text-role-narrator rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" /> {lang === "ar" ? "إدارة المحطات" : "Manage Stops"}
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-role-narrator flex justify-around py-2 z-50">
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

export default NarratorDashboard;
