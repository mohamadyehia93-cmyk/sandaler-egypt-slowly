import { ArrowLeft, Share2, MapPin, Clock, Users, Calendar, MapPinned } from "lucide-react";
import WishlistButton from "@/components/WishlistButton";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import DetailTestimonials from "@/components/DetailTestimonials";
import ProviderBioCard from "@/components/ProviderBioCard";
import { Skeleton } from "@/components/ui/skeleton";

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", id],
    queryFn: () => fetchByIdOrSlug("trips", id!),
    enabled: !!id,
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

  if (!trip) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

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
