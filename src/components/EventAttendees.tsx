import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Users, Ticket } from "lucide-react";
import MessageUserButton from "@/components/MessageUserButton";

type TicketRow = {
  id: string;
  reference: string;
  quantity: number;
  status: string;
  attendee_name: string;
  user_id: string | null;
  total_egp: number;
  created_at: string;
};


const statusLabel = (status: string, lang: string) => {
  if (status === "paid" || status === "confirmed") return lang === "ar" ? "مدفوع" : "Paid";
  if (status === "pending" || status === "pending_payment") return lang === "ar" ? "معلق" : "Pending";
  if (status === "cancelled") return lang === "ar" ? "ملغي" : "Cancelled";
  if (status === "refunded") return lang === "ar" ? "مسترد" : "Refunded";
  return status;
};

const statusClasses = (status: string) => {
  if (status === "paid" || status === "confirmed") return "bg-success/10 text-success";
  if (status === "pending" || status === "pending_payment") return "bg-warning/10 text-warning";
  return "bg-muted text-muted-foreground";
};

const EventAttendees = ({ eventId }: { eventId: string }) => {
  const { lang } = useI18n();
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["event-attendees", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_tickets")
        .select("id, reference, quantity, status, attendee_name, user_id, total_egp, created_at")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TicketRow[];
    },
  });

  const totalGuests = tickets.reduce((s, t) => s + (t.quantity || 0), 0);

  return (
    <div className="mt-2 rounded-lg bg-secondary/40 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-3.5 h-3.5 text-role-trip-organizer" />
        <p className="text-[11px] font-bold text-foreground">
          {lang === "ar" ? "الحضور" : "Attendees"}
          {tickets.length > 0 && (
            <span className="text-muted-foreground font-medium">
              {" "}· {tickets.length} {lang === "ar" ? "تذكرة" : "tickets"} · {totalGuests} {lang === "ar" ? "شخص" : "guests"}
            </span>
          )}
        </p>
      </div>

      {isLoading ? (
        <p className="text-[11px] text-muted-foreground">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
      ) : tickets.length === 0 ? (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Ticket className="w-3 h-3" /> {lang === "ar" ? "لا توجد تذاكر مباعة بعد" : "No tickets sold yet"}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {tickets.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-foreground line-clamp-1">{t.attendee_name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {t.reference} · {t.quantity} × · {new Date(t.created_at).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-semibold text-foreground">
                  {(t.total_egp || 0).toLocaleString(locale)} {lang === "ar" ? "ج.م" : "EGP"}
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusClasses(t.status)}`}>
                  {statusLabel(t.status, lang)}
                </span>
                <MessageUserButton userId={t.user_id} label={lang === "ar" ? "رسالة" : "Message"} />

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventAttendees;
