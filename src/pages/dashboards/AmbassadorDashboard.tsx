import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardIdentity } from "@/hooks/useDashboardIdentity";
import { ArrowLeft, Bell, MapPin, Flag, ChevronRight, Clock } from "lucide-react";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";
import EditProfileHeaderButton from "@/components/dashboard/EditProfileHeaderButton";
import DailyStatusCard from "@/components/DailyStatusCard";

const AmbassadorDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const identity = useDashboardIdentity();

  const { data: tasks = [] } = useQuery({
    queryKey: ["amb-tasks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambassador_tasks")
        .select("id, title_en, title_ar, status, due_date, location")
        .eq("ambassador_id", user!.id)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["amb-reports", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flag_reports")
        .select("id, status")
        .eq("reporter_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const count = (s: string) => tasks.filter((t) => t.status === s).length;
  const taskSummary = [
    { value: count("pending"), label: lang === "ar" ? "للتنفيذ" : "To Do", color: "bg-warning" },
    { value: count("in_progress"), label: lang === "ar" ? "قيد التنفيذ" : "In Progress", color: "bg-role-ambassador" },
    { value: count("done"), label: lang === "ar" ? "مكتمل" : "Done", color: "bg-success" },
  ];


  const openTasks = tasks.filter((t) => t.status !== "done").slice(0, 4);
  const openReports = reports.filter((r) => r.status === "pending" || r.status === "reviewing").length;

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "🏠", active: true, path: "/dashboard/ambassador" },
    { label: lang === "ar" ? "المهام" : "Tasks", icon: "✅", active: false, path: "/dashboard/ambassador/my-tasks" },
    { label: lang === "ar" ? "الرسائل" : "Inbox", icon: "💬", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-ambassador text-white px-4 py-4">
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
            {identity.avatar ? <img src={identity.avatar} alt="" className="w-full h-full object-cover" /> : identity.initials || "🛡️"}
          </div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "سفير" : "Ambassador"}</p>
            <h1 className="text-lg font-bold">{identity.name || (lang === "ar" ? "لوحة التحكم" : "Dashboard")}</h1>
            {identity.location && (
              <p className="text-[10px] opacity-70 flex items-center gap-1"><MapPin className="w-3 h-3" />{identity.location}</p>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <DailyStatusCard accentBg="bg-role-ambassador" accentText="text-role-ambassador" />

        <div className="flex gap-3">
          {taskSummary.map((t, i) => (
            <div key={i} onClick={() => navigate("/dashboard/ambassador/my-tasks")} className="flex-1 bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <div className={`w-2 h-2 rounded-full ${t.color} mx-auto mb-1`} />
              <span className="text-lg font-bold text-foreground block">{t.value}</span>
              <span className="text-[10px] text-muted-foreground">{t.label}</span>
            </div>
          ))}
        </div>

        <div onClick={() => navigate("/dashboard/ambassador/my-tasks")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            {lang === "ar" ? "المهام المفتوحة" : "Open Tasks"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          {openTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground">{lang === "ar" ? "لا توجد مهام مفتوحة" : "No open tasks"}</p>
          ) : (
            openTasks.map((t) => (
              <div key={t.id} className="py-2.5 border-b border-border last:border-0">
                <p className="text-xs font-semibold text-foreground">{(lang === "ar" ? (t.title_ar || t.title_en) : t.title_en) || t.title_en}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  {t.due_date && <><Clock className="w-3 h-3" />{t.due_date}</>}
                  {t.location ? ` · ${t.location}` : ""}
                </p>
              </div>
            ))
          )}
        </div>

        <div onClick={() => navigate("/dashboard/ambassador/my-tasks")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
            <Flag className="w-4 h-4 text-role-ambassador" />
            {lang === "ar" ? "تقارير مفتوحة" : "Open Reports"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          <span className="text-2xl font-bold text-role-ambassador">{openReports}</span>
          <p className="text-[10px] text-muted-foreground mt-1">{lang === "ar" ? `من إجمالي ${reports.length} تقرير` : `of ${reports.length} total reports`}</p>
        </div>

        <button onClick={() => navigate("/dashboard/ambassador/flag-issue")} className="w-full bg-role-ambassador text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
          <Flag className="w-4 h-4" /> {lang === "ar" ? "إبلاغ عن مشكلة" : "Flag Issue"}
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-role-ambassador flex justify-around py-2 z-50">
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

export default AmbassadorDashboard;
