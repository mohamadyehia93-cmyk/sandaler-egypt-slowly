import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CalendarPlus, Clock, MapPin, Navigation, Users, Tag, Timer, Wallet, MessageCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { useCities, useRegions } from "@/hooks/useListings";
import { supabase } from "@/integrations/supabase/client";
import { EventRow, isPastEvent, eventCategoryText, sortEventsUpcomingFirst } from "@/lib/eventSort";
import NotFoundView from "@/components/NotFound";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import ShareButton from "@/components/ShareButton";
import MachineTranslatedNote from "@/components/MachineTranslatedNote";
import ListingHero from "@/components/listing/ListingHero";
import KeyFacts, { type KeyFact } from "@/components/listing/KeyFacts";
import Section from "@/components/listing/Section";
import ActionBar from "@/components/listing/ActionBar";
import ReadBeforeYouGo from "@/components/listing/ReadBeforeYouGo";
import { fmtNumber, listingLocale, splitStandfirst } from "@/components/listing/format";
import { PROVIDER_PUBLIC_COLUMNS } from "@/lib/providerColumns";

/**
 * INTEGRITY RULE for this page: every block is backed by a real column on THIS
 * event row (or a query scoped to it). No invented times, venues, organisers
 * or prices. Each section hides itself when its column is empty.
 */

