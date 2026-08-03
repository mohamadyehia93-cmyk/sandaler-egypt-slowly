import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarPlus, CheckCircle2, MapPin, Ticket } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import DetailSkeleton from "@/components/DetailSkeleton";
import NotFoundView from "@/components/NotFound";
import BottomNav from "@/components/BottomNav";

type TicketRow = {
  id: string;
  reference: string;
  quantity: number;
  unit_price_egp: number;
  service_fee_egp: number;
  total_egp: number;
  attendee_name: string;
  attendee_email: string;
  payment_method: string;
  status: string;
  created_at: string;
  event: {
    id: string;
    slug: string | null;
    title_en: string;
    title_ar: string;
    start_date: string;
    event_time: string | null;
    venue_en: string | null;
    venue_ar: string | null;
    location_en: string | null;
    location_ar: string | null;
  } | null;
};

const pad = (n: number) => String(n).padStart(2, "0");
const icsDate = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;

const EventTicketReceipt = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["event-ticket", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("event_tickets")
        .select(
          "id, reference, quantity, unit_price_egp, service_fee_egp, total_egp, attendee_name, attendee_email, payment_method, status, created_at, event:events(id, slug, title_en, title_ar, start_date, event_time, venue_en, venue_ar, location_en, location_ar)"
        )
        .eq("id", ticketId)
        .maybeSingle();
      if (error) throw error;
      return data as TicketRow | null;
    },
  });

  if (isLoading) return <DetailSkeleton variant="city" />;
  if (!ticket) return <NotFoundView context="generic" />;

  const ev = ticket.event;
  const title = ev ? (ar ? ev.title_ar : ev.title_en) : "—";
  const venue = ev ? (ar ? ev.venue_ar || ev.location_ar : ev.venue_en || ev.location_en) : null;
  const locale = ar ? "ar-EG" : "en-US";
  const dateLabel = ev
    ? new Date(ev.start_date).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  const methodLabel =
    ticket.payment_method === "cash"
      ? ar
        ? "الدفع عند الوصول"
        : "Pay on arrival"
      : ticket.payment_method === "wallet"
      ? ar
        ? "محفظة إلكترونية"
        : "Mobile wallet"
      : ar
      ? "بطاقة"
      : "Card";

  const addToCalendar = () => {
    if (!ev) return;
    const start = new Date(ev.start_date);
    const nextDay = new Date(start.getTime() + 86400000);
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `UID:${ticket.id}@sandaler`,
      `DTSTART;VALUE=DATE:${icsDate(start)}`,
      `DTEND;VALUE=DATE:${icsDate(nextDay)}`,
      `SUMMARY:${ar ? ev.title_ar : ev.title_en}`,
      `LOCATION:${venue || ""}`,
      `DESCRIPTION:${ar ? "رقم التذكرة" : "Ticket ref"} SND-${ticket.reference}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "event.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="flex items-center gap-2 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate("/tickets")} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">{ar ? "تذكرتك" : "Your ticket"}</h1>
      </header>

      <div className="px-4 py-6 space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-lg font-bold text-foreground">
            {ticket.total_egp > 0
              ? ar
                ? "تم تأكيد الدفع"
                : "Payment confirmed"
              : ar
              ? "تم تأكيد حضورك"
              : "Your spot is confirmed"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {ar ? "رقم التذكرة" : "Ticket ref"}: SND-{ticket.reference}
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-4 space-y-2">
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground">
            {dateLabel}
            {ev?.event_time ? ` · ${ev.event_time}` : ""}
          </p>
          {venue && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {venue}
            </p>
          )}
          <div className="flex gap-2 pt-2">
            <button onClick={addToCalendar} className="flex-1 border border-border rounded-xl py-2 text-xs font-semibold flex items-center justify-center gap-1.5">
              <CalendarPlus className="w-3.5 h-3.5" /> {ar ? "أضف للتقويم" : "Add to calendar"}
            </button>
            {ev && (
              <button
                onClick={() => navigate(`/event/${ev.slug || ev.id}`)}
                className="flex-1 border border-border rounded-xl py-2 text-xs font-semibold"
              >
                {ar ? "تفاصيل الحدث" : "Event details"}
              </button>
            )}
          </div>
        </div>

        {/* Receipt */}
        <div className="bg-card rounded-xl shadow-card p-4 space-y-2 text-sm">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {ar ? "إيصال الشراء" : "Receipt"}
          </h3>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{ar ? "الحضور" : "Attendee"}</span>
            <span className="font-medium">{ticket.attendee_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{ar ? "البريد الإلكتروني" : "Email"}</span>
            <span className="font-medium truncate max-w-[55%]">{ticket.attendee_email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{ar ? "عدد التذاكر" : "Tickets"}</span>
            <span className="font-medium">{ticket.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{ar ? "سعر التذكرة" : "Per ticket"}</span>
            <span className="font-medium">
              {ticket.unit_price_egp} {ar ? "ج.م" : "EGP"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{ar ? "رسوم الخدمة" : "Service fee"}</span>
            <span className="font-medium">
              {ticket.service_fee_egp} {ar ? "ج.م" : "EGP"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{ar ? "طريقة الدفع" : "Payment method"}</span>
            <span className="font-medium">{methodLabel}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-bold">
            <span>{ar ? "الإجمالي المدفوع" : "Total paid"}</span>
            <span>
              {ticket.total_egp} {ar ? "ج.م" : "EGP"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground pt-1">
            {new Date(ticket.created_at).toLocaleString(locale)}
          </p>
        </div>

        <button
          onClick={() => navigate("/tickets")}
          className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2"
        >
          <Ticket className="w-4 h-4" /> {ar ? "كل تذاكري" : "All my tickets"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default EventTicketReceipt;
