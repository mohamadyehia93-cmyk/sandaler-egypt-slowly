import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Users, MapPin, Wallet, MessageCircle, Plus, Minus } from "lucide-react";
import MachineTranslatedNote from "@/components/MachineTranslatedNote";
import { useI18n } from "@/lib/i18n";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundView from "@/components/NotFound";
import { PROVIDER_PUBLIC_COLUMNS } from "@/lib/providerColumns";
import { mapsUrl } from "@/lib/cityCoords";
import ListingHero from "@/components/listing/ListingHero";
import KeyFacts, { type KeyFact } from "@/components/listing/KeyFacts";
import Section from "@/components/listing/Section";
import ActionBar from "@/components/listing/ActionBar";
import ReadBeforeYouGo from "@/components/listing/ReadBeforeYouGo";
import PosterDate, { PosterDateText, countdownLabel, parseLooseDateRange } from "@/components/listing/PosterDate";
import { fmtNumber, listingLocale, splitStandfirst } from "@/components/listing/format";

/**
 * INTEGRITY RULE for this page: every block is backed by a real column on THIS
 * trip row or a query scoped to it. No sample reviews, no invented itinerary,
 * no payment claims — bookings are unpaid requests the organiser confirms.
 */
const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [guests, setGuests] = useState(1);

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", id],
    queryFn: () => fetchByIdOrSlug("trips", id!),
    enabled: !!id,
  });
  const t = trip as any;

  const { data: similar = [] } = useQuery({
    queryKey: ["trip-similar", trip?.id, trip?.region_id, trip?.city_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("trips")
        .select("id, slug, title_en, title_ar, image, price, duration_days, date, city_id")
        .eq("status", "published")
        .eq("region_id", trip!.region_id!)
        .neq("id", trip!.id)
        .limit(20);
      const cid = trip!.city_id;
      return [...(data || [])].sort((a, b) => Number(b.city_id === cid) - Number(a.city_id === cid)).slice(0, 6);
    },
    enabled: !!trip?.id && !!trip?.region_id,
  });

  const organizerId: string | null = t?.organizer_id || null;
  const { data: organizer } = useQuery({
    queryKey: ["provider", organizerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("providers").select(PROVIDER_PUBLIC_COLUMNS).eq("id", organizerId!).maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!organizerId,
  });

  const { data: city } = useQuery({
    queryKey: ["city-name", trip?.city_id],
    queryFn: async () => {
      const { data } = await supabase.from("cities").select("name_en, name_ar").eq("id", trip!.city_id!).maybeSingle();
      return data;
    },
    enabled: !!trip?.city_id,
  });

  const range = useMemo(() => parseLooseDateRange(t?.date), [t?.date]);

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
  if (!trip) return <NotFoundView context="trip" />;

  const pick = (k: string): string | null => (ar ? t[`${k}_ar`] || t[`${k}_en`] : t[`${k}_en`] || t[`${k}_ar`]) || null;
  const title = (ar ? trip.title_ar || trip.title_en : trip.title_en) || "";
  const description = pick("description") || "";
  const route = pick("route");
  const listOf = (k: string): string[] => {
    const v = ar ? (t[`${k}_ar`]?.length ? t[`${k}_ar`] : t[`${k}_en`]) : t[`${k}_en`]?.length ? t[`${k}_en`] : t[`${k}_ar`];
    return Array.isArray(v) ? v.filter((x: unknown) => typeof x === "string" && x.trim()) : [];
  };
  const inclusions = listOf("inclusions");
  const exclusions = listOf("exclusions");
  const cityName = city ? (ar ? city.name_ar || city.name_en : city.name_en) : null;
  const egp = ar ? "ج.م" : "EGP";
  const priceLabel = `${fmtNumber(Number(trip.price || 0), ar)} ${egp}`;
  const photos: string[] = t.images?.length ? t.images : trip.image ? [trip.image] : [];

  const past = range ? (range.end || range.start).getTime() < new Date(new Date().toDateString()).getTime() : false;
  const countdown = range ? countdownLabel(range.start, past, ar) : undefined;
  const dateShort = range
    ? range.end
      ? `${fmtNumber(range.start.getDate(), ar)}–${range.end.toLocaleDateString(listingLocale(ar), { day: "numeric", month: "short" })}`
      : range.start.toLocaleDateString(listingLocale(ar), { day: "numeric", month: "short", year: "numeric" })
    : t.date || null;

  const days = trip.duration_days || null;
  const facts: KeyFact[] = [];
  if (dateShort) facts.push({ icon: Calendar, label: dateShort });
  if (days) facts.push({ icon: Clock, label: days === 1 ? (ar ? "يوم كامل" : "Full day") : ar ? `${fmtNumber(days, ar)} أيام` : `${days} days` });
  if (trip.capacity_max) facts.push({ icon: Users, label: ar ? `حتى ${fmtNumber(trip.capacity_max, ar)} ضيوف` : `up to ${trip.capacity_max} guests` });
  if (cityName) facts.push({ icon: MapPin, label: cityName });
  facts.push({ icon: Wallet, label: priceLabel });

  const { first: standfirst, rest } = splitStandfirst(description);
  const eyebrow = [ar ? "رحلة" : "Trip", cityName].filter(Boolean).join(" · ");

  type Stop = { time?: string; title?: string; desc?: string };
  type Day = { day: number; title?: string; description?: string; stops?: Stop[] };
  const rawIt = (ar ? t.itinerary_ar || t.itinerary_en : t.itinerary_en || t.itinerary_ar) as Day[] | null;
  const maxDays = days || Infinity;
  const itinerary = (Array.isArray(rawIt) ? rawIt : [])
    .filter((d) => (d?.day ?? 0) <= maxDays)
    .map((d) => ({ ...d, stops: (d.stops || []).filter((s) => (s?.title || "").trim() || (s?.desc || "").trim()) }))
    .filter((d) => (d.title || "").trim() || (d.description || "").trim() || d.stops.length > 0);

  const orgName = organizer ? (ar ? organizer.name_ar || organizer.name_en : organizer.name_en) : (ar ? t.organizer_name_ar || t.organizer_name_en : t.organizer_name_en) || null;
  const orgAvatar = organizer?.avatar || t.organizer_image || null;
  const orgBio = organizer ? (ar ? organizer.bio_ar || organizer.bio_en : organizer.bio_en || organizer.bio_ar) : null;
  const orgCity = organizer ? (ar ? organizer.city_ar || organizer.city_en : organizer.city_en) : null;
  const messageOrganizer = organizerId ? () => navigate(`/inbox?personId=${organizerId}&kind=provider`) : undefined;

  const lat = t.latitude != null ? Number(t.latitude) : null;
  const lng = t.longitude != null ? Number(t.longitude) : null;
  const hasGeo = lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng);

  const maxGuests = trip.capacity_max || 12;
  const goBooking = () => navigate(`/booking?type=trip&id=${trip.id}&guests=${guests}`);
  const bookLabel = ar ? "اطلب الحجز" : "Request to book";
  const perPerson = ar ? "للفرد" : "per person";
  const noPayNote = ar
    ? "لا يتم الدفع داخل التطبيق — يُرسل طلبك إلى المنظِّم ليؤكد التوفر ويرتب الدفع معك."
    : "No payment is taken in the app — your request goes to the organiser, who confirms availability and arranges payment with you.";

  const stepper = (
    <div className="flex items-center justify-between py-3">
      <span className="text-[15px] font-semibold text-foreground">{ar ? "عدد الضيوف" : "Guests"}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} aria-label={ar ? "تقليل" : "Fewer guests"} className="tap-target rounded-full border border-border"><Minus className="w-4 h-4" /></button>
        <span className="text-base font-semibold w-6 text-center" aria-live="polite">{fmtNumber(guests, ar)}</span>
        <button type="button" onClick={() => setGuests(Math.min(maxGuests, guests + 1))} aria-label={ar ? "زيادة" : "More guests"} className="tap-target rounded-full border border-border"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );

  const pastBlock = (
    <>
      <p className="text-[15px] text-foreground">{ar ? "مضى موعد هذه الرحلة" : "This trip's date has passed"}</p>
      <button type="button" onClick={() => navigate("/trips")} className="w-full h-12 rounded-xl border border-primary text-primary-dark font-bold">{ar ? "رحلات أخرى" : "See other trips"}</button>
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-[150px] lg:pb-16">
      <ListingHero images={photos} title={title} eyebrow={eyebrow} ar={ar} onBack={() => navigate(-1)} wishlistType="trip" wishlistId={trip.id} overlap={!!t.date} />

      <div className="max-w-[1040px] mx-auto px-4 lg:flex lg:gap-10 lg:justify-center">
        <main className="max-w-[680px] w-full min-w-0">
          {range ? (
            <PosterDate start={range.start} end={range.end} ar={ar} where={route || cityName} countdown={countdown} past={past} className="relative z-10 -mt-6 lg:mt-6" />
          ) : t.date ? (
            <PosterDateText text={t.date} className="relative z-10 -mt-6 lg:mt-6" />
          ) : null}
          <div className="mt-4 -mx-4 lg:mx-0"><KeyFacts facts={facts} /></div>
          <MachineTranslatedNote meta={t.translation_meta} field={ar ? "title_ar" : "title_en"} className="pt-3" />

          {description && (
            <>
              {standfirst && <div className="pt-6 pb-2"><p className={`article-standfirst ${ar ? "lang-ar" : "lang-en"} text-foreground`}>{standfirst}</p></div>}
              {rest ? (
                <Section title={ar ? "عن الرحلة" : "About"} ar={ar}>
                  <p className="whitespace-pre-line">{rest}</p>
                  <MachineTranslatedNote meta={t.translation_meta} field={ar ? "description_ar" : "description_en"} className="mt-2" />
                </Section>
              ) : <MachineTranslatedNote meta={t.translation_meta} field={ar ? "description_ar" : "description_en"} className="pb-4" />}
            </>
          )}

          {itinerary.length > 0 && (
            <Section title={ar ? "البرنامج" : "Itinerary"} ar={ar}>
              <ol className="relative">
                {itinerary.map((d, i) => (
                  <li key={d.day ?? i} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < itinerary.length - 1 && <span className="absolute top-8 bottom-0 start-[15px] w-px bg-border" aria-hidden />}
                    <span className="relative z-10 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {fmtNumber(d.day ?? i + 1, ar)}
                    </span>
                    <div className="pt-0.5 min-w-0 flex-1">
                      <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{ar ? `اليوم ${fmtNumber(d.day ?? i + 1, ar)}` : `Day ${d.day ?? i + 1}`}</p>
                      {(d.title || "").trim() && <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-[1.05rem] text-foreground`}>{d.title}</p>}
                      {(d.description || "").trim() && <p className="text-[15px] leading-7 text-foreground/80 whitespace-pre-line">{d.description}</p>}
                      {d.stops.length > 0 && (
                        <ul className="mt-2 space-y-2">
                          {d.stops.map((s, j) => (
                            <li key={j} className="flex gap-3">
                              {s.time && <span className="text-[13px] font-semibold text-primary-dark tabular-nums w-12 flex-shrink-0">{s.time}</span>}
                              <div className="min-w-0">
                                {s.title && <p className="font-semibold text-foreground">{s.title}</p>}
                                {s.desc && <p className="text-[13px] text-muted-foreground">{s.desc}</p>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {orgName && (
            <Section title={ar ? "منظِّم رحلتك" : "Your organiser"} ar={ar}>
              <div className="flex items-center gap-4">
                {orgAvatar ? <img src={orgAvatar} alt={orgName} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                  : <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold flex-shrink-0">{orgName.slice(0, 1)}</div>}
                <div className="min-w-0">
                  <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground`}>{orgName}</p>
                  {orgCity && <p className="text-[13px] text-muted-foreground">{orgCity}</p>}
                </div>
              </div>
              {orgBio && <p className="mt-3 line-clamp-4 whitespace-pre-line">{orgBio}</p>}
              {organizer && (
                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={() => navigate(`/provider/${organizer.slug || organizer.id}`)} className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground">{ar ? "عرض الملف" : "View profile"}</button>
                  <button type="button" onClick={messageOrganizer} className="flex-1 h-11 rounded-xl border border-primary text-primary-dark text-sm font-semibold inline-flex items-center justify-center gap-1.5">
                    <MessageCircle className="w-4 h-4" /> {ar ? "راسل" : "Message"}
                  </button>
                </div>
              )}
            </Section>
          )}

          {(inclusions.length > 0 || exclusions.length > 0) && (
            <Section title={ar ? "ما يشمله وما لا يشمله" : "What’s included"} ar={ar}>
              <dl className="divide-y divide-border">
                {inclusions.length > 0 && (
                  <div className="py-3 first:pt-0">
                    <dt className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{ar ? "يشمل" : "Included"}</dt>
                    <dd className="mt-1"><ul className="list-disc ps-5 space-y-0.5">{inclusions.map((x, i) => <li key={i}>{x}</li>)}</ul></dd>
                  </div>
                )}
                {exclusions.length > 0 && (
                  <div className="py-3 first:pt-0">
                    <dt className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{ar ? "لا يشمل" : "Not included"}</dt>
                    <dd className="mt-1"><ul className="list-disc ps-5 space-y-0.5">{exclusions.map((x, i) => <li key={i}>{x}</li>)}</ul></dd>
                  </div>
                )}
              </dl>
            </Section>
          )}

          {(route || hasGeo) && (
            <Section title={ar ? "نقطة الانطلاق" : "Departure point"} ar={ar}>
              {hasGeo && (() => {
                const bbox = [lng! - 0.006, lat! - 0.004, lng! + 0.006, lat! + 0.004].join(",");
                return (
                  <div className="relative rounded-xl overflow-hidden border border-border h-[200px] bg-muted mb-2">
                    <iframe title={ar ? "خريطة نقطة الانطلاق" : "Departure point map"} src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
                      loading="lazy" className="w-full h-full pointer-events-none border-0" tabIndex={-1} />
                  </div>
                );
              })()}
              {route && <p className="flex items-center gap-2 font-semibold text-foreground"><MapPin className="w-4 h-4 text-primary-dark" /> {route}</p>}
              {hasGeo && (
                <a href={mapsUrl(lat!, lng!)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 min-h-[44px] text-sm font-semibold text-primary-dark underline">
                  <MapPin className="w-4 h-4" /> {ar ? "افتح في خرائط جوجل" : "Open in Google Maps"}
                </a>
              )}
            </Section>
          )}

          {/* Reviews: trips have no reviews table yet, so no section is shown. */}
          <ReadBeforeYouGo cityId={trip.city_id} regionId={trip.region_id} ar={ar} />

          {similar.length > 0 && (
            <Section title={cityName && similar.every((s) => s.city_id === trip.city_id) ? (ar ? `المزيد في ${cityName}` : `More in ${cityName}`) : (ar ? "رحلات أخرى قريبة" : "More trips nearby")} ar={ar}>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 snap-x">
                {similar.map((s) => {
                  const sTitle = ar ? s.title_ar || s.title_en : s.title_en;
                  const sDays = s.duration_days ? (s.duration_days === 1 ? (ar ? "يوم واحد" : "1 day") : ar ? `${fmtNumber(s.duration_days, ar)} أيام` : `${s.duration_days} days`) : null;
                  return (
                    <button key={s.id} type="button" onClick={() => navigate(`/trip/${s.slug || s.id}`)} className="flex-shrink-0 w-[220px] snap-start text-start">
                      <div className="aspect-[3/2] rounded-xl overflow-hidden bg-muted">{s.image && <img src={s.image} alt="" loading="lazy" className="w-full h-full object-cover" />}</div>
                      <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-base mt-2 line-clamp-2 text-foreground`}>{sTitle}</p>
                      <p className="text-[13px] text-muted-foreground">{[sDays, `${fmtNumber(Number(s.price || 0), ar)} ${egp}`].filter(Boolean).join(" · ")}</p>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}
        </main>

        <aside className="hidden lg:block w-[320px] flex-shrink-0 pt-6">
          <div className="sticky top-6 rounded-2xl border border-border bg-card shadow-card p-5 space-y-2">
            <p className="text-2xl font-bold text-foreground">{priceLabel} <span className="text-sm font-normal text-muted-foreground">{perPerson}</span></p>
            {past ? pastBlock : (
              <>
                {stepper}
                <div className="flex justify-between text-sm pb-2"><span>{ar ? "الإجمالي" : "Subtotal"}</span><span className="font-semibold">{fmtNumber(Number(trip.price || 0) * guests, ar)} {egp}</span></div>
                <button type="button" onClick={goBooking} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold">{bookLabel}</button>
              </>
            )}
            {messageOrganizer && (
              <button type="button" onClick={messageOrganizer} className="w-full h-11 rounded-xl border border-border text-sm font-semibold inline-flex items-center justify-center gap-1.5">
                <MessageCircle className="w-4 h-4" /> {ar ? "راسل المنظِّم" : "Message organiser"}
              </button>
            )}
            <p className="pt-1 text-[13px] text-muted-foreground">{noPayNote}</p>
          </div>
        </aside>
      </div>

      {past ? (
        <ActionBar price={ar ? "مضى موعد هذه الرحلة" : "This date has passed"} buttonLabel={ar ? "رحلات أخرى" : "See other trips"} onPrimary={() => navigate("/trips")} onMessage={messageOrganizer} ar={ar} />
      ) : (
        <ActionBar price={priceLabel} note={countdown ? `${perPerson} · ${countdown}` : perPerson} buttonLabel={bookLabel} onPrimary={goBooking} onMessage={messageOrganizer} ar={ar} />
      )}
    </div>
  );
};

export default TripDetail;
