import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Calendar, BookOpen, LayoutGrid, Headphones, Play, ChevronRight, ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useAudioTours, useTransport, useExperiences, useTrips, useAccommodations, useProducts, useWhosWho, usePosts, useEvents, useCauses, usePrograms, useOrganizations } from "@/hooks/useListings";
import { postCategoryLabel } from "@/lib/postCategories";
import { PROVIDER_PUBLIC_COLUMNS } from "@/lib/providerColumns";
import CityOfferingsMap, { type OfferingPin } from "@/components/CityOfferingsMap";
import NotFoundView from "@/components/NotFound";
import DetailSkeleton from "@/components/DetailSkeleton";
import SectionEmptyState, { type EmptyKind } from "@/components/SectionEmptyState";
import ProgramsCausesSection from "@/components/ProgramsCausesSection";
import Avatar from "@/components/AvatarFallback";
import ListingHero from "@/components/listing/ListingHero";
import KeyFacts, { type KeyFact } from "@/components/listing/KeyFacts";
import Section from "@/components/listing/Section";
import WideCard, { WideRow } from "@/components/listing/WideCard";
import { fmtNumber, formatDuration, listingLocale, splitStandfirst } from "@/components/listing/format";

/**
 * INTEGRITY RULE: the city hub shows only the city's own row and real published
 * rows linked to it. No sample listings, no invented counts; an empty offer
 * section keeps its heading and shows one shared "nothing listed yet" line.
 */

const today = () => new Date().toISOString().slice(0, 10);

