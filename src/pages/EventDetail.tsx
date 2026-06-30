import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, MapPin, Ticket, Tag } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { useCities, useRegions } from "@/hooks/useListings";
import { EventRow, isPastEvent, eventCategoryKey } from "@/lib/eventSort";
import SmartImage from "@/components/ui/SmartImage";
import NotFoundView from "@/components/NotFound";
import DetailSkeleton from "@/components/DetailSkeleton";
import BottomNav from "@/components/BottomNav";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const { data: cities = [] } = useCities();
  const { data: regions = [] } = useRegions();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchByIdOrSlug("events", id || "") as Promise<EventRow | null>,
    enabled: !!id,
  });

  if (isLoading) return <DetailSkeleton variant="city" />;
  if (!event) return <NotFoundView context="event" />;

  const title = lang === "ar" ? event.title_ar : event.title_en;
  const description = lang === "ar" ? event.description_ar : event.description_en;
  const venue = lang === "ar" ? event.venue_ar || event.location_ar : event.venue_en || event.location_en;
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  const start = new Date(event.start_date);
  const end = event.end_date ? new Date(event.end_date) : null;
  const fmt = (d: Date) => d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const dateLabel = end && event.end_date !== event.start_date ? `${fmt(start)} — ${fmt(end)}` : fmt(start);
  const past = isPastEvent(event);

  const city = (cities as any[]).find((c) => c.id === event.city_id);
  const region = (regions as any[]).find((r) => r.id === event.region_id);
  const cityName = city ? (lang === "ar" ? city.name_ar : city.name_en) : null;
  const regionName = region ? (lang === "ar" ? region.name_ar : region.name_en) : null;

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground line-clamp-1">{title}</h1>
      </header>

      <div className="relative h-52 mx-4 mt-2 rounded-xl overflow-hidden">
        {event.image ? (
          <SmartImage src={event.image} alt={title} loading="eager" />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Calendar className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <div className="absolute top-3 start-3 flex gap-2">
          <span className="bg-primary/90 text-primary-foreground text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" /> {t(eventCategoryKey(event.category))}
          </span>
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${past ? "bg-muted text-muted-foreground" : "bg-success text-white"}`}>
            {past ? t("events.past") : t("events.upcoming")}
          </span>
        </div>
        <h2 className="absolute bottom-3 start-4 end-4 text-xl font-bold text-white">{title}</h2>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* When */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("event.when")}</h3>
          <p className="flex items-center gap-2 text-sm text-foreground">
            <Calendar className="w-4 h-4 text-primary shrink-0" /> {dateLabel}
          </p>
          {event.event_time && (
            <p className="flex items-center gap-2 text-sm text-foreground mt-1.5">
              <Clock className="w-4 h-4 text-primary shrink-0" /> {event.event_time}
            </p>
          )}
        </div>

        {/* Where */}
        {(venue || cityName || regionName) && (
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("event.where")}</h3>
            {venue && (
              <p className="flex items-center gap-2 text-sm text-foreground mb-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" /> {venue}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {cityName && (
                <button onClick={() => navigate(`/city/${event.city_id}`)} className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {cityName}
                </button>
              )}
              {regionName && (
                <button onClick={() => navigate(`/region/${event.region_id}`)} className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {regionName}
                </button>
              )}
            </div>
          </div>
        )}

        {/* About */}
        {description && (
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("event.about")}</h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{description}</p>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between bg-card rounded-xl shadow-card p-4">
          <span className="text-lg font-bold text-primary-dark">
            {event.is_free ? t("common.free") : event.price != null ? `${event.price} ${t("common.egp")}` : t("common.free")}
          </span>
          {event.ticket_url && (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-bold text-sm flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" /> {t("event.tickets")}
            </a>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default EventDetail;
