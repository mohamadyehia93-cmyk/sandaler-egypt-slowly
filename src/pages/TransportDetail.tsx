import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Clock, MapPin, Route, ArrowRight, Users, Star, Navigation, CalendarClock, Info,
} from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { supabase } from "@/integrations/supabase/client";
import { transportTypeLabel, hireTypeLabel, priceBasisLabel } from "@/lib/listingTaxonomy";

import WishlistButton from "@/components/WishlistButton";
import ShareButton from "@/components/ShareButton";
import LocationChips from "@/components/LocationChips";
import ProviderBioCard from "@/components/ProviderBioCard";
import MessageOwnerButton from "@/components/MessageOwnerButton";
import MachineTranslatedNote from "@/components/MachineTranslatedNote";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundView from "@/components/NotFound";

const TRANSPORT_EMOJI: Record<string, string> = {
  felucca: "⛵", "tuk-tuk": "🛺", bus: "🚌", "private-car": "🚗", boat: "🛥️",
  "horse-cart": "🐎", "horse-carriage": "🛞", train: "🚆", microbus: "🚐",
  "service-taxi": "🚖", ferry: "⛴️", shuttle: "🚐", camel: "🐪", bicycle: "🚲",
  walking: "🚶", flight: "✈️", cruise: "🛳️", "4x4": "🚙", "donkey-cart": "🫏", balloon: "🎈",
};

/**
 * HONESTY RULE for this page (and every detail page):
 * render ONLY values that exist on this row. No sample schedules, no invented
 * inclusions/policies/FAQs, no safety or refund promises the platform cannot keep.
 */
const TransportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const isAr = lang === "ar";
  const [photoIdx, setPhotoIdx] = useState(0);

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

  const name = isAr ? item.name_ar || item.name_en : item.name_en;
  const description = isAr ? item.description_ar || item.description_en : item.description_en;
  const fromName = isAr ? item.from_ar || item.from_en : item.from_en;
  const toName = isAr ? item.to_ar || item.to_en : item.to_en;
  const departure = isAr ? item.departure_point_ar || item.departure_point_en : item.departure_point_en;
  const schedule = isAr ? item.schedule_ar || item.schedule_en : item.schedule_en;
  const notes = isAr ? item.notes_ar || item.notes_en : item.notes_en;
  const providerName = isAr ? item.provider_name_ar || item.provider_name_en : item.provider_name_en;
  const emoji = TRANSPORT_EMOJI[item.transport_type as string] || "🚐";
  const typeLabel = transportTypeLabel(item.transport_type, lang);

  const photos: string[] = (Array.isArray(item.images) ? item.images.filter(Boolean) : []).length
    ? item.images.filter(Boolean)
    : item.image
      ? [item.image]
      : [];
  const hero = photos[Math.min(photoIdx, Math.max(photos.length - 1, 0))];

  const currency = (item.currency || "EGP").trim();
  const money = (n: number) => `${Number(n || 0).toLocaleString(isAr ? "ar-EG" : "en-US")} ${isAr && currency === "EGP" ? t("common.egp") : currency}`;
  const basisLabel = priceBasisLabel(item.price_basis, lang) || (isAr ? "للشخص" : "per person");

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground flex-1 truncate">{name}</h1>
        <ShareButton title={name} className="p-1.5 rounded-full hover:bg-secondary" />
        <WishlistButton itemType="transport" itemId={item?.id} className="p-1.5 rounded-full hover:bg-secondary" />
      </header>

      {/* GALLERY when the row has photos, emoji hero when it doesn't */}
      {photos.length > 0 ? (
        <div>
          <div className="h-[240px] bg-secondary">
            <img src={hero} alt={name} className="w-full h-full object-cover" />
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-2">
              {photos.map((p, i) => (
                <button
                  key={`${p}-${i}`}
                  onClick={() => setPhotoIdx(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === photoIdx ? "border-primary" : "border-transparent"}`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 bg-surface">
          <span className="text-6xl mb-3">{emoji}</span>
          <h2 className="text-xl font-bold text-foreground mb-1 text-center px-4">{name}</h2>
        </div>
      )}

      <div className="px-4 pt-4 space-y-6">
        <div>
          <p className="text-lg font-bold text-primary-dark">
            {money(item.price)} <span className="text-xs font-medium text-muted-foreground">{basisLabel}</span>
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {typeLabel && <span className="text-[11px] font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">{typeLabel}</span>}
            {item.hire_type && (
              <span className="text-[11px] font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
                {hireTypeLabel(item.hire_type, lang)}
              </span>
            )}
            {item.rating > 0 && item.reviews_count > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{item.rating} ({item.reviews_count})
              </span>
            )}
          </div>
          <LocationChips cityId={item.city_id} regionId={item.region_id} className="mt-2" />
        </div>

        {/* Description first — it's the provider's own words */}
        {description && (
          <section>
            <h2 className="text-base font-bold text-primary-dark mb-2">{isAr ? "عن الرحلة" : "About this ride"}</h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{description}</p>
            <MachineTranslatedNote meta={item.translation_meta} field={isAr ? "description_ar" : "description_en"} />
          </section>
        )}

        {/* Route */}
        {(fromName || toName) && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-card border border-border">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <div className="w-0.5 h-8 bg-primary/30" />
              <div className="w-3 h-3 rounded-full border-2 border-primary bg-background" />
            </div>
            <div className="flex-1 space-y-4">
              {fromName && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{isAr ? "من" : "From"}
                  </p>
                  <p className="text-sm font-semibold text-foreground">{fromName}</p>
                </div>
              )}
              {toName && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Navigation className="w-3 h-3" />{isAr ? "إلى" : "To"}
                  </p>
                  <p className="text-sm font-semibold text-foreground">{toName}</p>
                </div>
              )}
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        {/* Quick Info — only real columns */}
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
          {departure && (
            <div className="p-3 rounded-lg bg-surface flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">{isAr ? "نقطة الانطلاق" : "Departure point"}</p>
                <p className="text-sm font-semibold text-foreground truncate">{departure}</p>
              </div>
            </div>
          )}
        </div>

        {/* Schedule / notes — free text the operator wrote */}
        {schedule && (
          <section>
            <h2 className="text-base font-bold text-primary-dark mb-2 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-primary" />{isAr ? "المواعيد" : "Schedule"}
            </h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{schedule}</p>
          </section>
        )}
        {notes && (
          <section>
            <h2 className="text-base font-bold text-primary-dark mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />{isAr ? "ملاحظات المزود" : "Operator notes"}
            </h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{notes}</p>
          </section>
        )}
      </div>

      {/* OPERATOR — real profile when claimed, honest note when not */}
      {item.provider_id ? (
        <>
          <ProviderBioCard providerId={item.provider_id} roleLabel={{ en: "Transport provider", ar: "مقدم النقل" }} />
          <div className="mx-4 mt-3 flex">
            <MessageOwnerButton ownerId={item.provider_id} kind="provider" label={isAr ? "مراسلة المزود" : "Message provider"} />
          </div>
        </>
      ) : (
        <div className="mx-4 mt-6 rounded-xl bg-card border border-border p-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{isAr ? "مقدم النقل" : "Transport provider"}</h2>
          {providerName && <p className="text-sm font-bold text-foreground">{providerName}</p>}
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {isAr
              ? "هذه الخدمة غير مُدارة على التطبيق بعد، لذا لا يمكن مراسلة المزود من هنا."
              : "This service isn't managed on the app yet, so the provider can't be messaged here."}
          </p>
        </div>
      )}

      {/* Similar transport — always last */}
      {similar && similar.length > 0 && (
        <section className="px-4 mt-6">
          <h2 className="text-base font-bold text-primary-dark mb-3">{isAr ? "خيارات نقل مشابهة" : "Similar rides"}</h2>
          <div className="grid grid-cols-3 gap-3">
            {similar.map((s: any) => (
              <div key={s.id} onClick={() => navigate(`/transport/${s.slug || s.id}`)}
                   className="rounded-lg shadow-card bg-card p-3 cursor-pointer">
                <span className="text-3xl">{TRANSPORT_EMOJI[s.transport_type] || "🚐"}</span>
                <h3 className="text-xs font-semibold text-foreground line-clamp-2 mt-2">
                  {isAr ? s.name_ar || s.name_en : s.name_en}
                </h3>
                <p className="text-sm font-bold text-primary-dark mt-1">
                  {Number(s.price || 0).toLocaleString(isAr ? "ar-EG" : "en-US")}{" "}
                  {isAr && (s.currency || "EGP") === "EGP" ? t("common.egp") : s.currency || "EGP"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Request bar — no payment is taken anywhere in the app */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{money(item.price)}</span>
          <span className="text-xs text-muted-foreground block">{basisLabel}</span>
        </div>
        <button onClick={() => navigate(`/booking?type=transport&id=${item.id}`)} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {isAr ? "إرسال طلب" : "Send request"}
        </button>
      </div>
    </div>
  );
};

export default TransportDetail;