const CityDetail = () => {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const { data: dbTransport = [], isLoading: l1 } = useTransport();
  const { data: dbAudioTours = [], isLoading: l2 } = useAudioTours();
  const { data: dbExperiences = [], isLoading: l3 } = useExperiences();
  const { data: dbTrips = [], isLoading: l4 } = useTrips();
  const { data: dbAccommodations = [], isLoading: l5 } = useAccommodations();
  const { data: dbProducts = [], isLoading: l6 } = useProducts();
  const { data: dbWhosWho = [] } = useWhosWho();
  const { data: dbPosts = [], isLoading: l8 } = usePosts();
  const { data: dbEvents = [] } = useEvents();
  const { data: dbCauses = [] } = useCauses();
  const { data: dbPrograms = [] } = usePrograms();
  const { data: dbOrgs = [] } = useOrganizations();
  const isLoading = l1 || l2 || l3 || l4 || l5 || l6 || l8;

  const { data: cityRow, isLoading: lCity } = useQuery({
    queryKey: ["city", cityId],
    enabled: !!cityId,
    queryFn: async () => {
      const { data, error } = await supabase.from("cities").select("*").eq("id", cityId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: credit } = useQuery({
    queryKey: ["image-credit", cityRow?.image],
    enabled: !!cityRow?.image,
    queryFn: async () => {
      const { data } = await supabase.from("image_credits").select("artist, license, source_url").eq("image_url", cityRow!.image!).limit(1);
      return data?.[0] ?? null;
    },
  });

  // Providers whose profile names this city (providers store city as text).
  const { data: cityProviders = [] } = useQuery({
    queryKey: ["city-providers", cityRow?.name_en],
    enabled: !!cityRow?.name_en,
    queryFn: async () => {
      const { data } = await (supabase as any).from("providers").select(PROVIDER_PUBLIC_COLUMNS)
        .ilike("city_en", cityRow!.name_en).eq("status", "published").limit(24);
      return (data || []) as any[];
    },
  });

  if (isLoading || lCity) return <DetailSkeleton variant="city" />;
  if (!cityRow) return <NotFoundView context="city" />;

  const L = <T,>(en: T, arv: T) => (ar ? arv || en : en || arv);
  const cityName = L(cityRow.name_en, cityRow.name_ar) || "";
  const governorate = L(cityRow.governorate_en, cityRow.governorate_ar);
  const bestTime = L(cityRow.best_time_en, cityRow.best_time_ar);
  const overview = L(cityRow.overview_en, cityRow.overview_ar) || "";
  const { first: standfirst, rest: overviewRest } = splitStandfirst(overview);
  const egp = ar ? "ج.م" : "EGP";
  const money = (n: number) => (!n ? (ar ? "مجاني" : "Free") : `${fmtNumber(n, ar)} ${egp}`);
  const inCity = (r: any) => r.city_id === cityId;

  const posts = (dbPosts as any[]).filter(inCity);
  const experiences = (dbExperiences as any[]).filter(inCity);
  const trips = (dbTrips as any[]).filter(inCity);
  const tours = (dbAudioTours as any[]).filter(inCity);
  const stays = (dbAccommodations as any[]).filter(inCity);
  const products = (dbProducts as any[]).filter(inCity);
  const events = (dbEvents as any[]).filter(inCity).filter((e) => (e.end_date || e.start_date || "") >= today())
    .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)));
  const people = (dbWhosWho as any[]).filter(inCity);
  const orgs = (dbOrgs as any[]).filter(inCity);
  const transport = (dbTransport as any[]).filter(inCity);
  const programs = (dbPrograms as any[]).filter(inCity);
  const causes = (dbCauses as any[]).filter(inCity);

  const guideCount = experiences.filter((x: any) => !x.provider_id).length;
  const offerCount = experiences.length - guideCount + trips.length + tours.length + stays.length + products.length + events.length;
  const facts: KeyFact[] = [];
  if (governorate) facts.push({ icon: MapPin, label: governorate });
  if (bestTime) facts.push({ icon: Calendar, label: ar ? `أفضل وقت: ${bestTime}` : `Best time: ${bestTime}` });
  if (offerCount) facts.push({ icon: LayoutGrid, label: ar ? `${fmtNumber(offerCount, ar)} عروض` : `${offerCount} ${offerCount === 1 ? "offer" : "offers"}` });
  if (guideCount) facts.push({ icon: BookOpen, label: ar ? `${fmtNumber(guideCount, ar)} أدلة` : `${guideCount} ${guideCount === 1 ? "guide" : "guides"}` });
  if (posts.length) facts.push({ icon: BookOpen, label: ar ? `${fmtNumber(posts.length, ar)} مقالات` : `${posts.length} ${posts.length === 1 ? "article" : "articles"}` });

  const Chevron = ar ? ChevronLeft : ChevronRight;
  const Head = ({ title, seeAll }: { title: string; seeAll?: string }) => (
    <div className="flex items-baseline justify-between gap-3 mb-3">
      <h2 className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground`}>{title}</h2>
      {seeAll && (
        <Link to={seeAll} className="inline-flex items-center min-h-[44px] text-sm font-semibold text-primary-dark flex-shrink-0">
          {ar ? "عرض الكل" : "See all"} <Chevron className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
  const Block = ({ title, seeAll, children }: { title: string; seeAll?: string; children: ReactNode }) => (
    <Section ar={ar}><Head title={title} seeAll={seeAll} />{children}</Section>
  );
  const Empty = ({ kind }: { kind: EmptyKind }) => <SectionEmptyState kind={kind} placeEn={cityRow.name_en || ""} placeAr={cityRow.name_ar} className="!px-0" />;
  const readTime = (m?: number | null) => (m ? (ar ? `${fmtNumber(m, ar)} دقائق قراءة` : `${m} min read`) : null);
  const catLabel = (c?: string | null) => (c ? postCategoryLabel(c)[ar ? "ar" : "en"] : null);
  const title = (r: any) => (ar ? r.title_ar || r.name_ar || r.title_en || r.name_en : r.title_en || r.name_en) || "";

  const <Block title={ar ? "ابدأ من هنا" : "Start here"} seeAll={lead ? "/posts" : undefined}>
            {lead ? (<>
            <div className="lg:grid lg:grid-cols-[1.4fr_1fr] lg:gap-8">
              <Link to={`/post/${lead.slug || lead.id}`} className="block">
                <div className="aspect-video rounded-xl overflow-hidden bg-muted">{lead.image && <img src={lead.image} alt="" className="w-full h-full object-cover" />}</div>
                {catLabel(lead.category) && <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-dark mt-3">{catLabel(lead.category)}</p>}
                <p className={`listing-title ${ar ? "lang-ar" : "lang-en"} text-foreground text-2xl mt-1`}>{title(lead)}</p>
                {L(lead.excerpt_en, lead.excerpt_ar) && <p className="text-[15px] leading-7 text-foreground/85 mt-2 line-clamp-3">{L(lead.excerpt_en, lead.excerpt_ar)}</p>}
                {readTime(lead.read_time_minutes) && <p className="text-[13px] text-muted-foreground mt-1">{readTime(lead.read_time_minutes)}</p>}
              </Link>
              {more.length > 0 && (
                <ul className="space-y-4 mt-6 lg:mt-0">
                  {more.slice(0, 4).map((p) => (
                    <li key={p.id}>
                      <Link to={`/post/${p.slug || p.id}`} className="flex gap-3 items-start">
                        {p.image ? <img src={p.image} alt="" loading="lazy" className="w-24 h-16 rounded-lg object-cover flex-shrink-0" /> : <div className="w-24 h-16 rounded-lg bg-muted flex-shrink-0" />}
                        <div className="min-w-0">
                          {catLabel(p.category) && <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-dark">{catLabel(p.category)}</p>}
                          <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-base leading-snug text-foreground line-clamp-2`}>{title(p)}</p>
                          {readTime(p.read_time_minutes) && <p className="text-[13px] text-muted-foreground">{readTime(p.read_time_minutes)}</p>}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>) : <Empty kind="stories" />}
          </Block>

        {/* b) Things to do */}
        <Block title={ar ? "أشياء تفعلها" : "Things to do"} seeAll={thingsToDo.length ? (experiences.length ? "/?tab=experiences" : "/trips") : undefined}>
            {thingsToDo.length > 0 ? (<>
            <WideRow>{thingsToDo.map((c) => <WideCard key={c.k} ar={ar} {...c} />)}</WideRow>
          </>) : <Empty kind="experiences" />}
          </Block>

        {/* c) Listen */}
        <Block title={ar ? "استمع" : "Listen"} seeAll={tours.length ? "/audio-tours" : undefined}>
            {tours.length > 0 ? (<>
            <WideRow>
              {tours.map((a) => (
                <WideCard key={a.id} ar={ar} path={`/audio-tour/${a.slug || a.id}`} image={a.image} title={title(a)}
                  meta={[formatDuration(a.duration_minutes, ar), money(a.price)].filter(Boolean).join(" · ")}
                  badge={<span className="w-10 h-10 rounded-full bg-background/90 text-primary-dark flex items-center justify-center shadow-card" aria-hidden>
                    {a.audio_url ? <Play className="w-4 h-4 ms-0.5" /> : <Headphones className="w-4 h-4" />}
                  </span>} />
              ))}
            </WideRow>
          </>) : <Empty kind="audio" />}
          </Block>

        {/* d) Where to stay */}
        <Block title={ar ? "أين تقيم" : "Where to stay"}>
            {stays.length > 0 ? (<>
            <WideRow>
              {stays.map((s) => (
                <WideCard key={s.id} ar={ar} path={`/stay/${s.slug || s.id}`} image={s.image} title={title(s)}
                  meta={s.price_per_night ? `${fmtNumber(s.price_per_night, ar)} ${egp} ${ar ? "لليلة" : "per night"}` : null} />
              ))}
            </WideRow>
          </>) : <Empty kind="stays" />}
          </Block>

        {/* e) What's on */}
        <Block title={ar ? "ماذا يحدث" : "What’s on"} seeAll={events.length ? "/calendar" : undefined}>
            {events.length > 0 ? (<>
            <WideRow>
              {events.map((e) => {
                const d = new Date(String(e.start_date).slice(0, 10) + "T00:00:00");
                return (
                  <WideCard key={e.id} ar={ar} path={`/event/${e.slug || e.id}`} image={e.image} title={title(e)}
                    meta={[L(e.venue_en, e.venue_ar), e.is_free || !e.price ? (ar ? "مجاني" : "Free") : money(Number(e.price))].filter(Boolean).join(" · ")}
                    badge={
                      <span className="flex flex-col items-center rounded-lg bg-background/95 px-2.5 py-1 shadow-card text-center">
                        <span className="text-[11px] font-semibold uppercase text-primary-dark leading-tight">{d.toLocaleDateString(listingLocale(ar), { month: "short" })}</span>
                        <span className="text-lg font-bold leading-none text-foreground">{fmtNumber(d.getDate(), ar)}</span>
                      </span>
                    } />
                );
              })}
            </WideRow>
          </>) : <Empty kind="events" />}
          </Block>

        {/* f) Made here */}
        <Block title={ar ? "صُنع هنا" : "Made here"}>
            {products.length > 0 ? (<>
            <WideRow>
              {products.map((p) => (
                <WideCard key={p.id} ar={ar} path={`/product/${p.slug || p.id}`} image={p.image} title={title(p)}
                  meta={[L(p.seller_name_en, p.seller_name_ar), money(p.price)].filter(Boolean).join(" · ")} />
              ))}
            </WideRow>
          </>) : <Empty kind="products" />}
          </Block>

        {/* Getting around (real rides only) */}
        <Block title={ar ? "التنقل" : "Getting around"}>
            {transport.length > 0 ? (<>
            <ul className="divide-y divide-border">
              {transport.map((tr) => (
                <li key={tr.id}>
                  <Link to={`/transport/${tr.slug || tr.id}`} className="flex items-center justify-between gap-3 py-3 min-h-[44px]">
                    <span className="font-semibold text-foreground">{title(tr)}</span>
                    {tr.price ? <span className="text-[13px] text-muted-foreground flex-shrink-0">{money(tr.price)}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </>) : <Empty kind="transport" />}
          </Block>

        {/* g) People and organisations */}
        <Block title={ar ? "أشخاص ومؤسسات" : "People and organisations"} seeAll={people.length ? "/people" : undefined}>
            {peopleChips.length > 0 ? (<>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-1">
              {peopleChips.map((p) => (
                <button key={p.k} type="button" onClick={() => navigate(p.path)} className="flex-shrink-0 w-[96px] text-center">
                  <Avatar src={p.img} name={p.name || ""} className="w-20 h-20 rounded-full mx-auto" />
                  <p className="text-[13px] font-semibold text-foreground mt-2 line-clamp-2 leading-snug">{p.name}</p>
                  {p.sub && <p className="text-[11px] text-muted-foreground line-clamp-1">{p.sub}</p>}
                </button>
              ))}
            </div>
          </>) : <Empty kind="organisations" />}
          </Block>

        <div className="[&>section]:border-t [&>section]:border-border [&>section]:py-6 [&>section]:-mx-4">
          <ProgramsCausesSection programs={programs} causes={causes} empty={<SectionEmptyState kind="organisations" placeEn={cityRow.name_en || ""} placeAr={cityRow.name_ar} />} />
        </div>

        {/* h) Highlights */}
        {highlightsEn.length > 0 && (
          <Block title={ar ? "أبرز المعالم" : "Highlights"}>
            <ul className="divide-y divide-border max-w-[680px]">
              {highlightsEn.map((hEn, i) => {
                const slug = hEn.toLowerCase().replace(/['’`]/g, "").replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-+|-+$/g, "");
                return (
                  <li key={i}>
                    <Link to={`/city/${cityId}/highlight/${slug}`} className="flex items-center justify-between py-3 min-h-[44px] text-foreground">
                      <span className="font-semibold">{highlightsLoc[i] || hEn}</span>
                      <Chevron className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Block>
        )}

        {(about.length > 0 || knownFor.length > 0) && (
          <Section title={ar ? `عن ${cityName}` : `About ${cityName}`} ar={ar}>
            <div className="max-w-[680px] space-y-4">
              {about.map((a) => (
                <div key={a.h}>
                  <h3 className="text-[15px] font-bold text-foreground">{a.h}</h3>
                  <p>{a.t}</p>
                </div>
              ))}
              {knownFor.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {knownFor.map((k, i) => <span key={i} className="px-2.5 py-1 rounded-full bg-muted text-[13px]">{k}</span>)}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* i) Map of offers */}
        {pins.length > 0 && (
          <Section title={ar ? `خريطة ${cityName}` : `Map of ${cityName}`} ar={ar}>
            <div className="-mx-4 lg:mx-0">
              <CityOfferingsMap cityId={cityId || ""} cityName={{ en: cityRow.name_en, ar: cityRow.name_ar || cityRow.name_en }} offerings={pins} />
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

export default CityDetail;
