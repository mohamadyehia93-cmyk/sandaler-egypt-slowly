import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProviderId } from "@/lib/providerRecord";

import { ArrowLeft, Bell, Plus, Calendar, Clock, ChevronRight, Check, X } from "lucide-react";
import { toast } from "sonner";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";
import EditProfileHeaderButton from "@/components/dashboard/EditProfileHeaderButton";
import DailyStatusCard from "@/components/DailyStatusCard";
import OwnerReservationRequests from "@/components/OwnerReservationRequests";
import MessageUserButton from "@/components/MessageUserButton";
import ProviderDraftBanner from "@/components/dashboard/ProviderDraftBanner";


type ProviderBooking = {
  id: string;
  guests: number;
  total_amount_egp: number;
  provider_amount_egp: number;
  status: string;
  payment_status: string;
  visitor_id: string | null;
  created_at: string;
  experience: { title_en: string; title_ar: string } | null;
};



const ServiceProviderDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [savingId, setSavingId] = useState<string | null>(null);


  const { data: listingsCount = 0 } = useQuery({
    queryKey: ["sp-listings-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // experiences.provider_id holds providers.id (see src/lib/providerRecord.ts)
      const providerId = await fetchMyProviderId(user!.id);
      if (!providerId) return 0;
      const { count, error } = await supabase
        .from("experiences")
        .select("*", { count: "exact", head: true })
        .eq("provider_id", providerId);
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Stays and transport are owned by the same provider record as experiences.
  const { data: extraCounts = { stays: 0, rides: 0 } } = useQuery({
    queryKey: ["sp-stay-ride-counts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const providerId = await fetchMyProviderId(user!.id);
      if (!providerId) return { stays: 0, rides: 0 };
      const [stays, rides] = await Promise.all([
        supabase.from("accommodations").select("*", { count: "exact", head: true }).eq("host_id", providerId),
        supabase.from("transport").select("*", { count: "exact", head: true }).eq("provider_id", providerId),
      ]);
      return { stays: stays.count ?? 0, rides: rides.count ?? 0 };
    },
  });



  const { data: bookings = [] } = useQuery({
    queryKey: ["sp-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, guests, total_amount_egp, provider_amount_egp, status, payment_status, visitor_id, created_at, experience:experiences(title_en, title_ar)")
        .eq("provider_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as unknown as ProviderBooking[];
    },
  });

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const bookingsThisWeek = bookings.filter((b) => new Date(b.created_at).getTime() >= weekAgo).length;
  const revenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + (b.provider_amount_egp || 0), 0);
  const pending = bookings.find((b) => b.status === "pending" || b.status === "pending_payment");

  const overview = [
    { value: String(listingsCount), label: lang === "ar" ? "تجارب" : "Experiences", path: "/dashboard/service-provider/my-listings" },
    { value: String(extraCounts.stays), label: lang === "ar" ? "أماكن إقامة" : "Stays", path: "/dashboard/service-provider/my-stays" },
    { value: String(extraCounts.rides), label: lang === "ar" ? "خدمات نقل" : "Transport", path: "/dashboard/service-provider/my-rides" },
    { value: String(bookingsThisWeek), label: lang === "ar" ? "حجوزات هذا الأسبوع" : "Bookings This Week", path: "/dashboard/service-provider" },
    { value: revenue.toLocaleString(), label: lang === "ar" ? "إيرادات مؤكدة" : "Confirmed Revenue", suffix: lang === "ar" ? "ج.م" : "EGP", path: "/profile/impact" },
    { value: String(bookings.length), label: lang === "ar" ? "إجمالي الحجوزات" : "Total Bookings", path: "/dashboard/service-provider" },
  ];

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "🏠", active: true, path: "/dashboard/service-provider" },
    { label: lang === "ar" ? "قوائمي" : "My Listings", icon: "📋", active: false, path: "/dashboard/service-provider/my-listings" },
    { label: lang === "ar" ? "الرسائل" : "Inbox", icon: "💬", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false, path: "/profile" },
  ];

  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const title = (b: ProviderBooking) => b.experience ? (lang === "ar" ? (b.experience.title_ar || b.experience.title_en) : b.experience.title_en) : "—";

  const RESOLVED = ["confirmed", "declined", "cancelled", "completed", "refunded", "expired"];

  const updateBookingStatus = async (id: string, status: "confirmed" | "declined") => {
    setSavingId(id);
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error(lang === "ar" ? "تعذر تحديث الحجز" : "Could not update booking");
      return;
    }
    toast.success(
      status === "confirmed"
        ? (lang === "ar" ? "تم تأكيد الطلب" : "Request accepted")
        : (lang === "ar" ? "تم رفض الطلب" : "Request declined")
    );
    queryClient.invalidateQueries({ queryKey: ["sp-bookings"] });
  };

  const statusLabel = (s: string) => {
    if (s === "confirmed") return lang === "ar" ? "مؤكد" : "Confirmed";
    if (s === "pending") return lang === "ar" ? "طلب جديد" : "New request";
    if (s === "pending_payment") return lang === "ar" ? "بانتظار الدفع" : "Pending payment";
    if (s === "declined") return lang === "ar" ? "مرفوض" : "Declined";
    if (s === "cancelled") return lang === "ar" ? "ملغي" : "Cancelled";
    if (s === "completed") return lang === "ar" ? "مكتمل" : "Completed";
    if (s === "refunded") return lang === "ar" ? "مسترد" : "Refunded";
    if (s === "expired") return lang === "ar" ? "منتهي" : "Expired";
    return s;
  };



  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-service-provider text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/profile")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <EditProfileHeaderButton />
            <VisitorModeHeaderToggle />
            <button onClick={() => navigate("/inbox")} className="relative p-1"><Bell className="w-5 h-5" /><span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full" /></button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">⚓</div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "مزود خدمة" : "Service Provider"}</p>
            <h1 className="text-lg font-bold">{lang === "ar" ? "لوحة التحكم" : "Dashboard"}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4">
        <ProviderDraftBanner />
      </div>

      <div className="px-4 py-4 space-y-4">
        <DailyStatusCard accentBg="bg-role-service-provider" accentText="text-role-service-provider" />

        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          {overview.map((o, i) => (
            <div key={i} onClick={() => navigate(o.path)} className="bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <span className="text-xl font-bold text-foreground block">{o.value}{o.suffix && <span className="text-xs ml-1">{o.suffix}</span>}</span>
              <span className="text-[10px] text-muted-foreground">{o.label}</span>
            </div>
          ))}
        </div>

        {/* Pending Booking Alert */}
        {pending && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-warning" />
              <h3 className="text-sm font-bold text-foreground">{lang === "ar" ? "حجز بانتظار الدفع" : "Booking Awaiting Payment"}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{title(pending)} — {pending.guests} {lang === "ar" ? "أشخاص" : "guests"}</p>
          </div>
        )}

        {/* Bookings */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-role-service-provider" />
            {lang === "ar" ? "الحجوزات" : "Bookings"}
          </h3>
          {bookings.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3">{lang === "ar" ? "لا توجد حجوزات بعد" : "No bookings yet"}</p>
          ) : (
            bookings.slice(0, 8).map((b) => {
              const resolved = RESOLVED.includes(b.status);
              return (
                <div key={b.id} className="py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">{title(b)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {b.guests} {lang === "ar" ? "أشخاص" : "guests"} · {new Date(b.created_at).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                        {b.payment_status === "unpaid" && ` · ${lang === "ar" ? "غير مدفوع" : "Unpaid"}`}
                      </p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${b.status === "confirmed" ? "bg-success/10 text-success" : b.status === "pending" || b.status === "pending_payment" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                      {statusLabel(b.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {!resolved && (
                      <>
                        <button
                          disabled={savingId === b.id}
                          onClick={() => updateBookingStatus(b.id, "confirmed")}
                          className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-role-service-provider text-white flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" /> {lang === "ar" ? "قبول" : "Accept"}
                        </button>
                        <button
                          disabled={savingId === b.id}
                          onClick={() => updateBookingStatus(b.id, "declined")}
                          className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" /> {lang === "ar" ? "رفض" : "Decline"}
                        </button>
                      </>
                    )}
                    <MessageUserButton userId={b.visitor_id} />
                  </div>

                </div>
              );
            })

          )}
        </div>

        <OwnerReservationRequests itemTypes={["accommodation", "transport"]} accentBg="bg-role-service-provider" />

        {/* Quick Actions — everything this role can publish */}
        <div className="space-y-2">
          <button onClick={() => navigate("/dashboard/service-provider/new-experience")} className="w-full bg-role-service-provider text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {lang === "ar" ? "تجربة جديدة" : "New Experience"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => navigate("/dashboard/service-provider/new-stay")} className="border border-role-service-provider text-role-service-provider rounded-xl py-3 font-semibold text-xs flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "مكان إقامة" : "Add a Stay"}
            </button>
            <button onClick={() => navigate("/dashboard/service-provider/new-transport")} className="border border-role-service-provider text-role-service-provider rounded-xl py-3 font-semibold text-xs flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "خدمة نقل" : "Add Transport"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => navigate("/dashboard/service-provider/my-stays")} className="border border-border bg-card rounded-xl py-2.5 font-semibold text-xs text-foreground">
              {lang === "ar" ? "أماكن الإقامة" : "My Stays"}
            </button>
            <button onClick={() => navigate("/dashboard/service-provider/my-rides")} className="border border-border bg-card rounded-xl py-2.5 font-semibold text-xs text-foreground">
              {lang === "ar" ? "خدمات النقل" : "My Transport"}
            </button>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-role-service-provider flex justify-around py-2 z-50">
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

export default ServiceProviderDashboard;
