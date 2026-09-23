import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, Sparkles, Map, ClipboardList, ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMyWishlist } from "@/hooks/useWishlist";
import { useVisitorActivity, isUpcoming, isWaiting } from "@/hooks/useVisitorActivity";

const KIND_LABEL: Record<string, { en: string; ar: string }> = {
  booking: { en: "Experience booking", ar: "حجز تجربة" },
  order: { en: "Order", ar: "طلب شراء" },
  reservation: { en: "Request", ar: "طلب" },
  ticket: { en: "Event ticket", ar: "تذكرة فعالية" },
  session: { en: "Session request", ar: "طلب جلسة" },
  pledge: { en: "Support pledge", ar: "تعهّد دعم" },
  application: { en: "Volunteer application", ar: "طلب تطوّع" },
  commission: { en: "Commission", ar: "عمل مطلوب" },
};

/** Plan hub: saved items, the planner, saved itineraries, and live requests. */
const Plan = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: wishlist = [] } = useMyWishlist();
  const { data: activity = [] } = useVisitorActivity();

  const { data: itineraries = [] } = useQuery({
    queryKey: ["saved-itineraries", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("saved_itineraries")
        .select("id, title, destination, duration_days, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const upcoming = activity.filter(isUpcoming);
  const waiting = activity.filter(isWaiting);
  const live = [...upcoming, ...waiting].slice(0, 5);

  const tiles = [
    {
      icon: Heart,
      label: { en: "Saved items", ar: "المحفوظات" },
      count: wishlist.length,
      path: "/wishlists",
    },
    {
      icon: Sparkles,
      label: { en: "Plan with Sandal", ar: "خطّط مع صندل" },
      count: null as number | null,
      path: "/planner",
    },
    {
      icon: Map,
      label: { en: "My itineraries", ar: "خطط رحلاتي" },
      count: itineraries.length,
      path: "/planner",
    },
    {
      icon: ClipboardList,
      label: { en: "Bookings & requests", ar: "الحجوزات والطلبات" },
      count: activity.length,
      path: "/profile/dashboard",
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <PageHeader title={lang === "ar" ? "خطّط" : "Plan"} />
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {tiles.map(({ icon: Icon, label, count, path }) => (
            <button
              key={label.en}
              onClick={() => navigate(path)}
              className="focus-ring flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-3 text-start shadow-card"
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-[13px] font-bold text-foreground">{label[lang]}</span>
              {count !== null && (
                <span className="text-[11px] text-muted-foreground">
                  {count} {lang === "ar" ? "عنصر" : count === 1 ? "item" : "items"}
                </span>
              )}
            </button>
          ))}
        </div>

        <h2 className="mt-7 mb-2 text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
          {lang === "ar" ? "القادم وقيد الانتظار" : "Upcoming & waiting"}
        </h2>
        {live.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-[13px] text-muted-foreground">
            {lang === "ar"
              ? "لا يوجد شيء قادم بعد. ابدأ من صفحة اكتشف."
              : "Nothing coming up yet. Start from Discover."}
          </p>
        ) : (
          <div className="space-y-2">
            {live.map((item) => (
              <button
                key={`${item.kind}-${item.id}`}
                onClick={() => item.path && navigate(item.path)}
                className="focus-ring flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-start shadow-card"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-foreground">
                    {lang === "ar" ? item.title_ar : item.title_en}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {KIND_LABEL[item.kind]?.[lang]}
                    {item.date
                      ? ` · ${new Date(item.date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}`
                      : ""}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate("/profile/dashboard")}
          className="focus-ring mt-4 w-full rounded-lg bg-primary/10 py-2 text-[13px] font-bold text-primary"
        >
          {lang === "ar" ? "عرض كل الحجوزات والطلبات" : "See all bookings & requests"}
        </button>
      </div>
    </div>
  );
};

export default Plan;
