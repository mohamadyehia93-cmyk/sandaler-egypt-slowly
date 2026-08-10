import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardIdentity } from "@/hooks/useDashboardIdentity";
import { ArrowLeft, Bell, Plus, BookOpen, ChevronRight } from "lucide-react";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";
import EditProfileHeaderButton from "@/components/dashboard/EditProfileHeaderButton";
import DailyStatusCard from "@/components/DailyStatusCard";
import SessionRequestsList from "@/components/SessionRequestsList";

const SubjectExpertDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const identity = useDashboardIdentity();

  const { data: collections = [] } = useQuery({
    queryKey: ["se-collections", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("id, title_en, title_ar, status, entries")
        .eq("expert_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["se-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_requests")
        .select("id, status")
        .eq("expert_owner_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const published = collections.filter((c) => c.status === "published").length;
  const drafts = collections.filter((c) => c.status !== "published").length;
  const entryCount = collections.reduce(
    (sum, c) => sum + (Array.isArray(c.entries) ? c.entries.length : 0),
    0
  );
  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  const overview = [
    { value: published, label: lang === "ar" ? "مجموعات منشورة" : "Published Collections", path: "/dashboard/subject-expert/my-collections" },
    { value: drafts, label: lang === "ar" ? "مسودات" : "Drafts", path: "/dashboard/subject-expert/my-collections" },
    { value: entryCount, label: lang === "ar" ? "مداخل" : "Entries", path: "/dashboard/subject-expert/my-collections" },
    { value: pendingRequests, label: lang === "ar" ? "طلبات بانتظار الرد" : "Requests Awaiting Reply", path: "/dashboard/subject-expert" },
  ];

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "🏠", active: true, path: "/dashboard/subject-expert" },
    { label: lang === "ar" ? "مجموعاتي" : "My Collections", icon: "📚", active: false, path: "/dashboard/subject-expert/my-collections" },
    { label: lang === "ar" ? "الرسائل" : "Inbox", icon: "💬", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-subject-expert text-white px-4 py-4">
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
            {identity.avatar ? <img src={identity.avatar} alt="" className="w-full h-full object-cover" /> : identity.initials || "🔬"}
          </div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "خبير متخصص" : "Subject Expert"}</p>
            <h1 className="text-lg font-bold">{identity.name || (lang === "ar" ? "لوحة التحكم" : "Dashboard")}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <DailyStatusCard accentBg="bg-role-subject-expert" accentText="text-role-subject-expert" />

        <div className="grid grid-cols-2 gap-3">
          {overview.map((o, i) => (
            <div key={i} onClick={() => navigate(o.path)} className="bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <span className="text-xl font-bold text-foreground block">{o.value}</span>
              <span className="text-[10px] text-muted-foreground">{o.label}</span>
            </div>
          ))}
        </div>

        <SessionRequestsList accentText="text-role-subject-expert" />

        <div className="space-y-2">
          <button onClick={() => navigate("/dashboard/subject-expert/new-collection")} className="w-full bg-role-subject-expert text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {lang === "ar" ? "مجموعة جديدة" : "New Collection"}
          </button>
          <button onClick={() => navigate("/dashboard/subject-expert/my-collections")} className="w-full border-2 border-role-subject-expert text-role-subject-expert rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" /> {lang === "ar" ? "إدارة مجموعاتي" : "Manage My Collections"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-role-subject-expert flex justify-around py-2 z-50">
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

export default SubjectExpertDashboard;
