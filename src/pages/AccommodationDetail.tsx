import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users, BedDouble, Bath, Clock, Check, Moon, BookOpen, MapPin, Home, Wifi, Car, Utensils, Snowflake, Coffee,
  Waves, Tv, Flame, Trees, Minus, Plus, ShieldCheck,
} from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { supabase } from "@/integrations/supabase/client";
import { accommodationTypeLabel } from "@/lib/listingTaxonomy";

import LocationChips from "@/components/LocationChips";
import ProviderBioCard from "@/components/ProviderBioCard";
import MessageOwnerButton from "@/components/MessageOwnerButton";
import MachineTranslatedNote from "@/components/MachineTranslatedNote";
import NotFoundView from "@/components/NotFound";
import { Skeleton } from "@/components/ui/skeleton";
import ListingHero from "@/components/listing/ListingHero";
import KeyFacts, { type KeyFact } from "@/components/listing/KeyFacts";
import Section from "@/components/listing/Section";
import ActionBar from "@/components/listing/ActionBar";
import ReadBeforeYouGo from "@/components/listing/ReadBeforeYouGo";
import StaticMap from "@/components/listing/StaticMap";
import RangeDatePicker from "@/components/listing/RangeDatePicker";
import WideCard, { WideRow } from "@/components/listing/WideCard";
import { fmtNumber, formatSlotDay, splitStandfirst } from "@/components/listing/format";

/**
 * HONESTY RULE: this page renders only what the row contains. Every section
 * hides itself when its data is absent — no invented amenities, ratings,
 * policies or availability, and no badge the row has not earned.
 * Availability is not stored for stays, so no date is shown as unavailable.
 */

const AMENITY_ICONS: [RegExp, typeof Check][] = [
  [/wi-?fi|internet|واي|إنترنت|انترنت/i, Wifi],
  [/park|موقف|جراج/i, Car],
  [/kitchen|cook|مطبخ/i, Utensils],
  [/air|a\/c|\bac\b|تكييف|مكيف/i, Snowflake],
  [/breakfast|coffee|tea|إفطار|فطور|قهوة|شاي/i, Coffee],
  [/pool|sea|beach|lake|nile|river|مسبح|بحر|شاطئ|بحيرة|نيل/i, Waves],
  [/tv|television|تلفزيون|تلفاز/i, Tv],
  [/fire|bonfire|bbq|grill|نار|شواء/i, Flame],
  [/garden|terrace|roof|حديقة|تراس|سطح/i, Trees],
];
const amenityIcon = (a: string) => AMENITY_ICONS.find(([re]) => re.test(a))?.[1] ?? Check;

const AccommodationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);

  const { data: place, isLoading } = useQuery({
    queryKey: ["accommodation", id],
    queryFn: () => fetchByIdOrSlug("accommodations", id!),
    enabled: !!id,
  });

  const { data: cityRow } = useQuery({
    queryKey: ["city-name", place?.city_id],
    enabled: !!place?.city_id,
    queryFn: async () => (await supabase.from("cities").select("name_en, name_ar").eq("id", place!.city_id).maybeSingle()).data,
  });

  // Same city first, then same region; published only.
  const { data: similar = [] } = useQuery({
    queryKey: ["accommodation-similar", place?.id, place?.city_id, place?.region_id],
    enabled: !!place,
    queryFn: async () => {
      const cols = "id, slug, name_en, name_ar, image, price_per_night, currency, city_id, accommodation_type";
      const out: any[] = [];
      if (place!.city_id) {
        const { data } = await supabase.from("accommodations").select(cols).eq("status", "published").neq("id", place!.id).eq("city_id", place!.city_id).limit(6);
        out.push(...(data ?? []));
      }
      if (out.length < 6 && place!.region_id) {
        const { data } = await supabase.from("accommodations").select(cols).eq("status", "published").neq("id", place!.id).eq("region_id", place!.region_id).limit(6);
        (data ?? []).forEach((r: any) => { if (!out.some((o) => o.id === r.id)) out.push(r); });
      }
      return out.slice(0, 6);
    },
  });

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.round((new Date(checkOut + "T00:00:00").getTime() - new Date(checkIn + "T00:00:00").getTime()) / 86400000);
  }, [checkIn, checkOut]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-[56vh] max-h-[460px] w-full rounded-none" />
        <div className="max-w-[680px] mx-auto px-4 py-4 space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!place) return <NotFoundView context="stay" />;

  const name = (ar ? place.name_ar || place.name_en : place.name_en) || "";
  const description = (ar ? place.description_ar || place.description_en : place.description_en) || "";
  const unitType = ar ? place.unit_type_ar || place.unit_type_en : place.unit_type_en;
  const houseRules = ar ? place.house_rules_ar || place.house_rules_en : place.house_rules_en;
  const cancellation = ar ? place.cancellation_ar || place.cancellation_en : place.cancellation_en;
  const amenEn: string[] = (place.amenities_en || place.amenities || []).filter(Boolean);
  const amenAr: string[] = (place.amenities_ar || []).filter(Boolean);
  const amenities: string[] = ar ? (amenAr.length ? amenAr : amenEn) : (amenEn.length ? amenEn : amenAr);
  const typeLabel = accommodationTypeLabel(place.accommodation_type, lang);
  // EDITORIAL = Sandal's own reference entry (no owner, nothing to book).
  const isEditorial = place.listing_kind !== "hosted" || !place.host_id;
  const cityName = cityRow ? (ar ? cityRow.name_ar || cityRow.name_en : cityRow.name_en) : null;

  const photos: string[] = [...(Array.isArray(place.images) ? place.images : []), place.image].filter(Boolean) as string[];
  const currency = (place.currency || "EGP").trim();
  const cur = currency === "EGP" ? (ar ? "ج.م" : "EGP") : currency;
  const money = (n: number) => `${fmtNumber(Number(n || 0), ar)} ${cur}`;
  const perNight = ar ? "لليلة" : "per night";
  const { first, rest } = splitStandfirst(description);
  const maxGuests = place.sleeps || 12;

  const facts: KeyFact[] = [];
  if (typeLabel || unitType) facts.push({ icon: Home, label: [typeLabel, unitType].filter(Boolean).join(" · ") });
  if (place.sleeps) facts.push({ icon: Users, label: ar ? `حتى ${fmtNumber(place.sleeps, ar)} ضيوف` : `Sleeps ${place.sleeps}` });
  if (place.bedrooms != null) facts.push({ icon: BedDouble, label: ar ? `${fmtNumber(place.bedrooms, ar)} غرف نوم` : `${place.bedrooms} ${place.bedrooms === 1 ? "bedroom" : "bedrooms"}` });
  if (place.bathrooms != null) facts.push({ icon: Bath, label: ar ? `${fmtNumber(place.bathrooms, ar)} حمامات` : `${place.bathrooms} ${place.bathrooms === 1 ? "bathroom" : "bathrooms"}` });
  if (cityName) facts.push({ icon: MapPin, label: cityName });
  if (place.price_per_night) facts.push({ icon: Moon, label: `${money(place.price_per_night)} ${perNight}` });

  const hasCoords = place.latitude != null && place.longitude != null;
  const subtotal = nights * (place.price_per_night || 0);
  const tooShort = !!place.min_nights && nights > 0 && nights < place.min_nights;
  const honestLine = ar
    ? "لا يتم الدفع داخل التطبيق. يؤكد المضيف التوفر ويرتب الدفع معك."
    : "No payment is taken in the app. The host confirms availability and arranges payment with you.";
  const goBook = () => {
    const q = new URLSearchParams({ type: "stay", id: place.id, guests: String(guests) });
    if (checkIn) q.set("checkin", checkIn);
    if (checkIn && checkOut) q.set("checkout", checkOut);
    navigate(`/booking?${q.toString()}`);
  };
  const messageHost = () => navigate(`/inbox?personId=${place.host_id}&kind=provider`);

  const stepper = (
    <div className="flex items-center justify-between py-3">
      <span className="text-[15px] font-semibold text-foreground">{ar ? "الضيوف" : "Guests"}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} aria-label={ar ? "تقليل" : "Decrease"} className="tap-target rounded-full border border-border"><Minus className="w-4 h-4" /></button>
        <span className="text-base font-semibold w-6 text-center" aria-live="polite">{fmtNumber(guests, ar)}</span>
        <button type="button" onClick={() => setGuests(Math.min(maxGuests, guests + 1))} aria-label={ar ? "زيادة" : "Increase"} className="tap-target rounded-full border border-border"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );

  const totals = nights > 0 && (
    <div className="pt-3 border-t border-border text-[15px]">
      <div className="flex justify-between text-foreground">
        <span>{money(place.price_per_night)} × {fmtNumber(nights, ar)} {ar ? "ليالٍ" : nights === 1 ? "night" : "nights"}</span>
        <span className="font-bold">{money(subtotal)}</span>
      </div>
      {tooShort && (
        <p className="text-[13px] text-destructive mt-1">
          {ar ? `أقل مدة إقامة ${fmtNumber(place.min_nights, ar)} ليالٍ.` : `Minimum stay is ${place.min_nights} nights.`}
        </p>
      )}
    </div>
  );

  const rangeSummary = checkIn
    ? `${formatSlotDay(checkIn, ar)} → ${checkOut ? formatSlotDay(checkOut, ar) : (ar ? "اختر المغادرة" : "choose check-out")}`
    : (ar ? "اختر تاريخ الوصول" : "Choose check-in");

  return (
    <div className={`min-h-screen bg-background ${isEditorial ? "pb-24" : "pb-44 lg:pb-16"}`}>
      <ListingHero
        images={photos}
        title={name}
        eyebrow={[typeLabel || (ar ? "إقامة" : "Stay"), cityName].filter(Boolean).join(" · ")}
        ar={ar}
        onBack={() => navigate(-1)}
        wishlistType="accommodation"
        wishlistId={place.id}
        thumbnails
      />
      <KeyFacts facts={facts} />

      <div className="max-w-[680px] lg:max-w-[1040px] mx-auto px-4 lg:flex lg:gap-10 lg:items-start">
        <main className="flex-1 min-w-0 max-w-[680px]">
          {first && <p className={`article-standfirst ${ar ? "lang-ar" : "lang-en"} text-foreground pt-6`}>{first}</p>}
          <LocationChips cityId={place.city_id} regionId={place.region_id} className="mt-3" />

          {isEditorial && (
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 flex gap-2">
              <BookOpen className="w-4 h-4 text-primary-dark shrink-0 mt-1" />
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {ar
                  ? "معلومة دليلية من سندال. هذا المكان غير مُدار على التطبيق، لذا لا يمكن الحجز أو المراسلة من هنا."
                  : "Practical information from Sandal. This place isn't managed on the app, so it can't be booked or messaged here."}
              </p>
            </div>
          )}

          {rest && (
            <Section title={ar ? "عن المكان" : "About this place"} ar={ar} className="mt-6">
              <p className="whitespace-pre-line">{rest}</p>
              <MachineTranslatedNote meta={place.translation_meta} field={ar ? "description_ar" : "description_en"} />
            </Section>
          )}

          {!isEditorial && (
            <Section title={ar ? "مضيفك" : "Your host"} ar={ar}>
              <div className="-mx-4"><ProviderBioCard providerId={place.host_id} roleLabel={{ en: "Your host", ar: "مضيفك" }} /></div>
              <div className="mt-3 flex"><MessageOwnerButton ownerId={place.host_id} kind="provider" label={ar ? "راسل المضيف" : "Message host"} /></div>
            </Section>
          )}

          {amenities.length > 0 && (
            <Section title={ar ? "ما يقدمه هذا المكان" : "What this place offers"} ar={ar}>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
                {amenities.map((a, i) => {
                  const Icon = amenityIcon(a);
                  return (
                    <li key={i} className="flex items-center gap-2.5">
                      <Icon className="w-5 h-5 text-primary-dark flex-shrink-0" aria-hidden />
                      <span>{a}</span>
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {(houseRules || place.check_in_time || place.check_out_time || place.min_nights) && (
            <Section title={ar ? "قواعد المكان" : "House rules"} ar={ar}>
              <dl className="divide-y divide-border">
                {place.check_in_time && <div className="flex justify-between py-2.5"><dt className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary-dark" />{ar ? "الوصول" : "Check-in"}</dt><dd className="font-semibold">{place.check_in_time}</dd></div>}
                {place.check_out_time && <div className="flex justify-between py-2.5"><dt className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary-dark" />{ar ? "المغادرة" : "Check-out"}</dt><dd className="font-semibold">{place.check_out_time}</dd></div>}
                {place.min_nights ? <div className="flex justify-between py-2.5"><dt className="flex items-center gap-2"><Moon className="w-4 h-4 text-primary-dark" />{ar ? "أقل عدد ليالٍ" : "Minimum stay"}</dt><dd className="font-semibold">{fmtNumber(place.min_nights, ar)}</dd></div> : null}
              </dl>
              {houseRules && <p className="whitespace-pre-line mt-3">{houseRules}</p>}
            </Section>
          )}

          {!isEditorial && (
            <Section id="choose-dates" title={ar ? "اختر التواريخ" : "Choose your dates"} ar={ar}>
              <p className="text-[15px] font-semibold text-foreground mb-3">{rangeSummary}</p>
              <RangeDatePicker checkIn={checkIn} checkOut={checkOut} onChange={(a, b) => { setCheckIn(a); setCheckOut(b); }} ar={ar} />
              {stepper}
              {totals}
              <p className="mt-3 text-[13px] text-muted-foreground">{honestLine}</p>
            </Section>
          )}

          {hasCoords && (
            <Section title={ar ? "الموقع" : "Location"} ar={ar}>
              <StaticMap lat={Number(place.latitude)} lng={Number(place.longitude)} ar={ar} label={cityName} title={ar ? "خريطة المكان" : "Map of the stay"} />
            </Section>
          )}

          {cancellation && (
            <Section title={ar ? "شروط الإلغاء" : "Cancellation"} ar={ar}>
              <p className="flex gap-2"><ShieldCheck className="w-5 h-5 text-primary-dark flex-shrink-0 mt-1" /><span className="whitespace-pre-line">{cancellation}</span></p>
            </Section>
          )}

          {/* Reviews: there is no reviews table for stays, so no section is shown. */}

          <ReadBeforeYouGo cityId={place.city_id} regionId={place.region_id} ar={ar} />

          {similar.length > 0 && (
            <Section title={cityName && similar.every((s: any) => s.city_id === place.city_id) ? (ar ? `إقامات أخرى في ${cityName}` : `More stays in ${cityName}`) : (ar ? "إقامات قريبة" : "More stays nearby")} ar={ar}>
              <WideRow>
                {similar.map((s: any) => (
                  <WideCard key={s.id} path={`/stay/${s.slug || s.id}`} ar={ar} image={s.image}
                    title={(ar ? s.name_ar || s.name_en : s.name_en) || ""}
                    meta={[accommodationTypeLabel(s.accommodation_type, lang), s.price_per_night ? `${fmtNumber(s.price_per_night, ar)} ${(s.currency || "EGP") === "EGP" ? cur : s.currency} ${perNight}` : null].filter(Boolean).join(" · ")} />
                ))}
              </WideRow>
            </Section>
          )}
        </main>

        {!isEditorial && (
          <aside className="hidden lg:block w-[320px] flex-shrink-0 sticky top-6 mt-6">
            <div className="rounded-2xl border border-border bg-card shadow-card p-4">
              <p className="text-2xl font-bold text-foreground">{money(place.price_per_night)}</p>
              <p className="text-[13px] text-muted-foreground">{perNight}</p>
              <button type="button" onClick={() => document.getElementById("choose-dates")?.scrollIntoView({ behavior: "smooth" })}
                className="mt-3 w-full text-start rounded-xl border border-border px-3 py-2 text-[15px] min-h-[44px]">{rangeSummary}</button>
              {stepper}
              {totals}
              <button type="button" onClick={goBook} className="mt-3 w-full h-12 rounded-xl bg-primary text-primary-foreground text-[15px] font-bold">
                {ar ? "اطلب الحجز" : "Request to book"}
              </button>
              <button type="button" onClick={messageHost} className="mt-2 w-full h-11 rounded-xl border border-border text-sm font-semibold text-foreground">
                {ar ? "راسل المضيف" : "Message host"}
              </button>
              <p className="mt-3 text-[13px] text-muted-foreground">{honestLine}</p>
            </div>
          </aside>
        )}
      </div>

      {!isEditorial && (
        <ActionBar
          ar={ar}
          price={money(place.price_per_night)}
          note={nights > 0 ? `${fmtNumber(nights, ar)} ${ar ? "ليالٍ" : nights === 1 ? "night" : "nights"} · ${money(subtotal)}` : perNight}
          buttonLabel={ar ? "اطلب الحجز" : "Request to book"}
          onPrimary={goBook}
          onMessage={messageHost}
        />
      )}
    </div>
  );
};

export default AccommodationDetail;
