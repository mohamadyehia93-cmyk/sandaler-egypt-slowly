import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardIdentity } from "@/hooks/useDashboardIdentity";
import { ArrowLeft, Bell, Calendar, Plus, ChevronRight } from "lucide-react";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";
import EditProfileHeaderButton from "@/components/dashboard/EditProfileHeaderButton";
import DailyStatusCard from "@/components/DailyStatusCard";
import SessionRequestsList from "@/components/SessionRequestsList";

const WhosWhoDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const identity = useDashboardIdentity();

  const { data: person } = useQuery({
    queryKey: ["ww-row", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whos_who")
        .select("id, name_en, name_ar, image, role_en, role_ar, status")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["ww-meetups", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetups")
        .select("id, title_en, title_ar, meetup_date, meetup_time, capacity, attendees_count, status")
        .eq("organizer_id", user!.id)
        .order("meetup_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["ww-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_requests")
        .select("id, status, created_at")
        .eq("expert_owner_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = sessions.filter((s) => !s.meetup_date || s.meetup_date >= today).slice(0, 3);
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const requestsThisMonth = requests.filter((r) => new Date(r.created_at).getTime() >= monthAgo).length;
  const pending = requests.filter((r) => r.status === "pending").length;

  const name = (lang === "ar" ? person?.name_ar : person?.name_en) || identity.name;

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "🏠", active: true, path: "/dashboard/whos-who" },
    { label: lang === "ar" ? "جلساتي" : "My Sessions", icon: "📅", active: false, path: "/dashboard/whos-who/my-sessions" },
    { label: lang === "ar" ? "الرسائل" : "Inbox", icon: "💬", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false, path: "/profile" },
  ];


  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-whos-who text-white px-4 py-4">
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
            {person?.image || identity.avatar ? (
              <img src={person?.image || identity.avatar!} alt="" className="w-full h-full object-cover" />
            ) : (
              identity.initials || "📚"
            )}
          </div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "من هم" : "Who's Who"}</p>
            <h1 className="text-lg font-bold">{name || (lang === "ar" ? "لوحة التحكم" : "Dashboard")}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <DailyStatusCard accentBg="bg-role-whos-who" accentText="text-role-whos-who" />

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl shadow-card p-3 text-center">
            <span className="text-xl font-bold text-foreground block">{requestsThisMonth}</span>
            <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "طلبات هذا الشهر" : "Requests This Month"}</span>
          </div>
          <div className="bg-card rounded-xl shadow-card p-3 text-center">
            <span className="text-xl font-bold text-foreground block">{pending}</span>
            <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "بانتظار الرد" : "Awaiting Reply"}</span>
          </div>
        </div>

        <SessionRequestsList accentText="text-role-whos-who" />

        {/* Upcoming Sessions — real meetup rows */}
        <div onClick={() => navigate("/dashboard/whos-who/my-sessions")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-role-whos-who" />
            {lang === "ar" ? "الجلسات القادمة" : "Upcoming Sessions"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-xs text-muted-foreground">{lang === "ar" ? "لا توجد جلسات قادمة بعد" : "No upcoming sessions yet"}</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((s) => (
                <div key={s.id} className="border border-border rounded-lg p-3">
                  <p className="text-xs font-semibold text-foreground">{lang === "ar" ? (s.title_ar || s.title_en) : s.title_en}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {[s.meetup_date, s.meetup_time].filter(Boolean).join(" · ")}
                    {s.capacity ? ` · ${s.attendees_count ?? 0}/${s.capacity} ${lang === "ar" ? "مقاعد" : "spots"}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
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
