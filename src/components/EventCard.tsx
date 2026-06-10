import { Calendar, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { EventRow, isPastEvent, eventCategoryKey } from "@/lib/eventSort";

const EventCard = ({ event, onClick }: { event: EventRow; onClick?: () => void }) => {
  const { lang, t } = useI18n();
  const past = isPastEvent(event);
  const title = lang === "ar" ? event.title_ar : event.title_en;
  const venue =
    lang === "ar"
      ? event.venue_ar || event.location_ar
      : event.venue_en || event.location_en;
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const start = new Date(event.start_date);
  const dateLabel = start.toLocaleDateString(locale, { day: "numeric", month: "short" });
  const categoryLabel = t(eventCategoryKey(event.category));

  return (
    <div
      onClick={onClick}
      className="rounded-xl overflow-hidden shadow-card bg-card cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className="relative h-32">
        {event.image ? (
          <img src={event.image} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <span className="absolute top-2 start-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
          {categoryLabel}
        </span>
        {past && (
          <span className="absolute top-2 end-2 bg-muted text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
            {t("events.past")}
          </span>
        )}
        <span className="absolute bottom-2 start-2 bg-background/90 backdrop-blur-sm text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {dateLabel}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{title}</h3>
        {venue && (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground line-clamp-1 mb-1">
            <MapPin className="w-3 h-3 shrink-0" /> {venue}
          </p>
        )}
        <span className="text-sm font-bold text-primary-dark">
          {event.is_free
            ? t("common.free")
            : event.price != null
            ? `${event.price} ${t("common.egp")}`
            : t("common.free")}
        </span>
      </div>
    </div>
  );
};

export default EventCard;
