import MessageOwnerButton from "@/components/MessageOwnerButton";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, MapPin, Route, ArrowRight, Users, Star, Navigation,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { supabase } from "@/integrations/supabase/client";
import WishlistButton from "@/components/WishlistButton";
import ProviderBioCard from "@/components/ProviderBioCard";
import CityBadge from "@/components/CityBadge";
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

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground flex-1 truncate">{name}</h1>
        <WishlistButton itemType="transport" itemId={item?.id} className="p-1.5 rounded-full hover:bg-secondary" />
      </header>

      {/* Hero */}
      <div className="flex flex-col items-center py-8 bg-surface">
        <span className="text-6xl mb-3">{emoji}</span>
        <h2 className="text-xl font-bold text-foreground mb-1 text-center px-4">{name}</h2>
        {item.transport_type && (
          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{item.transport_type}</span>
        )}
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          {item.rating > 0 && item.reviews_count > 0 && (
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{item.rating} ({item.reviews_count})</span>
          )}
          {item.city_id && <CityBadge cityId={item.city_id} />}
        </div>
      </div>

      <div className="px-4 pt-5 space-y-6">
        {/* Description first — it's the provider's own words */}
        {description && (
          <section>
            <h2 className="text-base font-bold text-primary-dark mb-2">{isAr ? "عن الرحلة" : "About This Ride"}</h2>
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
        </div>
      </div>

      {item.provider_id && <ProviderBioCard providerId={item.provider_id} roleLabel={{ en: "Transport Provider", ar: "مقدم النقل" }} />}
      {item.provider_id && (
        <div className="mx-4 mt-3 flex">
          <MessageOwnerButton ownerId={item.provider_id} kind="provider" label={isAr ? "مراسلة المزود" : "Message provider"} />
        </div>
      )}

      {/* Similar transport — always last */}
      {similar && similar.length > 0 && (
        <section className="px-4 mt-6">
          <h2 className="text-base font-bold text-primary-dark mb-3">{isAr ? "خيارات نقل مشابهة" : "Similar Rides"}</h2>
          <div className="grid grid-cols-3 gap-3">
            {similar.map((s: any) => (
              <div key={s.id} onClick={() => navigate(`/transport/${s.slug || s.id}`)}
                   className="rounded-lg shadow-card bg-card p-3 cursor-pointer">
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

      {/* Request bar — no payment is taken anywhere in the app */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{item.price} {t("common.egp")}</span>
          <span className="text-xs text-muted-foreground block">{isAr ? "للشخص" : "per person"}</span>
        </div>
        <button onClick={() => navigate(`/booking?type=transport&id=${item.id}`)} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {isAr ? "إرسال طلب" : "Send request"}
        </button>
      </div>
    </div>
  );
};

export default TransportDetail;
