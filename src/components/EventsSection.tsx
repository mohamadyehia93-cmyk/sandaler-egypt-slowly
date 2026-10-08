import { useNavigate } from "react-router-dom";
import SectionHeader from "@/components/SectionHeader";
import CardCarousel from "@/components/CardCarousel";
import ContentCard from "@/components/ContentCard";
import { useI18n } from "@/lib/i18n";
import MiniDate from "@/components/listing/MiniDate";
import { EventRow, sortEventsUpcomingFirst } from "@/lib/eventSort";

const EventsSection = ({ events }: { events: EventRow[] }) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  if (!events || events.length === 0) return null;
  const sorted = sortEventsUpcomingFirst(events).slice(0, 6);

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
            note={(lang === "ar" ? e.venue_ar || e.venue_en : e.venue_en) || undefined}
            badge={<MiniDate d={new Date(String(e.start_date).slice(0, 10) + "T00:00:00")} ar={lang === "ar"} />}
          />
        ))}
      </CardCarousel>
    </SectionHeader>
  );
};

export default EventsSection;
