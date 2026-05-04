import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, MapPin, Route, ArrowRight, Users, Calendar, Star,
  ShieldCheck, Luggage, Wifi, Snowflake, CreditCard, Phone, AlertTriangle,
  CheckCircle2, XCircle, HelpCircle, Navigation, Info,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { supabase } from "@/integrations/supabase/client";
import WishlistButton from "@/components/WishlistButton";
import ProviderBioCard from "@/components/ProviderBioCard";
import CityBadge from "@/components/CityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundView from "@/components/NotFound";

const TRANSPORT_EMOJI: Record<string, string> = {
  felucca: "⛵", "tuk-tuk": "🛺", bus: "🚌", "private-car": "🚗", boat: "🛥️",
  "horse-cart": "🐎", "horse-carriage": "🛞", train: "🚆", microbus: "🚐",
  "service-taxi": "🚖", ferry: "⛴️", shuttle: "🚐", camel: "🐪", bicycle: "🚲",
  walking: "🚶", flight: "✈️", cruise: "🛳️", "4x4": "🚙", "donkey-cart": "🫏", balloon: "🎈",
};

const TransportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const isAr = lang === "ar";

  const { data: item, isLoading } = useQuery({
    queryKey: ["transport", id],
    queryFn: () => fetchByIdOrSlug("transport", id!),
    enabled: !!id,
  });

  const { data: similar } = useQuery({
    queryKey: ["transport-similar", item?.id, item?.city_id, item?.transport_type],
    enabled: !!item,
    queryFn: async () => {
      const { data } = await supabase
        .from("transport").select("*").eq("status", "published")
        .neq("id", item!.id).or(`city_id.eq.${item!.city_id},transport_type.eq.${item!.transport_type}`)
        .limit(6);
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    );
  }

  if (!item) return <NotFoundView context="transport" />;

  const name = isAr ? item.name_ar : item.name_en;
  const description = isAr ? item.description_ar : item.description_en;
  const fromName = isAr ? item.from_ar : item.from_en;
  const toName = isAr ? item.to_ar : item.to_en;
  const emoji = TRANSPORT_EMOJI[item.transport_type as string] || "🚐";

  const highlights = isAr
    ? ["سائق محلي خبير بالمنطقة", "نقطة لقاء مرنة في وسط المدينة", "تجربة أصيلة وغير مزدحمة", "أسعار شفافة بدون رسوم خفية"]
    : ["Experienced local driver who knows the area", "Flexible meet-up point in the city center", "Authentic, uncrowded ride", "Transparent pricing — no hidden fees"];

  const inclusions = isAr
    ? ["مقعد مخصص", "تكييف هواء", "زجاجة ماء", "تأمين أساسي"]
    : ["Dedicated seat", "Air conditioning", "Bottled water", "Basic insurance"];

  const exclusions = isAr
    ? ["البقشيش (اختياري)", "الوجبات والمشروبات الإضافية", "رسوم الدخول للمواقع"]
    : ["Tip (optional)", "Extra food & drinks", "Site entrance fees"];

  const policies = [
    { icon: CreditCard, t: isAr ? "الدفع نقدًا أو إلكترونيًا" : "Pay by cash or card" },
    { icon: ShieldCheck, t: isAr ? "إلغاء مجاني قبل 24 ساعة" : "Free cancellation up to 24h before" },
    { icon: Luggage, t: isAr ? "حقيبة واحدة لكل راكب" : "One bag per passenger" },
    { icon: Snowflake, t: isAr ? "مكيّف الهواء متاح" : "Air-conditioned" },
    { icon: Wifi, t: isAr ? "Wi-Fi (حسب التوفر)" : "Wi-Fi (when available)" },
    { icon: Phone, t: isAr ? "تواصل مباشر مع السائق" : "Direct driver contact" },
  ];

  const schedule = isAr
    ? [
        { time: "06:00", label: "الرحلة الأولى" },
        { time: "10:00", label: "رحلة منتصف الصباح" },
        { time: "14:00", label: "رحلة بعد الظهر" },
        { time: "18:00", label: "الرحلة المسائية" },
      ]
    : [
        { time: "06:00", label: "Early departure" },
        { time: "10:00", label: "Mid-morning" },
        { time: "14:00", label: "Afternoon" },
        { time: "18:00", label: "Evening" },
      ];

  const faqs = isAr
    ? [
        { q: "هل يمكنني الحجز في نفس اليوم؟", a: "نعم، الحجز متاح حسب توفر المقاعد. يُفضّل الحجز قبل 3 ساعات على الأقل." },
        { q: "ماذا أفعل إن تأخرت؟", a: "تواصل مع السائق مباشرة من خلال التطبيق؛ سيُنتظرك حتى 15 دقيقة دون رسوم إضافية." },
        { q: "هل التذكرة قابلة للاسترداد؟", a: "نعم، استرداد كامل عند الإلغاء قبل 24 ساعة من موعد الانطلاق." },
        { q: "هل يمكن اصطحاب الأطفال؟", a: "بالتأكيد. الأطفال أقل من 4 سنوات مجانًا على حضن الوالدين." },
      ]
    : [
        { q: "Can I book on the same day?", a: "Yes — subject to seat availability. We recommend booking at least 3 hours ahead." },
        { q: "What if I'm running late?", a: "Contact the driver directly through the app. They'll wait up to 15 minutes at no extra charge." },
        { q: "Is the ticket refundable?", a: "Yes — full refund when you cancel 24 hours before departure." },
        { q: "Can I bring children?", a: "Of course. Children under 4 ride free on a parent's lap." },
      ];

  const tips = isAr
    ? ["احضر قبل 10 دقائق من موعد الانطلاق", "احتفظ ببعض الفكة لرسوم بسيطة", "احمل ماءً إضافيًا في الأيام الحارة"]
    : ["Arrive 10 minutes before departure", "Keep small change handy for tolls", "Bring extra water on hot days"];

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground flex-1 truncate">{name}</h1>
        <WishlistButton className="p-1.5 rounded-full hover:bg-secondary" />
      </header>

      {/* Hero */}
      <div className="flex flex-col items-center py-8 bg-surface">
        <span className="text-6xl mb-3">{emoji}</span>
        <h2 className="text-xl font-bold text-foreground mb-1 text-center px-4">{name}</h2>
        {item.transport_type && (
          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{item.transport_type}</span>
        )}
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          {item.rating > 0 && (
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{item.rating} ({item.reviews_count})</span>
          )}
          {item.city_id && <CityBadge cityId={item.city_id} />}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6">
        {/* Route */}
        {fromName && toName && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-card border border-border">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <div className="w-0.5 h-8 bg-primary/30" />
              <div className="w-3 h-3 rounded-full border-2 border-primary bg-background" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{isAr ? "من" : "From"}</p>
                <p className="text-sm font-semibold text-foreground">{fromName}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{isAr ? "إلى" : "To"}</p>
                <p className="text-sm font-semibold text-foreground">{toName}</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3">
          {item.duration && (
            <div className="p-3 rounded-lg bg-surface flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">{isAr ? "المدة" : "Duration"}</p>
                <p className="text-sm font-semibold text-foreground">{item.duration}</p>
              </div>
            </div>
          )}
          {item.frequency && (
            <div className="p-3 rounded-lg bg-surface flex items-center gap-2">
              <Route className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">{isAr ? "التكرار" : "Frequency"}</p>
                <p className="text-sm font-semibold text-foreground">{item.frequency}</p>
              </div>
            </div>
          )}
          {item.capacity && (
            <div className="p-3 rounded-lg bg-surface flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">{isAr ? "السعة" : "Capacity"}</p>
                <p className="text-sm font-semibold text-foreground">{item.capacity} {isAr ? "راكب" : "pax"}</p>
              </div>
            </div>
          )}
          <div className="p-3 rounded-lg bg-surface flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">{isAr ? "متاح" : "Available"}</p>
              <p className="text-sm font-semibold text-foreground">{isAr ? "يوميًا" : "Daily"}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <section>
            <h2 className="text-base font-bold text-primary-dark mb-2">{isAr ? "عن الرحلة" : "About This Ride"}</h2>
            <p className="text-sm text-foreground leading-relaxed">{description}</p>
          </section>
        )}

        {/* Highlights */}
        <section>
          <h2 className="text-base font-bold text-primary-dark mb-3">{isAr ? "أبرز ما يميزها" : "Highlights"}</h2>
          <ul className="space-y-2">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Schedule */}
        <section>
          <h2 className="text-base font-bold text-primary-dark mb-3">{isAr ? "جدول الرحلات" : "Schedule"}</h2>
          <div className="grid grid-cols-2 gap-2">
            {schedule.map((s, i) => (
              <div key={i} className="p-3 rounded-lg border border-border bg-card flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">{s.time}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pickup & Dropoff */}
        <section>
          <h2 className="text-base font-bold text-primary-dark mb-3">{isAr ? "نقطة الانطلاق والوصول" : "Pickup & Drop-off"}</h2>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-card border border-border flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-[11px] text-muted-foreground">{isAr ? "موقع الانطلاق" : "Pickup point"}</p>
                <p className="text-sm font-semibold text-foreground">{fromName || (isAr ? "وسط المدينة" : "City center")}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border flex items-start gap-3">
              <Navigation className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-[11px] text-muted-foreground">{isAr ? "موقع الوصول" : "Drop-off point"}</p>
                <p className="text-sm font-semibold text-foreground">{toName || (isAr ? "حسب الطلب" : "On request")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included / Excluded */}
        <section className="grid gap-4">
          <div>
            <h2 className="text-base font-bold text-primary-dark mb-2">{isAr ? "يشمل" : "What's Included"}</h2>
            <ul className="space-y-1.5">
              {inclusions.map((x, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-base font-bold text-primary-dark mb-2">{isAr ? "لا يشمل" : "Not Included"}</h2>
            <ul className="space-y-1.5">
              {exclusions.map((x, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <XCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Policies & Amenities */}
        <section>
          <h2 className="text-base font-bold text-primary-dark mb-3">{isAr ? "السياسات والمميزات" : "Policies & Amenities"}</h2>
          <div className="grid grid-cols-2 gap-2">
            {policies.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="p-3 rounded-lg bg-surface flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs text-foreground">{p.t}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tips */}
        <section className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm font-bold text-amber-900">{isAr ? "نصائح للمسافر" : "Traveler Tips"}</h3>
          </div>
          <ul className="space-y-1 text-xs text-amber-900">
            {tips.map((tp, i) => <li key={i}>• {tp}</li>)}
          </ul>
        </section>

        {/* Safety */}
        <section className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-primary-dark">{isAr ? "السلامة أولًا" : "Safety First"}</h3>
          </div>
          <p className="text-xs text-foreground leading-relaxed">
            {isAr
              ? "جميع المركبات يتم فحصها دوريًا، والسائقون مرخّصون ومُدرَّبون. في حالة الطوارئ، يمكنك الاتصال بفريق الدعم على مدار الساعة عبر التطبيق."
              : "All vehicles are regularly inspected and drivers are licensed and trained. In an emergency, reach our 24/7 support team directly from the app."}
          </p>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-base font-bold text-primary-dark mb-3">{isAr ? "أسئلة شائعة" : "Frequently Asked"}</h2>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <details key={i} className="p-3 rounded-lg bg-card border border-border">
                <summary className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  {f.q}
                </summary>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {item.provider_id && <ProviderBioCard providerId={item.provider_id} roleLabel={{ en: "Transport Provider", ar: "مقدم النقل" }} />}

      {/* Similar transport */}
      {similar && similar.length > 0 && (
        <section className="px-4 mt-6">
          <h2 className="text-base font-bold text-primary-dark mb-3">{isAr ? "خيارات نقل مشابهة" : "Similar Rides"}</h2>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
            {similar.map((s: any) => (
              <div key={s.id} onClick={() => navigate(`/transport/${s.slug || s.id}`)}
                   className="min-w-[160px] rounded-lg shadow-card bg-card p-3 cursor-pointer">
                <span className="text-3xl">{TRANSPORT_EMOJI[s.transport_type] || "🚐"}</span>
                <h3 className="text-xs font-semibold text-foreground line-clamp-2 mt-2">
                  {isAr ? s.name_ar : s.name_en}
                </h3>
                <p className="text-sm font-bold text-primary-dark mt-1">{s.price} {t("common.egp")}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Booking bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{item.price} {t("common.egp")}</span>
          <span className="text-xs text-muted-foreground block">{isAr ? "للشخص" : "per person"}</span>
        </div>
        <button onClick={() => navigate(`/booking?type=transport&id=${item.id}`)} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {t("common.book")}
        </button>
      </div>
    </div>
  );
};

export default TransportDetail;
