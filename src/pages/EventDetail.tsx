import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  Clock,
  MapPin,
  Ticket,
  Tag,
  Share2,
  Users,
  Navigation,
  Info,
  Timer,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { useCities, useRegions } from "@/hooks/useListings";
import { supabase } from "@/integrations/supabase/client";
import { EventRow, isPastEvent, eventCategoryKey, sortEventsUpcomingFirst } from "@/lib/eventSort";
import SmartImage from "@/components/ui/SmartImage";
import NotFoundView from "@/components/NotFound";
import DetailSkeleton from "@/components/DetailSkeleton";
import BottomNav from "@/components/BottomNav";
import WishlistButton from "@/components/WishlistButton";
import ProviderBioCard from "@/components/ProviderBioCard";
import SectionHeader from "@/components/SectionHeader";
import EventCard from "@/components/EventCard";
import { SEO } from "@/components/SEO";

const pad = (n: number) => String(n).padStart(2, "0");
const icsDate = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;

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

  const { data: nearby = [] } = useQuery({
    queryKey: ["events-nearby", event?.city_id, event?.region_id, event?.id],
    queryFn: async () => {
      let q = (supabase as any).from("events").select("*").eq("status", "published").limit(12);
      q = event?.city_id ? q.eq("city_id", event.city_id) : q.eq("region_id", event?.region_id);
      const { data, error } = await q;
      if (error) throw error;
      return sortEventsUpcomingFirst(((data || []) as EventRow[]).filter((e) => e.id !== event?.id)).slice(0, 3);
    },
    enabled: !!event && !!(event.city_id || event.region_id),
  });

  if (isLoading) return <DetailSkeleton variant="city" />;
  if (!event) return <NotFoundView context="event" />;

  const title = lang === "ar" ? event.title_ar : event.title_en;
  const description = lang === "ar" ? event.description_ar : event.description_en;
  const venue = lang === "ar" ? event.venue_ar || event.location_ar : event.venue_en || event.location_en;
  const locale = lang === "ar" ? "ar-EG" : "en-US";

  const start = new Date(event.start_date);
  const end = event.end_date ? new Date(event.end_date) : null;
  const fmtLong = (d: Date) =>
    d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const fmtShort = (d: Date) => d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  const multiDay = !!end && event.end_date !== event.start_date;
  const dateLabel = multiDay ? `${fmtLong(start)} — ${fmtLong(end!)}` : fmtLong(start);
  const shortDateLabel = multiDay ? `${fmtShort(start)} — ${fmtShort(end!)}` : fmtShort(start);
  const past = isPastEvent(event);

  const dayMs = 86400000;
  const today = new Date(new Date().toDateString()).getTime();
  const daysAway = Math.round((new Date(event.start_date).getTime() - today) / dayMs);
  const countdown = past
    ? t("event.ended")
    : daysAway <= 0
    ? t("event.today")
    : daysAway === 1
    ? t("event.tomorrow")
    : t("event.inDays", { days: String(daysAway) });
  const durationDays = multiDay
    ? Math.round((end!.getTime() - start.getTime()) / dayMs) + 1
    : 1;

  const city = (cities as any[]).find((c) => c.id === event.city_id);
  const region = (regions as any[]).find((r) => r.id === event.region_id);
  const cityName = city ? (lang === "ar" ? city.name_ar : city.name_en) : null;
  const regionName = region ? (lang === "ar" ? region.name_ar : region.name_en) : null;

  const priceLabel = event.is_free
    ? t("common.free")
    : event.price != null
    ? `${event.price} ${t("common.egp")}`
    : t("common.free");

  const mapsQuery = encodeURIComponent([venue, cityName, regionName, "Egypt"].filter(Boolean).join(", "));
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast(t("event.linkCopied"));
      }
    } catch {
      /* dismissed */
    }
  };

  const addToCalendar = () => {
    const endDate = new Date((end || start).getTime() + dayMs);
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Sandal//Events//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}@sandal`,
      `DTSTAMP:${icsDate(new Date())}T000000Z`,
      `DTSTART;VALUE=DATE:${icsDate(start)}`,
      `DTEND;VALUE=DATE:${icsDate(endDate)}`,
      `SUMMARY:${title}`,
      `LOCATION:${[venue, cityName].filter(Boolean).join(", ")}`,
      `DESCRIPTION:${(description || "").replace(/\n/g, " ")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug || event.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast(t("event.calendarSaved"));
  };

  const facts = [
    { icon: Calendar, label: t("event.date"), value: shortDateLabel },
    { icon: Clock, label: t("event.time"), value: event.event_time || t("event.timeTBA") },
    { icon: Wallet, label: t("event.admission"), value: priceLabel },
  ];

  const details = [
    { icon: Tag, label: t("section.events"), value: t(eventCategoryKey(event.category)) },
    { icon: Timer, label: t("event.duration"), value: multiDay ? `${durationDays} ${t("event.days")}` : t("event.oneDay") },
    ...(event.capacity ? [{ icon: Users, label: t("event.capacity"), value: `${event.capacity} ${t("event.people")}` }] : []),
    { icon: Wallet, label: t("event.admission"), value: priceLabel },
  ];

  return (
    <div className="min-h-screen bg-surface pb-40">
      <SEO
        title={title}
        description={(description || `${title} — ${venue || cityName || ""}`).slice(0, 155)}
        image={event.image || undefined}
        url={`/event/${event.slug || event.id}`}
        type="article"
      />

      <header className="flex items-center gap-2 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="flex-1 text-lg font-bold text-foreground line-clamp-1">{title}</h1>
        <WishlistButton className="p-1.5 rounded-full hover:bg-secondary" />
        <button onClick={share} className="p-1.5 rounded-full hover:bg-secondary" aria-label={t("event.share")}>
          <Share2 className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Hero */}
      <div className="relative h-56 mx-4 mt-2 rounded-xl overflow-hidden">
        {event.image ? (
          <SmartImage src={event.image} alt={title} loading="eager" />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Calendar className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
        <div className="absolute top-3 start-3 flex flex-wrap gap-2">
          <span className="bg-primary/90 text-primary-foreground text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            <Tag className="w-3 h-3" /> {t(eventCategoryKey(event.category))}
          </span>
          <span
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
              past ? "bg-muted text-muted-foreground" : "bg-success text-success-foreground"
            }`}
          >
            {past ? t("events.past") : t("events.upcoming")}
          </span>
        </div>
        <div className="absolute bottom-3 start-4 end-4">
          <span className="inline-flex items-center gap-1 bg-background/90 backdrop-blur-sm text-foreground text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2">
            <Timer className="w-3 h-3" /> {countdown}
          </span>
          <h2 className="text-xl font-bold text-primary-foreground drop-shadow">{title}</h2>
          {(venue || cityName) && (
            <p className="flex items-center gap-1 text-xs text-primary-foreground/90 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" /> {[venue, cityName].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      {/* Quick facts */}
      <div className="grid grid-cols-3 gap-2 px-4 mt-4">
        {facts.map((f) => (
          <div key={f.label} className="bg-card rounded-xl shadow-card p-3 text-center">
            <f.icon className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{f.label}</p>
            <p className="text-xs font-semibold text-foreground line-clamp-2">{f.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2 px-4 mt-3">
        <button
          onClick={addToCalendar}
          className="bg-card rounded-xl shadow-card p-3 flex flex-col items-center gap-1 active:scale-[0.97] transition-transform"
        >
          <CalendarPlus className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-medium text-foreground">{t("event.addToCalendar")}</span>
        </button>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-card rounded-xl shadow-card p-3 flex flex-col items-center gap-1 active:scale-[0.97] transition-transform"
        >
          <Navigation className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-medium text-foreground">{t("event.directions")}</span>
        </a>
        <button
          onClick={share}
          className="bg-card rounded-xl shadow-card p-3 flex flex-col items-center gap-1 active:scale-[0.97] transition-transform"
        >
          <Share2 className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-medium text-foreground">{t("event.share")}</span>
        </button>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* When */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("event.when")}</h3>
          <p className="flex items-center gap-2 text-sm text-foreground">
            <Calendar className="w-4 h-4 text-primary shrink-0" /> {dateLabel}
          </p>
          <p className="flex items-center gap-2 text-sm text-foreground mt-1.5">
            <Clock className="w-4 h-4 text-primary shrink-0" /> {event.event_time || t("event.timeTBA")}
          </p>
          <button
            onClick={addToCalendar}
            className="mt-3 w-full border border-primary/30 text-primary rounded-xl py-2 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <CalendarPlus className="w-4 h-4" /> {t("event.addToCalendar")}
          </button>
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
                <button
                  onClick={() => navigate(`/city/${event.city_id}`)}
                  className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full"
                >
                  {cityName}
                </button>
              )}
              {regionName && (
                <button
                  onClick={() => navigate(`/region/${event.region_id}`)}
                  className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full"
                >
                  {regionName}
                </button>
              )}
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full border border-primary/30 text-primary rounded-xl py-2 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" /> {t("event.openMaps")}
            </a>
          </div>
        )}

        {/* About */}
        {description && (
          <div className="bg-card rounded-xl shadow-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("event.about")}</h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{description}</p>
          </div>
        )}

        {/* Details */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t("event.details")}</h3>
          <div className="grid grid-cols-2 gap-3">
            {details.map((d, i) => (
              <div key={i} className="flex items-start gap-2">
                <d.icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{d.label}</p>
                  <p className="text-xs font-semibold text-foreground">{d.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Good to know */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t("event.goodToKnow")}</h3>
          <ul className="space-y-2">
            {[t("event.tip1"), t("event.tip2"), t("event.tip3")].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs text-foreground leading-relaxed">
                <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Organizer */}
      <ProviderBioCard
        providerId={(event as any).organizer_id || undefined}
        roleLabel={{ en: "Organizer", ar: "المنظم" }}
      />

      {/* Nearby events */}
      {nearby.length > 0 && (
        <div className="mt-6">
          <SectionHeader title={t("event.moreInCity")} onSeeAll={() => navigate("/calendar")} />
          <div className="grid grid-cols-3 gap-3 px-4">
            {nearby.map((e) => (
              <EventCard key={e.id} event={e} onClick={() => navigate(`/event/${e.slug || e.id}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky CTA */}
      <div className="fixed bottom-16 inset-x-0 z-30 bg-background/95 backdrop-blur border-t border-border px-4 py-3 flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("event.admission")}</p>
          <p className="text-lg font-bold text-primary-dark leading-tight">{priceLabel}</p>
        </div>
        {event.ticket_url && !past ? (
          <a
            href={event.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4" /> {t("event.tickets")}
          </a>
        ) : (
          <p className="flex-1 text-[11px] text-muted-foreground text-center leading-snug">
            {past ? t("event.ended") : t("event.noTickets")}
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default EventDetail;