const pad = (n: number) => String(n).padStart(2, "0");
const icsDate = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
const localDate = (iso: string) => new Date(iso.slice(0, 10) + "T00:00:00");

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const ar = lang === "ar";
  const loc = listingLocale(ar);
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
      return sortEventsUpcomingFirst(((data || []) as EventRow[]).filter((e) => e.id !== event?.id)).slice(0, 6);
    },
    enabled: !!event && !!(event.city_id || event.region_id),
  });

  const organizerId: string | null = (event as any)?.organizer_id || null;
  const { data: organizer } = useQuery({
    queryKey: ["provider", organizerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("providers").select(PROVIDER_PUBLIC_COLUMNS).eq("id", organizerId!).maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!organizerId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-[56vh] max-h-[460px] w-full rounded-none" />
        <div className="max-w-[680px] mx-auto p-4 space-y-3">
          <Skeleton className="h-24 w-full -mt-10 rounded-2xl" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }
  if (!event) return <NotFoundView context="event" />;

  const ev = event as any;
  const title = ar ? event.title_ar || event.title_en : event.title_en;
  const description = (ar ? event.description_ar || event.description_en : event.description_en) || "";
  const venue = ar ? event.venue_ar || event.location_ar : event.venue_en || event.location_en;

  const start = localDate(event.start_date);
  const end = event.end_date ? localDate(event.end_date) : null;
  const multiDay = !!end && event.end_date!.slice(0, 10) !== event.start_date.slice(0, 10);
  const past = isPastEvent(event);

  const dayMs = 86400000;
  const today = new Date(new Date().toDateString()).getTime();
  const daysAway = Math.round((start.getTime() - today) / dayMs);
  const countdown = past
    ? ar ? "انتهت" : "Ended"
    : daysAway <= 0 ? (ar ? "اليوم" : "Today")
    : daysAway === 1 ? (ar ? "غدًا" : "Tomorrow")
    : ar ? `بعد ${fmtNumber(daysAway, ar)} أيام` : `In ${daysAway} days`;
  const durationDays = multiDay ? Math.round((end!.getTime() - start.getTime()) / dayMs) + 1 : 1;

  const city = (cities as any[]).find((c) => c.id === event.city_id);
  const region = (regions as any[]).find((r) => r.id === event.region_id);
  const cityName = city ? (ar ? city.name_ar || city.name_en : city.name_en) : null;
  const regionName = region ? (ar ? region.name_ar || region.name_en : region.name_en) : null;

  const egp = ar ? "ج.م" : "EGP";
  const priceLabel = event.is_free || event.price == null || Number(event.price) === 0
    ? (ar ? "مجاني" : "Free")
    : `${fmtNumber(Number(event.price), ar)} ${egp}`;
  const isFree = event.is_free || !event.price;

  // Poster date block
  const dayNum = multiDay && end && end.getMonth() === start.getMonth()
    ? `${fmtNumber(start.getDate(), ar)}–${fmtNumber(end.getDate(), ar)}`
    : start.toLocaleDateString(loc, { day: "numeric" });
  const monthShort = multiDay && end && end.getMonth() !== start.getMonth()
    ? `${start.toLocaleDateString(loc, { month: "short" })} – ${end.toLocaleDateString(loc, { day: "numeric", month: "short" })}`
    : start.toLocaleDateString(loc, { month: "short" });
  const weekday = start.toLocaleDateString(loc, { weekday: "long" });
  const timeLabel = event.event_time || (ar ? "الموعد سيُعلن لاحقًا" : "Time to be announced");
  const whereLine = [venue, cityName].filter(Boolean).join(" · ");

  const lat = ev.latitude != null ? Number(ev.latitude) : null;
  const lng = ev.longitude != null ? Number(ev.longitude) : null;
  const hasGeo = lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng);
  const mapsQuery = encodeURIComponent([venue, cityName, regionName, "Egypt"].filter(Boolean).join(", "));
  const mapsHref = hasGeo
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const addToCalendar = () => {
    const endDate = new Date((end || start).getTime() + dayMs);
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Sandal//Events//EN", "BEGIN:VEVENT",
      `UID:${event.id}@sandal`,
      `DTSTAMP:${icsDate(new Date())}T000000Z`,
      `DTSTART;VALUE=DATE:${icsDate(new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())))}`,
      `DTEND;VALUE=DATE:${icsDate(new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())))}`,
      `SUMMARY:${title}`,
      `LOCATION:${[venue, cityName].filter(Boolean).join(", ")}`,
      `DESCRIPTION:${description.replace(/\n/g, " ")}`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug || event.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast(t("event.calendarSaved"));
  };

  const { first: standfirst, rest } = splitStandfirst(description);
  const categoryText = eventCategoryText(event.category, t);
  const eyebrow = [categoryText, cityName].filter(Boolean).join(" · ");

  const facts: KeyFact[] = [{ icon: Wallet, label: priceLabel }];
  if (event.capacity) facts.push({ icon: Users, label: ar ? `${fmtNumber(event.capacity, ar)} شخص` : `${event.capacity} people` });
  if (categoryText) facts.push({ icon: Tag, label: categoryText });

  const details = [
    categoryText && [ar ? "الفئة" : "Category", categoryText],
    [ar ? "المدة" : "Duration", multiDay ? (ar ? `${fmtNumber(durationDays, ar)} أيام` : `${durationDays} days`) : (ar ? "يوم واحد" : "One day")],
    event.capacity && [ar ? "السعة" : "Capacity", ar ? `${fmtNumber(event.capacity, ar)} شخص` : `${event.capacity} people`],
    [ar ? "الدخول" : "Admission", priceLabel],
  ].filter(Boolean) as [string, string][];

  const ticketsPath = `/event/${event.slug || event.id}/tickets`;
  const primaryLabel = isFree ? (ar ? "احجز" : "Reserve") : (ar ? "احصل على التذاكر" : "Get tickets");
  const officialSite = event.ticket_url ? (
    <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 min-h-[44px] text-sm font-semibold text-primary-dark underline">
      {ar ? "الموقع الرسمي" : "Official site"} <ExternalLink className="w-3.5 h-3.5" />
    </a>
  ) : null;

  const pill = "inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-border bg-background text-sm font-semibold text-foreground";
  const quickActions = (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={addToCalendar} className={pill}><CalendarPlus className="w-4 h-4 text-primary-dark" /> {ar ? "أضف للتقويم" : "Add to calendar"}</button>
      <a href={mapsHref} target="_blank" rel="noopener noreferrer" className={pill}><Navigation className="w-4 h-4 text-primary-dark" /> {ar ? "الاتجاهات" : "Directions"}</a>
      <ShareButton title={title} className={pill} iconClassName="w-4 h-4 text-primary-dark" />
    </div>
  );

  const orgName = organizer ? (ar ? organizer.name_ar || organizer.name_en : organizer.name_en) : null;
  const orgBio = organizer ? (ar ? organizer.bio_ar || organizer.bio_en : organizer.bio_en || organizer.bio_ar) : null;
  const orgCity = organizer ? (ar ? organizer.city_ar || organizer.city_en : organizer.city_en) : null;
  const messageOrganizer = organizerId ? () => navigate(`/inbox?personId=${organizerId}&kind=provider`) : undefined;

  return (
    <div className="min-h-screen bg-background pb-[150px] lg:pb-16">
      <SEO
        title={title}
        description={(description || `${title} — ${venue || cityName || ""}`).slice(0, 155)}
        image={event.image || undefined}
        url={`/event/${event.slug || event.id}`}
        type="article"
      />

      <ListingHero
        images={event.image ? [event.image] : []}
        title={title}
        eyebrow={eyebrow}
        ar={ar}
        onBack={() => navigate(-1)}
        wishlistType="event"
        wishlistId={event.id}
        placeholder={
          <div className="w-full h-full bg-gradient-to-br from-primary/40 via-secondary to-accent/40 flex items-center justify-center">
            <Calendar className="w-14 h-14 text-primary-dark/60" aria-hidden />
          </div>
        }
      />

      <div className="max-w-[1040px] mx-auto px-4 lg:flex lg:gap-10 lg:justify-center">
        <main className="max-w-[680px] w-full min-w-0">
          {/* Poster date block */}
          <div className="relative z-10 -mt-6 lg:mt-6 rounded-2xl border border-border bg-card shadow-card p-4 flex gap-4 items-center">
            <div className="flex flex-col items-center justify-center text-center min-w-[76px] pe-4 border-e border-border">
              <span className="text-[13px] font-semibold uppercase tracking-wide text-primary-dark">{monthShort}</span>
              <span className="text-3xl font-bold leading-none text-foreground mt-0.5">{dayNum}</span>
              <span className="text-[13px] text-muted-foreground mt-1">{weekday}</span>
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="flex items-center gap-1.5 text-[15px] text-foreground"><Clock className="w-4 h-4 text-primary-dark flex-shrink-0" /> {timeLabel}</p>
              {whereLine && <p className="flex items-center gap-1.5 text-[15px] text-foreground"><MapPin className="w-4 h-4 text-primary-dark flex-shrink-0" /> <span className="truncate">{whereLine}</span></p>}
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${past ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary-dark"}`}>
                <Timer className="w-3.5 h-3.5" /> {countdown}
              </span>
            </div>
          </div>

          <div className="pt-4 pb-2 lg:hidden">{quickActions}</div>
          <div className="mt-4 -mx-4"><KeyFacts facts={facts} /></div>

          {description && (
            <>
              {standfirst && (
                <div className="pt-6 pb-2">
                  <p className={`article-standfirst ${ar ? "lang-ar" : "lang-en"} text-foreground`}>{standfirst}</p>
                </div>
              )}
              {rest ? (
                <Section title={ar ? "عن الفعالية" : "About"} ar={ar}>
                  <p className="whitespace-pre-line">{rest}</p>
                  <MachineTranslatedNote meta={ev.translation_meta} field={ar ? "description_ar" : "description_en"} className="mt-2" />
                </Section>
              ) : (
                <MachineTranslatedNote meta={ev.translation_meta} field={ar ? "description_ar" : "description_en"} className="pb-4" />
              )}
            </>
          )}

          {(venue || cityName || regionName) && (
            <Section title={ar ? "المكان" : "Where"} ar={ar}>
              {venue && <p className="flex items-center gap-2 font-semibold text-foreground"><MapPin className="w-4 h-4 text-primary-dark" /> {venue}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                {cityName && <Link to={`/city/${event.city_id}`} className="inline-flex items-center min-h-[36px] px-3 rounded-full bg-primary/10 text-sm font-medium text-primary-dark">{cityName}</Link>}
                {regionName && <Link to={`/region/${event.region_id}`} className="inline-flex items-center min-h-[36px] px-3 rounded-full bg-primary/10 text-sm font-medium text-primary-dark">{regionName}</Link>}
              </div>
              {hasGeo && (() => {
                const bbox = [lng! - 0.006, lat! - 0.004, lng! + 0.006, lat! + 0.004].join(",");
                return (
                  <div className="mt-3 rounded-xl overflow-hidden border border-border h-[200px] bg-muted">
                    <iframe title={ar ? "خريطة المكان" : "Venue map"} src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
                      loading="lazy" className="w-full h-full pointer-events-none border-0" tabIndex={-1} />
                  </div>
                );
              })()}
            </Section>
          )}

          <Section title={ar ? "التفاصيل" : "Details"} ar={ar}>
            <dl className="divide-y divide-border">
              {details.map(([k, v]) => (
                <div key={k} className="py-3 first:pt-0">
                  <dt className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt>
                  <dd className="mt-1">{v}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {organizer && (
            <Section title={ar ? "المنظِّم" : "Organiser"} ar={ar}>
              <div className="flex items-center gap-4">
                {organizer.avatar ? (
                  <img src={organizer.avatar} alt={orgName || ""} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold flex-shrink-0">{(orgName || "·").slice(0, 1)}</div>
                )}
                <div className="min-w-0">
                  <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground`}>{orgName}</p>
                  {orgCity && <p className="text-[13px] text-muted-foreground">{orgCity}</p>}
                </div>
              </div>
              {orgBio && <p className="mt-3 line-clamp-4 whitespace-pre-line">{orgBio}</p>}
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => navigate(`/provider/${organizer.slug || organizer.id}`)} className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground">
                  {ar ? "عرض الملف" : "View profile"}
                </button>
                <button type="button" onClick={messageOrganizer} className="flex-1 h-11 rounded-xl border border-primary text-primary-dark text-sm font-semibold inline-flex items-center justify-center gap-1.5">
                  <MessageCircle className="w-4 h-4" /> {ar ? "راسل المنظِّم" : "Message organiser"}
                </button>
              </div>
            </Section>
          )}

          {nearby.length > 0 && (
            <Section title={cityName ? (ar ? `فعاليات أخرى في ${cityName}` : `More events in ${cityName}`) : (ar ? "فعاليات قريبة" : "More events nearby")} ar={ar}>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 snap-x">
                {nearby.map((n) => {
                  const nTitle = ar ? n.title_ar || n.title_en : n.title_en;
                  const nDate = localDate(n.start_date).toLocaleDateString(loc, { day: "numeric", month: "short" });
                  return (
                    <button key={n.id} type="button" onClick={() => navigate(`/event/${n.slug || n.id}`)} className="flex-shrink-0 w-[220px] snap-start text-start">
                      <div className="aspect-[3/2] rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                        {n.image ? <img src={n.image} alt="" loading="lazy" className="w-full h-full object-cover" /> : <Calendar className="w-8 h-8 text-muted-foreground" />}
                      </div>
                      <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-base mt-2 line-clamp-2 text-foreground`}>{nTitle}</p>
                      <p className="text-[13px] text-muted-foreground">{[nDate, isPastEvent(n) ? (ar ? "انتهت" : "Ended") : null].filter(Boolean).join(" · ")}</p>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          <ReadBeforeYouGo cityId={event.city_id} regionId={event.region_id} ar={ar} />
        </main>

        <aside className="hidden lg:block w-[320px] flex-shrink-0 pt-6">
          <div className="sticky top-6 rounded-2xl border border-border bg-card shadow-card p-5 space-y-3">
            <div>
              <p className="text-2xl font-bold text-foreground">{priceLabel}</p>
              <p className="text-[13px] text-muted-foreground">{countdown}</p>
            </div>
            {past ? (
              <>
                <p className="text-[15px] text-foreground">{ar ? "انتهت هذه الفعالية" : "This event has ended"}</p>
                <button type="button" onClick={() => navigate("/calendar")} className="w-full h-12 rounded-xl border border-primary text-primary-dark font-bold">{ar ? "الفعاليات القادمة" : "See upcoming events"}</button>
              </>
            ) : (
              <button type="button" onClick={() => navigate(ticketsPath)} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold">{primaryLabel}</button>
            )}
            {officialSite}
            <div className="pt-2 border-t border-border">{quickActions}</div>
          </div>
        </aside>
      </div>

      {past ? (
        <ActionBar
          price={ar ? "انتهت هذه الفعالية" : "This event has ended"}
          buttonLabel={ar ? "الفعاليات القادمة" : "See upcoming events"}
          onPrimary={() => navigate("/calendar")}
          ar={ar}
        />
      ) : (
        <ActionBar
          price={priceLabel}
          note={countdown}
          buttonLabel={primaryLabel}
          onPrimary={() => navigate(ticketsPath)}
          extra={officialSite}
          ar={ar}
        />
      )}
    </div>
  );
};

export default EventDetail;
