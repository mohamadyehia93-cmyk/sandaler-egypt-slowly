import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Route, Lightbulb, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import WishlistButton from "@/components/WishlistButton";
import ProviderBioCard from "@/components/ProviderBioCard";
import { Skeleton } from "@/components/ui/skeleton";

const TransportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const { data: item, isLoading } = useQuery({
    queryKey: ["transport", id],
    queryFn: () => fetchByIdOrSlug<any>("transport", id!),
    enabled: !!id,
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

  if (!item) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  const name = lang === "ar" ? item.name_ar : item.name_en;
  const description = lang === "ar" ? item.description_ar : item.description_en;
  const fromName = lang === "ar" ? item.from_ar : item.from_en;
  const toName = lang === "ar" ? item.to_ar : item.to_en;
  const providerName = lang === "ar" ? item.provider_name_ar : item.provider_name_en;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground flex-1">{name}</h1>
        <WishlistButton className="p-1.5 rounded-full hover:bg-secondary" />
      </header>

      <div className="flex flex-col items-center py-8 bg-surface">
        <span className="text-6xl mb-3">🚐</span>
        <h2 className="text-xl font-bold text-foreground mb-1">{name}</h2>
        {item.transport_type && (
          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{item.transport_type}</span>
        )}
      </div>

      <div className="px-4 pt-5">
        {/* Route */}
        {fromName && toName && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-card border border-border mb-5">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <div className="w-0.5 h-8 bg-primary/30" />
              <div className="w-3 h-3 rounded-full border-2 border-primary bg-background" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{lang === "ar" ? "من" : "From"}</p>
                <p className="text-sm font-semibold text-foreground">{fromName}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{lang === "ar" ? "إلى" : "To"}</p>
                <p className="text-sm font-semibold text-foreground">{toName}</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {item.duration && (
            <div className="p-3 rounded-lg bg-surface flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "المدة" : "Duration"}</p>
                <p className="text-sm font-semibold text-foreground">{item.duration}</p>
              </div>
            </div>
          )}
          {item.frequency && (
            <div className="p-3 rounded-lg bg-surface flex items-center gap-2">
              <Route className="w-4 h-4 text-primary" />
              <div>
                <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "التكرار" : "Frequency"}</p>
                <p className="text-sm font-semibold text-foreground">{item.frequency}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-2">{lang === "ar" ? "عن الرحلة" : "About This Ride"}</h2>
            <p className="text-sm text-foreground leading-relaxed mb-5">{description}</p>
          </>
        )}
      </div>

      {item.provider_id && <ProviderBioCard providerId={item.provider_id} roleLabel={{ en: "Transport Provider", ar: "مقدم النقل" }} />}

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{item.price} {t("common.egp")}</span>
          <span className="text-xs text-muted-foreground block">{lang === "ar" ? "للشخص" : "per person"}</span>
        </div>
        <button onClick={() => navigate(`/booking?type=transport&id=${item.id}`)} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {t("common.book")}
        </button>
      </div>
    </div>
  );
};

export default TransportDetail;
