import { ArrowLeft, Share2, MapPin, Clock, Users, Calendar, MapPinned, Sparkles, Backpack, Navigation2, ShieldCheck, HelpCircle, Mountain, Languages, Award, AlertTriangle, ChevronDown } from "lucide-react";
import WishlistButton from "@/components/WishlistButton";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { supabase } from "@/integrations/supabase/client";
import DetailTestimonials from "@/components/DetailTestimonials";
import ProviderBioCard from "@/components/ProviderBioCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import NotFoundView from "@/components/NotFound";

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", id],
    queryFn: () => fetchByIdOrSlug("trips", id!),
    enabled: !!id,
  });

  const { data: similar = [] } = useQuery({
    queryKey: ["trip-similar", trip?.id, trip?.region_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("trips")
        .select("id, slug, title_en, title_ar, image, price, duration_days, route_en, route_ar")
        .eq("status", "published")
        .eq("region_id", trip!.region_id)
        .neq("id", trip!.id)
        .limit(6);
      return data || [];
    },
    enabled: !!trip?.id && !!trip?.region_id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!trip) return <NotFoundView context="trip" />;

  const title = lang === "ar" ? trip.title_ar : trip.title_en;
  const description = lang === "ar" ? trip.description_ar : trip.description_en;
  const route = lang === "ar" ? trip.route_ar : trip.route_en;
  const inclusions = lang === "ar" ? (trip.inclusions_ar || []) : (trip.inclusions_en || []);
  const exclusions = lang === "ar" ? (trip.exclusions_ar || []) : (trip.exclusions_en || []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative">
        <img src={trip.image || "/placeholder.svg"} alt={title} className="w-full h-64 object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <WishlistButton />
        </div>
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-foreground mb-1">{title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          {route && <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> {route}</span>}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {trip.duration_days && (
            <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" /> {trip.duration_days === 1 ? (lang === "ar" ? "يوم كامل" : "Full Day") : `${trip.duration_days} ${lang === "ar" ? "أيام" : "days"}`}
            </span>
          )}
          {trip.capacity_max && (
            <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
              <Users className="w-3.5 h-3.5" /> {lang === "ar" ? `حتى ${trip.capacity_max} شخص` : `Up to ${trip.capacity_max} guests`}
            </span>
          )}
          {trip.date && (
            <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
              <Calendar className="w-3.5 h-3.5" /> {trip.date}
            </span>
          )}
        </div>

        {description && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "عن الرحلة" : "About This Trip"}</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{description}</p>
          </>
        )}

        {/* Organizer Bio */}
        {trip.organizer_id && <ProviderBioCard providerId={trip.organizer_id} roleLabel={{ en: "Trip Organizer", ar: "منظم الرحلة" }} />}

        {/* Itinerary */}
        {(() => {
          const itinerary = (lang === "ar" ? trip.itinerary_ar : trip.itinerary_en) as
            | Array<{ day: number; title: string; stops: Array<{ time: string; title: string; desc?: string }> }>
            | null;
          if (!itinerary || itinerary.length === 0) return null;
          return (
            <div className="mt-6">
              <h2 className="text-base font-bold text-primary-dark mb-3 flex items-center gap-2">
                <MapPinned className="w-4 h-4 text-primary" />
                {lang === "ar" ? "البرنامج اليومي" : "Day-by-Day Itinerary"}
              </h2>
              <div className="space-y-4 mb-6">
                {itinerary.map((day) => (
                  <div key={day.day} className="rounded-xl bg-surface border border-border overflow-hidden">
                    <div className="px-3 py-2 bg-primary/10 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                        {lang === "ar" ? `${day.day}` : `D${day.day}`}
                      </span>
                      <span className="text-sm font-bold text-primary-dark">{day.title}</span>
                    </div>
                    <ol className="relative px-3 py-3 space-y-3">
                      {day.stops?.map((stop, i) => (
                        <li key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] font-bold text-primary tabular-nums">{stop.time}</span>
                            {i < day.stops.length - 1 && <span className="w-px flex-1 bg-border mt-1" />}
                          </div>
                          <div className="flex-1 pb-1">
                            <p className="text-sm font-semibold text-foreground leading-tight">{stop.title}</p>
                            {stop.desc && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{stop.desc}</p>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* What's Included */}
        {inclusions.length > 0 && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-3 mt-6">{lang === "ar" ? "ما يشمله السعر" : "What's Included"}</h2>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {inclusions.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
                  <span className="text-base">✅</span>
                  <span className="text-xs text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {exclusions.length > 0 && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "غير مشمول" : "Not Included"}</h2>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {exclusions.map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
                  <span className="text-base">❌</span>
                  <span className="text-xs text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Highlights */}
        <h2 className="text-base font-bold text-primary-dark mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {lang === "ar" ? "أبرز ما في الرحلة" : "Trip Highlights"}
        </h2>
        <div className="space-y-2 mb-6">
          {(lang === "ar"
            ? [
                "تجربة محلية أصيلة بعيداً عن المسارات السياحية المعتادة",
                "مرشد محلي يعرف القصص والأسرار التي لا توجد في الكتب",
                "وقت كافٍ للاستمتاع والتصوير وعدم التسرع",
                "وجبات من المطبخ المحلي وتجارب طعام لا تُنسى",
              ]
            : [
                "An authentic local experience away from the usual tourist trail",
                "A local guide who shares stories and secrets you won't find in books",
                "Plenty of time to enjoy, photograph, and travel without rushing",
                "Meals from the local kitchen and food experiences you'll remember",
              ]
          ).map((h, i) => (
            <div key={i} className="flex gap-2 items-start p-3 rounded-xl bg-primary/5 border border-primary/10">
              <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <p className="text-xs text-foreground leading-relaxed">{h}</p>
            </div>
          ))}
        </div>

        {/* Trip Details Grid */}
        <h2 className="text-base font-bold text-primary-dark mb-3">
          {lang === "ar" ? "تفاصيل الرحلة" : "Trip Details"}
        </h2>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            { icon: Mountain, label: lang === "ar" ? "المستوى" : "Difficulty", value: lang === "ar" ? "متوسط" : "Moderate" },
            { icon: Languages, label: lang === "ar" ? "اللغات" : "Languages", value: lang === "ar" ? "العربية، الإنجليزية" : "Arabic, English" },
            { icon: Users, label: lang === "ar" ? "السن المناسب" : "Age suitability", value: lang === "ar" ? "10+ سنة" : "10+ years" },
            { icon: Award, label: lang === "ar" ? "النوع" : "Type", value: trip.trip_type === "multi-day" ? (lang === "ar" ? "متعددة الأيام" : "Multi-day") : (lang === "ar" ? "يوم واحد" : "Single day") },
          ].map((d, i) => (
            <div key={i} className="p-3 rounded-xl bg-surface border border-border">
              <div className="flex items-center gap-1.5 mb-1">
                <d.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{d.label}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{d.value}</p>
            </div>
          ))}
        </div>

        {/* What to Bring */}
        <h2 className="text-base font-bold text-primary-dark mb-3 flex items-center gap-2">
          <Backpack className="w-4 h-4 text-primary" />
          {lang === "ar" ? "ماذا تحضر معك" : "What to Bring"}
        </h2>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {(lang === "ar"
            ? ["حذاء مريح للمشي", "ماء وقبعة", "كاميرا", "كريم واقٍ من الشمس", "ملابس قطنية خفيفة", "بطاقة هوية"]
            : ["Comfortable walking shoes", "Water & a hat", "Camera", "Sunscreen", "Light cotton clothes", "ID card"]
          ).map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="text-xs text-foreground">{item}</span>
            </div>
          ))}
        </div>

        {/* Meeting Point */}
        <h2 className="text-base font-bold text-primary-dark mb-3 flex items-center gap-2">
          <Navigation2 className="w-4 h-4 text-primary" />
          {lang === "ar" ? "نقطة اللقاء" : "Meeting Point"}
        </h2>
        <div className="rounded-xl bg-surface border border-border p-3 mb-6">
          <p className="text-sm font-semibold text-foreground mb-1">
            {route || (lang === "ar" ? "سيتم التواصل معك بالموقع الدقيق بعد الحجز" : "Exact location shared after booking")}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang === "ar"
              ? "ستصلك رسالة بالتفاصيل الدقيقة وموعد اللقاء قبل بدء الرحلة بـ 24 ساعة. يرجى الحضور قبل 15 دقيقة من الموعد."
              : "You'll receive a message with the exact details and pickup time 24 hours before the trip. Please arrive 15 minutes early."}
          </p>
        </div>

        {/* Cancellation Policy */}
        <h2 className="text-base font-bold text-primary-dark mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          {lang === "ar" ? "سياسة الإلغاء" : "Cancellation Policy"}
        </h2>
        <div className="rounded-xl border border-border bg-surface p-3 mb-6 space-y-2">
          {[
            { color: "success", title: lang === "ar" ? "قبل 7 أيام أو أكثر" : "7+ days before", desc: lang === "ar" ? "استرداد كامل 100%" : "Full 100% refund" },
            { color: "amber", title: lang === "ar" ? "قبل 3-7 أيام" : "3–7 days before", desc: lang === "ar" ? "استرداد 50%" : "50% refund" },
            { color: "danger", title: lang === "ar" ? "أقل من 48 ساعة" : "Under 48 hours", desc: lang === "ar" ? "لا يوجد استرداد" : "No refund" },
          ].map((p, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  p.color === "success" ? "bg-success" : p.color === "amber" ? "bg-amber" : "bg-destructive"
                }`}
              />
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">{p.title}</p>
                <p className="text-[11px] text-muted-foreground">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Important Info */}
        <div className="rounded-xl bg-amber/10 border border-amber/30 p-3 mb-6 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">
              {lang === "ar" ? "معلومات مهمة" : "Important to know"}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {lang === "ar"
                ? "الرحلة قد تتأثر بالأحوال الجوية. سيتم إعلامك بأي تعديلات في وقتها. التأمين الشخصي مسؤولية المسافر."
                : "The trip may be affected by weather conditions. You'll be notified of any changes. Personal travel insurance is the traveler's responsibility."}
            </p>
          </div>
        </div>

        {/* FAQ */}
        <h2 className="text-base font-bold text-primary-dark mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" />
          {lang === "ar" ? "أسئلة شائعة" : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-2 mb-6">
          {(lang === "ar"
            ? [
                { q: "هل الرحلة مناسبة للأطفال؟", a: "نعم، مناسبة للأطفال من سن 10 سنوات بصحبة ولي الأمر." },
                { q: "ماذا يحدث في حالة المطر؟", a: "في حالة سوء الأحوال الجوية الشديدة، يتم تأجيل الرحلة لتاريخ آخر أو استرداد المبلغ كاملاً." },
                { q: "هل توفرون نقل من الفندق؟", a: "نوفر نقطة لقاء مركزية. يمكن ترتيب نقل خاص بتكلفة إضافية." },
                { q: "هل أحتاج لمستوى لياقة معين؟", a: "مستوى لياقة متوسط يكفي. سنخبرك مسبقاً بأي مشي طويل." },
              ]
            : [
                { q: "Is this trip suitable for children?", a: "Yes, suitable for children 10+ accompanied by a parent or guardian." },
                { q: "What happens if it rains?", a: "In case of severe weather, the trip is rescheduled or fully refunded." },
                { q: "Do you offer hotel pickup?", a: "We provide a central meeting point. Private pickup can be arranged for an additional fee." },
                { q: "Do I need a certain fitness level?", a: "A moderate fitness level is enough. We'll let you know in advance about any long walks." },
              ]
          ).map((f, i) => {
            const open = openFaq === i;
            return (
              <button
                key={i}
                onClick={() => setOpenFaq(open ? null : i)}
                className="w-full text-start rounded-xl border border-border bg-surface overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <span className="text-xs font-semibold text-foreground flex-1">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
                </div>
                {open && (
                  <p className="px-3 pb-3 text-[11px] text-muted-foreground leading-relaxed">{f.a}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Similar Trips */}
        {similar.length > 0 && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-3">
              {lang === "ar" ? "رحلات مشابهة" : "Similar Trips"}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 mb-6 snap-x snap-mandatory">
              {similar.map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/trip/${s.slug || s.id}`)}
                  className="snap-start shrink-0 w-44 text-start rounded-xl overflow-hidden bg-surface border border-border"
                >
                  <img src={s.image || "/placeholder.svg"} alt={lang === "ar" ? s.title_ar : s.title_en} className="w-full h-24 object-cover" />
                  <div className="p-2">
                    <p className="text-xs font-semibold text-foreground line-clamp-2 mb-1">
                      {lang === "ar" ? s.title_ar : s.title_en}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {s.duration_days === 1 ? (lang === "ar" ? "يوم" : "1 day") : `${s.duration_days} ${lang === "ar" ? "أيام" : "days"}`}
                      </span>
                      <span className="text-xs font-bold text-primary">{s.price} {t("common.egp")}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        <DetailTestimonials />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{trip.price} {t("common.egp")}</span>
          <span className="text-xs text-muted-foreground block">{lang === "ar" ? "للشخص" : "per person"}</span>
        </div>
        <button onClick={() => navigate(`/booking?type=trip&id=${trip.id}`)} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {t("common.book")}
        </button>
      </div>
    </div>
  );
};

export default TripDetail;
