import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, List } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useExperiences, useTrips, useEvents, useCities } from "@/hooks/useListings";
import { Skeleton } from "@/components/ui/skeleton";
import PosterDate, { countdownLabel } from "@/components/listing/PosterDate";
import MiniDate from "@/components/listing/MiniDate";
import { fmtNumber, listingLocale } from "@/components/listing/format";

/**
 * INTEGRITY RULE: only published rows with a real, parseable date appear.
 * Nothing is invented to fill an empty month.
 */

type Kind = "experience" | "trip" | "event";
type CalendarEvent = {
  key: string;
  id: string;
  type: Kind;
  title: { en: string; ar: string };
  date: Date;
  end: Date | null;
  price: number;
  image: string | null;
  cityId: string | null;
  venue?: { en: string; ar: string };
  time?: string | null;
};

const parseDate = (s: string | null | undefined): Date | null => {
  if (!s || s === "Ongoing") return null;
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  const d = iso ? new Date(iso[1] + "T00:00:00") : new Date(s);
  return isNaN(d.getTime()) ? null : d;
};
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const monthKey = (d: Date) => dayKey(d).slice(0, 7);

const EventCalendar = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const loc = listingLocale(ar);
  const { data: experiences = [], isLoading: l1 } = useExperiences();
  const { data: trips = [], isLoading: l2 } = useTrips();
  const { data: cultureEvents = [], isLoading: l3 } = useEvents();
  const { data: cities = [] } = useCities();
  const isLoading = l1 || l2 || l3;

  const [view, setView] = useState<"month" | "list">("month");
  const [kind, setKind] = useState<Kind | "all">("all");
  const [city, setCity] = useState<string>("all");
  const [month, setMonth] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);

  const allEvents = useMemo<CalendarEvent[]>(() => {
    const out: CalendarEvent[] = [];
    (experiences as any[]).forEach((e) => {
      const d = parseDate(e.date);
      if (d) out.push({ key: `x${e.id}`, id: e.slug || e.id, type: "experience", title: { en: e.title_en, ar: e.title_ar || e.title_en }, date: d, end: null, price: e.price ?? 0, image: e.image, cityId: e.city_id });
    });
    (trips as any[]).forEach((t) => {
      const d = parseDate(t.date);
      if (d) out.push({ key: `t${t.id}`, id: t.slug || t.id, type: "trip", title: { en: t.title_en, ar: t.title_ar || t.title_en }, date: d, end: null, price: t.price ?? 0, image: t.image, cityId: t.city_id });
    });
    (cultureEvents as any[]).forEach((ev) => {
      const d = parseDate(ev.start_date);
      if (d) out.push({
        key: `e${ev.id}`, id: ev.slug || ev.id, type: "event", title: { en: ev.title_en, ar: ev.title_ar || ev.title_en },
        date: d, end: parseDate(ev.end_date), price: ev.is_free ? 0 : Number(ev.price ?? 0), image: ev.image, cityId: ev.city_id,
        venue: ev.venue_en || ev.venue_ar ? { en: ev.venue_en ?? ev.venue_ar, ar: ev.venue_ar ?? ev.venue_en } : undefined, time: ev.event_time,
      });
    });
    return out.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [experiences, trips, cultureEvents]);

  const cityName = (id: string | null) => {
    const c = (cities as any[]).find((x) => x.id === id);
    return c ? (ar ? c.name_ar || c.name_en : c.name_en) : null;
  };
  const cityOptions = Array.from(new Set(allEvents.map((e) => e.cityId).filter(Boolean))) as string[];
  const kinds = Array.from(new Set(allEvents.map((e) => e.type)));
  const filtered = allEvents.filter((e) => (kind === "all" || e.type === kind) && (city === "all" || e.cityId === city));

  const todayStart = new Date(new Date().toDateString());
  const isPast = (e: CalendarEvent) => (e.end ?? e.date) < todayStart;
  const upcoming = filtered.filter((e) => !isPast(e));
  const past = filtered.filter(isPast).reverse();

  // Month tabs: months that have something, defaulting to the first upcoming month.
  const months = Array.from(new Set(filtered.map((e) => monthKey(e.date))));
  const defaultMonth = upcoming[0] ? monthKey(upcoming[0].date) : months[months.length - 1];
  const activeMonth = month && months.includes(month) ? month : defaultMonth;
  const byDay = new Map<string, CalendarEvent[]>();
  filtered.forEach((e) => byDay.set(dayKey(e.date), [...(byDay.get(dayKey(e.date)) ?? []), e]));

  const typeLabel = (t: Kind) => (t === "trip" ? (ar ? "رحلات" : "Trips") : t === "event" ? (ar ? "فعاليات" : "Events") : (ar ? "تجارب" : "Experiences"));
  const route = (e: CalendarEvent) => `/${e.type === "event" ? "event" : e.type}/${e.id}`;
  const priceLabel = (n: number) => (!n ? (ar ? "مجاني" : "Free") : `${fmtNumber(n, ar)} ${ar ? "ج.م" : "EGP"}`);

  const chip = (active: boolean) => `min-h-[40px] px-4 rounded-full text-sm font-semibold border flex-shrink-0 ${active ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border"}`;

  const Row = ({ e }: { e: CalendarEvent }) => {
    const p = isPast(e);
    return (
      <button type="button" onClick={() => navigate(route(e))} className={`w-full text-start ${p ? "opacity-60" : ""}`}>
        <PosterDate start={e.date} end={e.end} ar={ar} past={p} time={e.time} countdown={countdownLabel(e.date, p, ar)}
          where={[e.venue?.[lang], cityName(e.cityId)].filter(Boolean).join(" · ") || null} />
        <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-base text-foreground mt-2 px-1`}>{e.title[lang]}</p>
        <p className="text-[13px] text-muted-foreground px-1">{typeLabel(e.type)} · {priceLabel(e.price)}</p>
      </button>
    );
  };

  const MiniCard = ({ e }: { e: CalendarEvent }) => (
    <button type="button" onClick={() => navigate(route(e))} className={`flex gap-3 items-center w-full text-start py-3 min-h-[56px] ${isPast(e) ? "opacity-60" : ""}`}>
      <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {e.image && <img src={e.image} alt="" loading="lazy" className="w-full h-full object-cover" />}
      </div>
      <MiniDate d={e.date} ar={ar} />
      <div className="min-w-0">
        <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-base leading-snug text-foreground line-clamp-2`}>{e.title[lang]}</p>
        <p className="text-[13px] text-muted-foreground">{[typeLabel(e.type), cityName(e.cityId), priceLabel(e.price)].filter(Boolean).join(" · ")}</p>
      </div>
    </button>
  );

  const grouped = (rows: CalendarEvent[]) => {
    const m = new Map<string, CalendarEvent[]>();
    rows.forEach((e) => m.set(monthKey(e.date), [...(m.get(monthKey(e.date)) ?? []), e]));
    return Array.from(m.entries());
  };
  const monthLabel = (k: string) => new Date(k + "-01T00:00:00").toLocaleDateString(loc, { month: "long", year: "numeric" });

  // Month grid
  const weekStart = ar ? 6 : 1;
  const [y, mo] = (activeMonth || dayKey(new Date()).slice(0, 7)).split("-").map(Number);
  const first = new Date(y, mo - 1, 1);
  const lead = (first.getDay() - weekStart + 7) % 7;
  const daysInMonth = new Date(y, mo, 0).getDate();
  const weekdayNames = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + ((weekStart + i) % 7)).toLocaleDateString(loc, { weekday: "narrow" }));
  const selectedDay = day && day.startsWith(activeMonth || "") ? day : null;
  const dayEvents = selectedDay ? byDay.get(selectedDay) ?? [] : [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="flex items-center gap-2 px-2 py-2 bg-background sticky top-0 z-40 border-b border-border">
        <button type="button" onClick={() => navigate(-1)} aria-label={ar ? "رجوع" : "Back"} className="tap-target rounded-full">
          <ArrowLeft className={`w-5 h-5 ${ar ? "rotate-180" : ""}`} />
        </button>
        <h1 className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground flex-1`}>{ar ? "التقويم" : "Calendar"}</h1>
        <div role="tablist" className="flex rounded-full border border-border p-0.5 me-2">
          {(["month", "list"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} type="button" onClick={() => setView(v)}
              className={`min-h-[40px] px-3 rounded-full text-[13px] font-semibold inline-flex items-center gap-1 ${view === v ? "bg-foreground text-background" : "text-foreground"}`}>
              {v === "month" ? <CalendarDays className="w-4 h-4" /> : <List className="w-4 h-4" />}
              {v === "month" ? (ar ? "شهر" : "Month") : (ar ? "قائمة" : "List")}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-[680px] mx-auto px-4">
        {/* Filters */}
        {kinds.length > 1 && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-4 -mx-4 px-4">
            <button type="button" className={chip(kind === "all")} onClick={() => setKind("all")}>{ar ? "الكل" : "All"}</button>
            {kinds.map((k) => <button key={k} type="button" className={chip(kind === k)} onClick={() => setKind(k)}>{typeLabel(k)}</button>)}
          </div>
        )}
        {cityOptions.length > 1 && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2 -mx-4 px-4">
            <button type="button" className={chip(city === "all")} onClick={() => setCity("all")}>{ar ? "كل المدن" : "All cities"}</button>
            {cityOptions.map((c) => <button key={c} type="button" className={chip(city === c)} onClick={() => setCity(c)}>{cityName(c) || c}</button>)}
          </div>
        )}

        {isLoading ? (
          <div className="pt-6 space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-72 w-full rounded-xl" /></div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">{ar ? "لا توجد مواعيد منشورة بعد." : "Nothing with a date is published yet."}</p>
        ) : view === "month" ? (
          <>
            <div role="tablist" className="flex gap-2 overflow-x-auto hide-scrollbar py-4 -mx-4 px-4 border-b border-border">
              {months.map((m) => (
                <button key={m} role="tab" aria-selected={m === activeMonth} type="button" onClick={() => { setMonth(m); setDay(null); }}
                  className={chip(m === activeMonth)}>
                  {new Date(m + "-01T00:00:00").toLocaleDateString(loc, { month: "short", year: "numeric" })}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center pt-4">
              {weekdayNames.map((w, i) => <span key={i} className="text-[13px] text-muted-foreground py-1">{w}</span>)}
              {Array.from({ length: lead }).map((_, i) => <span key={`l${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const k = `${activeMonth}-${String(i + 1).padStart(2, "0")}`;
                const has = byDay.has(k);
                const sel = k === selectedDay;
                return (
                  <button key={k} type="button" disabled={!has} onClick={() => setDay(k)} aria-pressed={sel}
                    aria-label={has ? `${new Date(k + "T00:00:00").toLocaleDateString(loc, { day: "numeric", month: "long" })} · ${fmtNumber(byDay.get(k)!.length, ar)}` : undefined}
                    className={`relative h-12 rounded-lg text-[15px] ${sel ? "bg-primary text-primary-foreground font-bold" : has ? "text-foreground font-semibold hover:bg-muted" : "text-muted-foreground/50"}`}>
                    {fmtNumber(i + 1, ar)}
                    {has && !sel && <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </div>
            <div className="pt-6 space-y-5">
              {selectedDay ? (
                dayEvents.map((e) => <Row key={e.key} e={e} />)
              ) : (
                <p className="text-[15px] text-muted-foreground text-center">{ar ? "اختر يومًا عليه نقطة لعرض ما فيه." : "Tap a day with a dot to see what's on."}</p>
              )}
            </div>
          </>
        ) : (
          <div className="pt-4">
            {grouped(upcoming).map(([m, rows]) => (
              <section key={m} className="py-4 border-b border-border">
                <h2 className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground mb-1`}>{monthLabel(m)}</h2>
                <div className="divide-y divide-border">{rows.map((e) => <MiniCard key={e.key} e={e} />)}</div>
              </section>
            ))}
            {past.length > 0 && (
              <section className="py-4">
                <h2 className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-muted-foreground mb-1`}>{ar ? "مضت" : "Past"}</h2>
                {grouped(past).map(([m, rows]) => (
                  <div key={m} className="pt-2">
                    <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{monthLabel(m)}</p>
                    <div className="divide-y divide-border">{rows.map((e) => <MiniCard key={e.key} e={e} />)}</div>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;
