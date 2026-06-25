import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Ticket } from "lucide-react";

type BookingRow = {
  id: string;
  guests: number;
  total_amount_egp: number;
  status: string;
  created_at: string;
  experience: { id: string; title_en: string; title_ar: string; image: string | null } | null;
};

const statusStyles: Record<string, string> = {
  confirmed: "bg-success/10 text-success",
  pending_payment: "bg-warning/10 text-warning",
  expired: "bg-muted text-muted-foreground",
  refunded: "bg-destructive/10 text-destructive",
};

const MyBookings = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, guests, total_amount_egp, status, created_at, experience:experiences(id, title_en, title_ar, image)")
        .eq("visitor_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as BookingRow[];
    },
  });

  const locale = lang === "ar" ? "ar-EG" : "en-US";

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "حجوزاتي" : "My Bookings"}</h1>
      </header>

      <div className="px-4 py-5 space-y-3">
        {!user ? (
          <p className="text-center text-sm text-muted-foreground py-12">{lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
        ) : isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-12">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد حجوزات بعد" : "No bookings yet"}</p>
          </div>
        ) : (
          bookings.map((b) => (
            <div
              key={b.id}
              onClick={() => b.experience && navigate(`/experience/${b.experience.id}`)}
              className="bg-card rounded-xl shadow-card p-3 flex gap-3 items-center cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                {b.experience?.image ? <img src={b.experience.image} alt="" className="w-full h-full object-cover" /> : <Ticket className="w-6 h-6 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                  {b.experience ? (lang === "ar" ? b.experience.title_ar : b.experience.title_en) : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(b.created_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })} · {b.guests} {lang === "ar" ? "أشخاص" : "guests"} · {b.total_amount_egp} {lang === "ar" ? "ج.م" : "EGP"}
                </p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyles[b.status] || "bg-muted text-muted-foreground"}`}>
                {b.status === "confirmed" ? (lang === "ar" ? "مؤكد" : "Confirmed")
                  : b.status === "pending_payment" ? (lang === "ar" ? "بانتظار الدفع" : "Pending")
                  : b.status === "refunded" ? (lang === "ar" ? "مسترد" : "Refunded")
                  : b.status === "expired" ? (lang === "ar" ? "منتهٍ" : "Expired")
                  : b.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyBookings;
