import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, CreditCard, MapPin, Minus, Plus, ShieldCheck, Ticket } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { EventRow, isPastEvent } from "@/lib/eventSort";
import DetailSkeleton from "@/components/DetailSkeleton";
import NotFoundView from "@/components/NotFound";
import SmartImage from "@/components/ui/SmartImage";

const SERVICE_FEE_RATE = 0.05;

const EventCheckout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { user } = useAuth();
  const ar = lang === "ar";

  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"card" | "wallet" | "cash">("card");
  const [submitting, setSubmitting] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchByIdOrSlug("events", id || "") as Promise<EventRow | null>,
    enabled: !!id,
  });

  const { data: soldOut = 0 } = useQuery({
    queryKey: ["event-tickets-sold", event?.id],
    enabled: !!event?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("event_tickets")
        .select("quantity")
        .eq("event_id", event!.id)
        .eq("status", "confirmed");
      if (error) return 0;
      return ((data || []) as { quantity: number }[]).reduce((s, r) => s + r.quantity, 0);
    },
  });

  useEffect(() => {
    if (!user) return;
    setEmail((prev) => prev || user.email || "");
    supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setName((prev) => prev || data.display_name!);
      });
  }, [user]);

  const totals = useMemo(() => {
    const unit = event?.is_free ? 0 : event?.price ?? 0;
    const subtotal = Math.round(unit * quantity);
    const fee = subtotal > 0 ? Math.round(subtotal * SERVICE_FEE_RATE) : 0;
    return { unit: Math.round(unit), subtotal, fee, total: subtotal + fee };
  }, [event, quantity]);

  if (isLoading) return <DetailSkeleton variant="city" />;
  if (!event) return <NotFoundView context="event" />;

  const title = ar ? event.title_ar : event.title_en;
  const venue = ar ? event.venue_ar || event.location_ar : event.venue_en || event.location_en;
  const locale = ar ? "ar-EG" : "en-US";
  const dateLabel = new Date(event.start_date).toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const past = isPastEvent(event);
  const remaining = event.capacity != null ? Math.max(0, event.capacity - soldOut) : null;
  const maxQty = Math.min(10, remaining == null ? 10 : remaining || 1);

  const methods = [
    { id: "card" as const, icon: <CreditCard className="w-4 h-4" />, label: ar ? "بطاقة ائتمان / خصم" : "Credit / debit card" },
    { id: "wallet" as const, icon: <span>📱</span>, label: ar ? "محفظة إلكترونية" : "Mobile wallet" },
    { id: "cash" as const, icon: <span>💵</span>, label: ar ? "الدفع عند الوصول" : "Pay on arrival" },
  ];

  const confirm = async () => {
    if (!user) {
      toast(ar ? "يرجى تسجيل الدخول لشراء التذاكر" : "Please sign in to buy tickets");
      navigate("/login");
      return;
    }
    if (!name.trim() || !email.trim()) {
      toast(ar ? "أدخل الاسم والبريد الإلكتروني" : "Enter your name and email");
      return;
    }
    if (remaining != null && quantity > remaining) {
      toast(ar ? "التذاكر المتاحة غير كافية" : "Not enough tickets left");
      return;
    }
    setSubmitting(true);
    const { data, error } = await (supabase as any)
      .from("event_tickets")
      .insert({
        event_id: event.id,
        user_id: user.id,
        quantity,
        unit_price_egp: totals.unit,
        service_fee_egp: totals.fee,
        total_egp: totals.total,
        attendee_name: name.trim(),
        attendee_email: email.trim(),
        payment_method: method,
        status: "confirmed",
      })
      .select("id")
      .single();
    setSubmitting(false);
    if (error || !data) {
      toast(ar ? "تعذر إتمام الشراء" : "Could not complete the purchase");
      return;
    }
    navigate(`/event-ticket/${data.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <header className="flex items-center gap-2 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground">{ar ? "شراء التذاكر" : "Get tickets"}</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Event summary */}
        <div className="bg-card rounded-xl shadow-card p-3 flex gap-3">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
            {event.image ? <SmartImage src={event.image} alt={title} className="w-full h-full object-cover" /> : null}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground line-clamp-2">{title}</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" /> {dateLabel}
              {event.event_time ? ` · ${event.event_time}` : ""}
            </p>
            {venue && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {venue}
              </p>
            )}
          </div>
        </div>

        {past ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {ar ? "انتهى هذا الحدث" : "This event has ended"}
          </p>
        ) : (
          <>
            {/* Quantity */}
            <div className="bg-card rounded-xl shadow-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{ar ? "عدد التذاكر" : "Tickets"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {event.is_free
                      ? ar
                        ? "دخول مجاني"
                        : "Free admission"
                      : `${totals.unit} ${ar ? "ج.م" : "EGP"} ${ar ? "للتذكرة" : "each"}`}
                    {remaining != null ? ` · ${remaining} ${ar ? "متاحة" : "left"}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-bold w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center disabled:opacity-40"
                    disabled={quantity >= maxQty}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Attendee */}
            <div className="bg-card rounded-xl shadow-card p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">{ar ? "بيانات الحضور" : "Attendee details"}</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={ar ? "الاسم الكامل" : "Full name"}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder={ar ? "البريد الإلكتروني" : "Email"}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"
              />
            </div>

            {/* Payment method */}
            {totals.total > 0 && (
              <div className="bg-card rounded-xl shadow-card p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground">{ar ? "طريقة الدفع" : "Payment method"}</p>
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                      method === m.id ? "border-primary bg-primary/5 font-semibold" : "border-border"
                    }`}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            )}

            {/* Price breakdown */}
            <div className="bg-card rounded-xl shadow-card p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>
                  {totals.unit} {ar ? "ج.م" : "EGP"} × {quantity}
                </span>
                <span>
                  {totals.subtotal} {ar ? "ج.م" : "EGP"}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{ar ? "رسوم الخدمة" : "Service fee"}</span>
                <span>
                  {totals.fee} {ar ? "ج.م" : "EGP"}
                </span>
              </div>
              <div className="flex justify-between font-bold text-foreground border-t border-border pt-2">
                <span>{ar ? "الإجمالي" : "Total"}</span>
                <span>
                  {totals.total} {ar ? "ج.م" : "EGP"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                {ar ? "ستصلك تذكرة مؤكدة مع رقم مرجعي" : "You'll get a confirmed ticket with a reference code"}
              </p>
            </div>
          </>
        )}
      </div>

      {!past && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border px-4 py-3">
          <button
            onClick={confirm}
            disabled={submitting || (remaining != null && remaining < 1)}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Ticket className="w-4 h-4" />
            {remaining != null && remaining < 1
              ? ar
                ? "نفدت التذاكر"
                : "Sold out"
              : submitting
              ? ar
                ? "جاري المعالجة..."
                : "Processing..."
              : totals.total > 0
              ? `${ar ? "ادفع" : "Pay"} ${totals.total} ${ar ? "ج.م" : "EGP"}`
              : ar
              ? "تأكيد الحضور"
              : "Confirm free ticket"}
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCheckout;
