import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Clock, Users, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useExperiences, useTrips, useEvents } from "@/hooks/useListings";

type CalendarEvent = {
  id: string;
  type: "experience" | "trip" | "event";
  title: { en: string; ar: string };
  date: Date;
  price: number;
  image: string;
  region?: { en: string; ar: string };
  route?: { en: string; ar: string };
  venue?: { en: string; ar: string };
  rating?: number;
};

const parseDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr || dateStr === "Ongoing") return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_AR = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const EventCalendar = () => {
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const { data: experiences = [] } = useExperiences();
  const { data: trips = [] } = useTrips();

  const allEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];
    (experiences as any[]).forEach((e) => {
      const d = parseDate(e.date);
      if (d) events.push({
        id: e.slug || e.id,
        type: "experience",
        title: { en: e.title_en, ar: e.title_ar },
        date: d,
        price: e.price ?? 0,
        image: e.image,
        rating: e.rating,
      });
    });
    (trips as any[]).forEach((tr) => {
      const d = parseDate(tr.date);
      if (d) events.push({
        id: tr.slug || tr.id,
        type: "trip",
        title: { en: tr.title_en, ar: tr.title_ar },
        date: d,
        price: tr.price ?? 0,
        image: tr.image,
        route: tr.route_en || tr.route_ar ? { en: tr.route_en ?? "", ar: tr.route_ar ?? "" } : undefined,
      });
    });
    return events;
  }, [experiences, trips]);

  const [currentMonth, setCurrentMonth] = useState(() => {
    // Start at earliest event month
    const sorted = [...allEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
    return sorted.length > 0 ? new Date(sorted[0].date.getFullYear(), sorted[0].date.getMonth(), 1) : new Date();
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = lang === "ar" ? MONTHS_AR[month] : MONTHS_EN[month];
  const dayNames = lang === "ar" ? DAYS_AR : DAYS_EN;

  const eventDates = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((e) => {
      if (e.date.getMonth() === month && e.date.getFullYear() === year) {
        set.add(e.date.getDate().toString());
      }
    });
    return set;
  }, [allEvents, month, year]);

  const selectedEvents = selectedDate
    ? allEvents.filter((e) => isSameDay(e.date, selectedDate))
    : [];

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {lang === "ar" ? "تقويم الفعاليات" : "Events Calendar"}
        </h1>
      </header>

      <div className="px-4 pt-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-secondary">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h2 className="text-base font-bold text-foreground">{monthName} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-secondary">
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-5">
          {calendarCells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const hasEvent = eventDates.has(day.toString());
            const thisDate = new Date(year, month, day);
            const isSelected = selectedDate && isSameDay(selectedDate, thisDate);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(thisDate)}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : hasEvent
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {day}
                {hasEvent && !isSelected && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-foreground mb-3">
              {selectedDate.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
            {selectedEvents.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {lang === "ar" ? "لا توجد فعاليات في هذا اليوم" : "No events on this day"}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((ev) => (
                  <div
                    key={`${ev.type}-${ev.id}`}
                    onClick={() => navigate(ev.type === "trip" ? `/trip/${ev.id}` : `/experience/${ev.id}`)}
                    className="flex gap-3 rounded-xl bg-card shadow-card border border-border overflow-hidden cursor-pointer"
                  >
                    <img src={ev.image} alt={ev.title[lang]} className="w-24 h-24 object-cover flex-shrink-0" />
                    <div className="py-3 pe-3 flex flex-col justify-center flex-1 min-w-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full self-start mb-1.5 ${
                        ev.type === "trip"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {ev.type === "trip"
                          ? (lang === "ar" ? "رحلة" : "Trip")
                          : (lang === "ar" ? "تجربة" : "Experience")}
                      </span>
                      <h4 className="text-xs font-bold text-foreground line-clamp-2">{ev.title[lang]}</h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                        {ev.region && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {ev.region[lang]}
                          </span>
                        )}
                        {ev.route && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" /> {ev.route[lang]}
                          </span>
                        )}
                        {ev.rating && (
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-amber-500" /> {ev.rating}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-primary mt-1">
                        {ev.price === 0 ? (lang === "ar" ? "مجاني" : "Free") : `${ev.price} ${t("common.egp")}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upcoming Events (when no date selected) */}
        {!selectedDate && (
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">
              {lang === "ar" ? "الفعاليات القادمة" : "Upcoming Events"}
            </h3>
            <div className="space-y-3">
              {allEvents
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 6)
                .map((ev) => (
                  <div
                    key={`${ev.type}-${ev.id}`}
                    onClick={() => navigate(ev.type === "trip" ? `/trip/${ev.id}` : `/experience/${ev.id}`)}
                    className="flex gap-3 rounded-xl bg-card shadow-card border border-border overflow-hidden cursor-pointer"
                  >
                    <img src={ev.image} alt={ev.title[lang]} className="w-20 h-20 object-cover flex-shrink-0" />
                    <div className="py-2.5 pe-3 flex flex-col justify-center flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          ev.type === "trip"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-primary/10 text-primary"
                        }`}>
                          {ev.type === "trip" ? (lang === "ar" ? "رحلة" : "Trip") : (lang === "ar" ? "تجربة" : "Exp")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {ev.date.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-foreground line-clamp-1">{ev.title[lang]}</h4>
                      <span className="text-xs font-bold text-primary mt-0.5">
                        {ev.price === 0 ? (lang === "ar" ? "مجاني" : "Free") : `${ev.price} ${t("common.egp")}`}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;
