import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardIdentity } from "@/hooks/useDashboardIdentity";
import { ArrowLeft, Bell, Plus, Calendar, CheckCircle } from "lucide-react";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";
import EditProfileHeaderButton from "@/components/dashboard/EditProfileHeaderButton";
import DailyStatusCard from "@/components/DailyStatusCard";
import OrgApplicationsList from "@/components/OrgApplicationsList";
import CausePledgesList from "@/components/CausePledgesList";

const OrganizationDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const identity = useDashboardIdentity();

  const { data: org } = useQuery({
    queryKey: ["org-row", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name_en, name_ar, logo, image, status")
        .eq("owner_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["org-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [programs, applications, pledges] = await Promise.all([
        supabase.from("programs").select("id, status").eq("owner_id", user!.id),
        supabase.from("volunteer_applications").select("id, status, created_at").eq("org_owner_id", user!.id),
        supabase.from("support_pledges").select("id, status, kind, amount, created_at").eq("owner_id", user!.id),
      ]);
      return {
        programs: programs.data ?? [],
        applications: applications.data ?? [],
        pledges: pledges.data ?? [],
      };
    },
  });

  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const activePrograms = (stats?.programs ?? []).filter((p) => p.status === "published").length;
  const volunteersThisMonth = (stats?.applications ?? []).filter((a) => new Date(a.created_at).getTime() >= monthAgo).length;
  const acceptedVolunteers = (stats?.applications ?? []).filter((a) => a.status === "accepted").length;
  const donationsThisMonth = (stats?.pledges ?? [])
    .filter((p) => p.kind === "donation" && p.status === "accepted" && new Date(p.created_at).getTime() >= monthAgo)
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingPledges = (stats?.pledges ?? []).filter((p) => p.status === "pending").length;

  const orgName = (lang === "ar" ? org?.name_ar : org?.name_en) || identity.name;

  const overview = [
    { value: String(activePrograms), label: lang === "ar" ? "برامج نشطة" : "Active Programs", path: "/dashboard/organization/my-programs" },
    { value: String(volunteersThisMonth), label: lang === "ar" ? "طلبات تطوع هذا الشهر" : "Volunteer Requests This Month", path: "/dashboard/organization" },
    { value: donationsThisMonth.toLocaleString(), label: lang === "ar" ? "تبرعات مقبولة هذا الشهر" : "Accepted Donations This Month", suffix: lang === "ar" ? "ج.م" : "EGP", path: "/dashboard/organization" },
    { value: String(pendingPledges), label: lang === "ar" ? "تعهدات بانتظار الرد" : "Pledges Awaiting Reply", path: "/dashboard/organization" },
  ];

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "🏠", active: true, path: "/dashboard/organization" },
    { label: lang === "ar" ? "البرامج" : "Programs", icon: "📋", active: false, path: "/dashboard/organization/my-programs" },
    { label: lang === "ar" ? "الرسائل" : "Inbox", icon: "💬", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-organization text-white px-4 py-4">
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
            {org?.logo || org?.image || identity.avatar ? (
              <img src={org?.logo || org?.image || identity.avatar!} alt="" className="w-full h-full object-cover" />
            ) : (
              identity.initials || "🏛️"
            )}
          </div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "مؤسسة" : "Organization"}</p>
            <h1 className="text-lg font-bold">{orgName || (lang === "ar" ? "لوحة التحكم" : "Dashboard")}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <DailyStatusCard accentBg="bg-role-organization" accentText="text-role-organization" />

        {/* Only shown when the organization row is actually published/approved */}
        {org?.status === "published" && (
          <div className="bg-success/10 border border-success/30 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs font-medium text-foreground">{lang === "ar" ? "مؤسسة منشورة" : "Published Organization"}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {overview.map((o, i) => (
            <div key={i} onClick={() => navigate(o.path)} className="bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <span className="text-xl font-bold text-foreground block">{o.value}{o.suffix && <span className="text-xs ml-1">{o.suffix}</span>}</span>
              <span className="text-[10px] text-muted-foreground">{o.label}</span>
            </div>
          ))}
        </div>

        <OrgApplicationsList />

        <CausePledgesList />

        <div className="space-y-2">
          <button onClick={() => navigate("/dashboard/organization/new-program")} className="w-full bg-role-organization text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {lang === "ar" ? "إضافة برنامج" : "Add Program"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => navigate("/dashboard/new-event")} className="border-2 border-role-organization text-role-organization rounded-xl py-3 font-semibold text-xs flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" /> {lang === "ar" ? "فعالية جديدة" : "New Event"}
            </button>
            <button onClick={() => navigate("/dashboard/events")} className="border-2 border-role-organization text-role-organization rounded-xl py-3 font-semibold text-xs flex items-center justify-center gap-1.5">
              <Calendar className="w-4 h-4" /> {lang === "ar" ? "فعالياتي" : "My Events"}
            </button>
          </div>
          <button onClick={() => navigate("/calendar")} className="w-full border-2 border-role-organization text-role-organization rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" /> {lang === "ar" ? "تقويم الفعاليات" : "Events Calendar"}
          </button>
        </div>

      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-role-organization flex justify-around py-2 z-50">
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

export default OrganizationDashboard;
