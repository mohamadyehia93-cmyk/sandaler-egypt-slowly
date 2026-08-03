import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Ticket } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

type Row = {
  id: string;
  reference: string;
  quantity: number;
  total_egp: number;
  status: string;
  created_at: string;
  event: { id: string; slug: string | null; title_en: string; title_ar: string; image: string | null; start_date: string } | null;
};

const MyTickets = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { user } = useAuth();
  const ar = lang === "ar";
  const locale = ar ? "ar-EG" : "en-US";

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["my-event-tickets", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("event_tickets")
        .select("id, reference, quantity, total_egp, status, created_at, event:events(id, slug, title_en, title_ar, image, start_date)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Row[];
    },
  });

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">{ar ? "تذاكري" : "My Tickets"}</h1>
      </header>

      <div className="px-4 py-5 space-y-3">
        {!user ? (
          <p className="text-center text-sm text-muted-foreground py-12">{ar ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
        ) : isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-12">{ar ? "جاري التحميل..." : "Loading..."}</p>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{ar ? "لا توجد تذاكر بعد" : "No tickets yet"}</p>
            <button onClick={() => navigate("/calendar")} className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              {ar ? "استكشف الأحداث" : "Browse events"}
            </button>
          </div>
        ) : (
          tickets.map((tk) => (
            <div
              key={tk.id}
              onClick={() => navigate(`/event-ticket/${tk.id}`)}
              className="bg-card rounded-xl shadow-card p-3 flex gap-3 items-center cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                {tk.event?.image ? (
                  <img src={tk.event.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Ticket className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                  {tk.event ? (ar ? tk.event.title_ar : tk.event.title_en) : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {tk.event
                    ? new Date(tk.event.start_date).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
                    : ""}{" "}
                  · {tk.quantity} {ar ? "تذكرة" : "tickets"} · {tk.total_egp} {ar ? "ج.م" : "EGP"}
                </p>
                <p className="text-[10px] text-muted-foreground">SND-{tk.reference}</p>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  tk.status === "confirmed" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {tk.status === "confirmed" ? (ar ? "مؤكد" : "Confirmed") : ar ? "ملغي" : "Cancelled"}
              </span>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyTickets;
