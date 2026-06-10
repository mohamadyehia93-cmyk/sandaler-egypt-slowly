import { useNavigate } from "react-router-dom";
import SectionHeader from "@/components/SectionHeader";
import EventCard from "@/components/EventCard";
import { EventRow, sortEventsUpcomingFirst } from "@/lib/eventSort";

const EventsSection = ({ events }: { events: EventRow[] }) => {
  const navigate = useNavigate();
  if (!events || events.length === 0) return null;
  const sorted = sortEventsUpcomingFirst(events).slice(0, 3);

  return (
    <SectionHeader titleKey="section.events" onSeeAll={() => navigate("/calendar")}>
      <div className="grid grid-cols-3 gap-3 px-4">
        {sorted.map((e) => (
          <EventCard key={e.id} event={e} onClick={() => navigate(`/event/${e.slug || e.id}`)} />
        ))}
      </div>
    </SectionHeader>
  );
};

export default EventsSection;
