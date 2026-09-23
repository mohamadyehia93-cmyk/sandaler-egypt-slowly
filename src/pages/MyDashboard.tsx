import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarClock, ChevronRight, Inbox } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import {
  useVisitorActivity,
  isUpcoming,
  isWaiting,
  type ActivityItem,
  type ActivityKind,
} from "@/hooks/useVisitorActivity";

const KIND_LABEL: Record<ActivityKind, { en: string; ar: string }> = {
  booking: { en: "Booking", ar: "حجز" },
  order: { en: "Order", ar: "طلب شراء" },
  reservation: { en: "Request", ar: "طلب" },
  ticket: { en: "Ticket", ar: "تذكرة" },
  session: { en: "Session", ar: "جلسة" },
  pledge: { en: "Support", ar: "دعم" },
  application: { en: "Volunteering", ar: "تطوع" },
  commission: { en: "Commission", ar: "عمل مطلوب" },
};

const STATUS_LABEL: Record<string, { en: string; ar: string }> = {
  pending: { en: "Pending", ar: "بانتظار الرد" },
  pending_payment: { en: "Awaiting payment", ar: "بانتظار الدفع" },
  requested: { en: "Requested", ar: "تم الإرسال" },
  accepted: { en: "Accepted", ar: "مقبول" },
  confirmed: { en: "Confirmed", ar: "مؤكد" },
  paid: { en: "Paid", ar: "مدفوع" },
  completed: { en: "Completed", ar: "مكتمل" },
  fulfilled: { en: "Fulfilled", ar: "تم التسليم" },
  shipped: { en: "Shipped", ar: "تم الشحن" },
  delivered: { en: "Delivered", ar: "تم التوصيل" },
  declined: { en: "Declined", ar: "مرفوض" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
  expired: { en: "Expired", ar: "منتهي" },
  refunded: { en: "Refunded", ar: "مُسترد" },
};

const statusClasses = (status: string) => {
  if (["confirmed", "paid", "completed", "fulfilled", "delivered", "accepted"].includes(status))
    return "bg-success/10 text-success";
  if (["shipped"].includes(status)) return "bg-primary/10 text-primary";
  if (["pending", "pending_payment", "requested"].includes(status)) return "bg-warning/10 text-warning";
  if (["declined", "cancelled", "refunded", "rejected"].includes(status)) return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
};

const FULL_LISTS: { kind: ActivityKind; path: string }[] = [
  { kind: "booking", path: "/bookings" },
  { kind: "order", path: "/orders" },
  { kind: "ticket", path: "/tickets" },
  { kind: "session", path: "/session-requests" },
  { kind: "pledge", path: "/pledges" },
  { kind: "application", path: "/applications" },
  { kind: "commission", path: "/commissions" },
];

const MyDashboard = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const ar = lang === "ar";
  const locale = ar ? "ar-EG" : "en-US";
  const { data: items = [], isLoading } = useVisitorActivity();
  const [filter, setFilter] = useState<ActivityKind | "all">("all");

  const kindsPresent = useMemo(() => {
    const seen = new Set<ActivityKind>();
    items.forEach((i) => seen.add(i.kind));
    return Array.from(seen);
  }, [items]);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.kind === filter)),
    [items, filter],
  );

  const upcoming = filtered.filter(isUpcoming).sort((a, b) => (a.date! < b.date! ? -1 : 1));
  const waiting = filtered.filter(isWaiting);
  const past = filtered.filter((i) => !isUpcoming(i) && !isWaiting(i));

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });

  const Card = ({ item }: { item: ActivityItem }) => {
    const title = ar ? item.title_ar : item.title_en;
    const note = ar ? item.note_ar : item.note_en;
    const status = STATUS_LABEL[item.status] ? (ar ? STATUS_LABEL[item.status].ar : STATUS_LABEL[item.status].en) : item.status;
    return (
      <button
        type="button"
        onClick={() => item.path && navigate(item.path)}
        disabled={!item.path}
        className="w-full bg-card rounded-xl shadow-card p-3 flex gap-3 items-center text-start active:scale-[0.99] transition-transform disabled:active:scale-100"
      >
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
          {item.image ? (
            <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <Inbox className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {ar ? KIND_LABEL[item.kind].ar : KIND_LABEL[item.kind].en}
          </p>
          <p className="text-sm font-semibold text-foreground line-clamp-1">{title}</p>
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {item.date ? fmtDate(item.date) : fmtDate(item.created_at)}
            {note ? ` · ${note}` : ""}
            {item.amount ? ` · ${item.amount} ${ar ? "ج.م" : "EGP"}` : ""}
          </p>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ${statusClasses(item.status)}`}>
          {status}
        </span>
      </button>
    );
  };

  const Group = ({ title, list }: { title: string; list: ActivityItem[] }) =>
    list.length === 0 ? null : (
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-primary-dark">
          {title} <span className="text-muted-foreground font-normal">({list.length})</span>
        </h2>
        {list.map((i) => (
          <Card key={`${i.kind}-${i.id}`} item={i} />
        ))}
      </section>
    );

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1" aria-label={ar ? "رجوع" : "Back"}>
          <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <h1 className="text-lg font-bold">{ar ? "لوحتي" : "My Dashboard"}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        {!user && !authLoading ? (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">{ar ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
            >
              {ar ? "تسجيل الدخول" : "Sign in"}
            </button>
          </div>
        ) : isLoading || authLoading ? (
          <p className="text-center text-sm text-muted-foreground py-12">{ar ? "جاري التحميل..." : "Loading..."}</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <CalendarClock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {ar
                ? "لم تبدأ أي حجز أو طلب بعد. كل ما تحجزه أو تطلبه سيظهر هنا."
                : "You haven't started anything yet. Everything you book or request will show up here."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
            >
              {ar ? "ابدأ الاستكشاف" : "Start exploring"}
            </button>
          </div>
        ) : (
          <>
            {kindsPresent.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                    filter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"
                  }`}
                >
                  {ar ? "الكل" : "All"} ({items.length})
                </button>
                {kindsPresent.map((k) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                      filter === k ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"
                    }`}
                  >
                    {ar ? KIND_LABEL[k].ar : KIND_LABEL[k].en} ({items.filter((i) => i.kind === k).length})
                  </button>
                ))}
              </div>
            )}

            <Group title={ar ? "القادم" : "Upcoming"} list={upcoming} />
            <Group title={ar ? "بانتظار الرد" : "Waiting on a reply"} list={waiting} />
            <Group title={ar ? "سابق" : "Past"} list={past} />

            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-10">
                {ar ? "لا يوجد شيء في هذا القسم." : "Nothing in this section."}
              </p>
            )}
          </>
        )}

        {/* Full lists stay reachable — this view is a summary, not a replacement. */}
        <section className="pt-2">
          <h2 className="text-sm font-bold text-primary-dark mb-2">{ar ? "القوائم الكاملة" : "Full lists"}</h2>
          <div className="bg-card rounded-xl shadow-card divide-y divide-border overflow-hidden">
            {FULL_LISTS.map((l) => (
              <button
                key={l.path}
                onClick={() => navigate(l.path)}
                className="w-full px-4 py-3 flex items-center justify-between text-start"
              >
                <span className="text-sm text-foreground">{ar ? KIND_LABEL[l.kind].ar : KIND_LABEL[l.kind].en}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground rtl:rotate-180" />
              </button>
            ))}
            <button
              onClick={() => navigate("/profile/activity")}
              className="w-full px-4 py-3 flex items-center justify-between text-start"
            >
              <span className="text-sm text-foreground">{ar ? "نشاطك" : "Your activity"}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground rtl:rotate-180" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyDashboard;
