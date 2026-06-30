export type EventRow = {
  id: string;
  slug?: string | null;
  title_en: string;
  title_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  image?: string | null;
  region_id?: string | null;
  city_id?: string | null;
  start_date: string;
  end_date?: string | null;
  event_time?: string | null;
  venue_en?: string | null;
  venue_ar?: string | null;
  location_en?: string | null;
  location_ar?: string | null;
  category?: string | null;
  is_free?: boolean;
  price?: number | null;
  ticket_url?: string | null;
};

const startOfToday = () => new Date(new Date().toDateString()).getTime();
const refTime = (e: EventRow) => new Date(e.end_date || e.start_date).getTime();

export const isPastEvent = (e: EventRow) => refTime(e) < startOfToday();

/** Upcoming events ascending by start date, followed by past events most-recent first. */
export const sortEventsUpcomingFirst = (events: EventRow[]): EventRow[] => {
  const today = startOfToday();
  const byStartAsc = (a: EventRow, b: EventRow) =>
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  const byStartDesc = (a: EventRow, b: EventRow) =>
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime();

  const upcoming = events.filter((e) => refTime(e) >= today).sort(byStartAsc);
  const past = events.filter((e) => refTime(e) < today).sort(byStartDesc);
  return [...upcoming, ...past];
};

const KNOWN_CATEGORIES = [
  "festival",
  "exhibition",
  "concert",
  "workshop",
  "performance",
  "market",
];

/** Returns an i18n key for the category, falling back to a generic events key. */
export const eventCategoryKey = (category?: string | null) => {
  const c = (category || "").toLowerCase();
  return KNOWN_CATEGORIES.includes(c) ? `event.category.${c}` : "section.events";
};
