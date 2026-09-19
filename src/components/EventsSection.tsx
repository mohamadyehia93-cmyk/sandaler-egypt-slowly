import { useNavigate } from "react-router-dom";
import SectionHeader from "@/components/SectionHeader";
import CardCarousel from "@/components/CardCarousel";
import ContentCard from "@/components/ContentCard";
import { useI18n } from "@/lib/i18n";
import { EventRow, sortEventsUpcomingFirst } from "@/lib/eventSort";

const EventsSection = ({ events }: { events: EventRow[] }) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  if (!events || events.length === 0) return null;
  const sorted = sortEventsUpcomingFirst(events).slice(0, 6);
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  return (
    <SectionHeader id="events" titleKey="section.events" onSeeAll={() => navigate("/calendar")}>
      <CardCarousel>
        {sorted.map((e) => (
          <ContentCard
            key={e.id}
            type="event"
            title={(lang === "ar" ? e.title_ar || e.title_en : e.title_en) || ""}
            image={e.image}
            href={`/event/${e.slug || e.id}`}
            price={e.is_free ? 0 : e.price ?? 0}
            note={new Date(e.start_date).toLocaleDateString(locale, {
              day: "numeric",
              month: "long",
            })}
          />
        ))}
      </CardCarousel>
    </SectionHeader>
  );
};

export default EventsSection;
