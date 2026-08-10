import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProviderId } from "@/lib/providerRecord";
import { useDashboardIdentity } from "@/hooks/useDashboardIdentity";
import { ArrowLeft, Bell, Plus, Calendar, ChevronRight } from "lucide-react";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";
import EditProfileHeaderButton from "@/components/dashboard/EditProfileHeaderButton";
import DailyStatusCard from "@/components/DailyStatusCard";
import OwnerReservationRequests from "@/components/OwnerReservationRequests";

const TripOrganizerDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const identity = useDashboardIdentity();

  const { data: trips = [] } = useQuery({
    queryKey: ["to-trips", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // trips.organizer_id holds providers.id; legacy rows may hold the auth user id
      const providerId = await fetchMyProviderId(user!.id);
      const owners = [user!.id, ...(providerId ? [providerId] : [])];
      const { data, error } = await supabase
        .from("trips")
        .select("id, title_en, title_ar, status, date")
        .in("organizer_id", owners);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["to-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservation_requests")
        .select("id, status, created_at, item_type")
        .eq("owner_id", user!.id)
        .in("item_type", ["trip", "transport"]);
      if (error) throw error;
      return data ?? [];
    },
  });

  const published = trips.filter((t) => t.status === "published").length;
  const drafts = trips.length - published;
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const requestsThisMonth = requests.filter((r) => new Date(r.created_at).getTime() >= monthAgo).length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  const overview = [
    { value: String(published), label: lang === "ar" ? "رحلات منشورة" : "Published Trips", path: "/dashboard/trip-organizer/my-trips" },
    { value: String(drafts), label: lang === "ar" ? "مسودات" : "Drafts", path: "/dashboard/trip-organizer/my-trips" },
    { value: String(requestsThisMonth), label: lang === "ar" ? "طلبات هذا الشهر" : "Requests This Month", path: "/dashboard/trip-organizer" },
    { value: String(pendingRequests), label: lang === "ar" ? "بانتظار الرد" : "Awaiting Reply", path: "/dashboard/trip-organizer" },
  ];

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "🏠", active: true, path: "/dashboard/trip-organizer" },
    { label: lang === "ar" ? "رحلاتي" : "My Trips", icon: "🗺️", active: false, path: "/dashboard/trip-organizer/my-trips" },
    { label: lang === "ar" ? "العملاء" : "Leads", icon: "📥", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-trip-organizer text-white px-4 py-4">
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
            {identity.avatar ? <img src={identity.avatar} alt="" className="w-full h-full object-cover" /> : identity.initials || "🗺️"}
          </div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "منظم رحلات" : "Trip Organizer"}</p>
            <h1 className="text-lg font-bold">{identity.name || (lang === "ar" ? "لوحة التحكم" : "Dashboard")}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <DailyStatusCard accentBg="bg-role-trip-organizer" accentText="text-role-trip-organizer" />

        <div className="grid grid-cols-2 gap-3">
          {overview.map((o, i) => (
            <div key={i} onClick={() => navigate(o.path)} className="bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <span className="text-xl font-bold text-foreground block">{o.value}</span>
              <span className="text-[10px] text-muted-foreground">{o.label}</span>
            </div>
          ))}
        </div>

        <OwnerReservationRequests itemTypes={["trip", "transport"]} accentBg="bg-role-trip-organizer" />

        <button onClick={() => navigate("/dashboard/trip-organizer/new-trip")} className="w-full bg-role-trip-organizer text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> {lang === "ar" ? "إنشاء رحلة" : "Create Trip"}
        </button>

        <button onClick={() => navigate("/dashboard/trip-organizer/my-trips")} className="w-full bg-card border border-border text-foreground rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
          {lang === "ar" ? "إدارة رحلاتي" : "Manage My Trips"} <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        <button onClick={() => navigate("/dashboard/trip-organizer/events")} className="w-full bg-card border border-border text-foreground rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4 text-role-trip-organizer" /> {lang === "ar" ? "إدارة الفعاليات" : "Manage Events"}
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-role-trip-organizer flex justify-around py-2 z-50">
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

export default TripOrganizerDashboard;
