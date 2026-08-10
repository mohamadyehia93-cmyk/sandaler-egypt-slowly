import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardIdentity } from "@/hooks/useDashboardIdentity";
import { ArrowLeft, Headphones, Eye, Plus, Sparkles, Mic, Bell, ChevronRight } from "lucide-react";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";
import EditProfileHeaderButton from "@/components/dashboard/EditProfileHeaderButton";
import DailyStatusCard from "@/components/DailyStatusCard";

// Static editorial copy curated by the Sandal team — not personalised, not
// backed by any table. Do not present these as generated suggestions.
const STATIC_PROMPTS = [
  { en: "Record a 5-stop walking tour of your favorite alley", ar: "سجّل جولة مشي من 5 محطات في حارتك المفضلة" },
  { en: "Tell the story of a forgotten landmark in your city", ar: "احكِ قصة معلم منسي في مدينتك" },
];

const NarratorDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const identity = useDashboardIdentity();

  const { data: tours = [] } = useQuery({
    queryKey: ["nar-tours", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audio_tours")
        .select("id, title_en, title_ar, status, audio_url")
        .eq("creator_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const published = tours.filter((t) => t.status === "published").length;
  const drafts = tours.filter((t) => t.status === "draft").length;
  const pending = tours.filter((t) => t.status === "pending").length;
  const withAudio = tours.filter((t) => !!t.audio_url).length;

  const stats = [
    { value: published, label: lang === "ar" ? "جولات منشورة" : "Published Tours", icon: Headphones },
    { value: drafts, label: lang === "ar" ? "مسودات" : "Drafts", icon: Mic },
    { value: pending, label: lang === "ar" ? "قيد المراجعة" : "Under Review", icon: Eye },
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
            <EditProfileHeaderButton />
            <VisitorModeHeaderToggle />
            <button onClick={() => navigate("/inbox")} className="p-1" aria-label={lang === "ar" ? "الرسائل" : "Inbox"}><Bell className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 overflow-hidden flex items-center justify-center text-sm font-bold">
            {identity.avatar ? <img src={identity.avatar} alt="" className="w-full h-full object-cover" /> : identity.initials || "🎙️"}
          </div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "راوي صوتي" : "Audio Narrator"}</p>
            <h1 className="text-lg font-bold">{identity.name || (lang === "ar" ? "لوحة التحكم" : "Dashboard")}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <DailyStatusCard accentBg="bg-role-narrator" accentText="text-role-narrator" />

        <div className="flex gap-3">
          {stats.map((s, i) => (
            <div key={i} onClick={() => navigate("/dashboard/narrator/my-tours")} className="flex-1 bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <s.icon className="w-4 h-4 text-role-narrator mx-auto mb-1" />
              <span className="text-lg font-bold text-foreground block">{s.value}</span>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Audio readiness — the only tour metric the app actually stores today */}
        <div onClick={() => navigate("/dashboard/narrator/my-tours")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
            <Headphones className="w-4 h-4 text-role-narrator" />
            {lang === "ar" ? "جولات بها صوت" : "Tours With Audio"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          <span className="text-2xl font-bold text-role-narrator">{withAudio}/{tours.length}</span>
          <p className="text-[10px] text-muted-foreground mt-1">
            {lang === "ar" ? "الجولات بدون ملف صوتي تظهر كـ«قريباً» للزوار" : "Tours without an audio file show as “coming soon” to visitors"}
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-role-narrator" />
            {lang === "ar" ? "أفكار جولات من صندل" : "Tour Ideas from Sandal"}
          </h3>
          <div className="space-y-2">
            {STATIC_PROMPTS.map((p, i) => (
              <p key={i} className="text-xs text-muted-foreground border border-border rounded-lg p-2.5">{lang === "ar" ? p.ar : p.en}</p>
            ))}
          </div>
        </div>

        <button onClick={() => navigate("/dashboard/narrator/new-tour")} className="w-full bg-role-narrator text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> {lang === "ar" ? "جولة صوتية جديدة" : "New Audio Tour"}
        </button>
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
