import { isGuideEntry } from "@/lib/guideEntry";
import WishlistButton from "@/components/WishlistButton";
import { useState, useRef, useMemo, useEffect } from "react";
import { MessageCircle, Bus, Train, Plus, Minus, Clock, Users, Languages, Tag, MapPin } from "lucide-react";
import ListingHero from "@/components/listing/ListingHero";
import KeyFacts, { type KeyFact } from "@/components/listing/KeyFacts";
import Section from "@/components/listing/Section";
import ActionBar from "@/components/listing/ActionBar";
import ReadBeforeYouGo from "@/components/listing/ReadBeforeYouGo";
import MonthDatePicker from "@/components/listing/MonthDatePicker";
import { formatDuration, formatClock, formatSlotDay, fmtNumber, splitStandfirst } from "@/components/listing/format";
import { EXPERIENCE_THEMES } from "@/lib/listingTaxonomy";
import MachineTranslatedNote from "@/components/MachineTranslatedNote";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundView from "@/components/NotFound";
import { PROVIDER_PUBLIC_COLUMNS } from "@/lib/providerColumns";
import { mapsUrl } from "@/lib/cityCoords";

const DEFAULT_CANCELLATION_EN = "Free cancellation up to 48 hours before the start. After that, at the host’s discretion.";
const DEFAULT_CANCELLATION_AR = "إلغاء مجاني حتى ٤٨ ساعة قبل الميعاد، وبعدها حسب تقدير المضيف.";

/**
 * INTEGRITY RULE for this page: every block below must be backed by a real column
 * on THIS row or a real query scoped to this row. No sample reviews, no invented
 * itinerary/policy/impact figures, no payment-protection claims (there is no
 * in-app payment processing — bookings are unpaid requests).
 */
const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const dateRef = useRef<HTMLElement>(null);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);
  const [bioOpen, setBioOpen] = useState(false);

  // ── Fetch experience ──
  const { data: exp, isLoading } = useQuery({
    queryKey: ["experience", id],
    queryFn: () => fetchByIdOrSlug("experiences", id!),
    enabled: !!id,
  });

  // ── Fetch provider ──
  const providerId = exp?.provider_id;
  const { data: provider } = useQuery({
    queryKey: ["provider", providerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("providers").select(PROVIDER_PUBLIC_COLUMNS).eq("id", providerId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });

  // ── Fetch reviews for THIS experience only ──
  const expId = exp?.id;
  const { data: dbReviews } = useQuery({
    queryKey: ["experience-reviews", expId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("experience_reviews")
        .select("*")
        .eq("experience_id", expId)
        // Only reviews written by a real signed-in account. Seeded/sample rows
        // (user_id IS NULL) must never appear as social proof.
        .not("user_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!expId,
  });

  // ── Fetch availability slots ──
  const { data: dbSlots } = useQuery({
    queryKey: ["experience-slots", expId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("experience_slots")
        .select("*")
        .eq("experience_id", expId)
        .gte("slot_date", new Date().toISOString().slice(0, 10))
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!expId,
  });

  // ── Fetch related experiences (same region) ──
  const { data: relatedExps } = useQuery({
    queryKey: ["related-experiences", exp?.region_id, expId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("id, slug, title_en, title_ar, price, rating, duration_minutes, theme, image, city_id")
        .eq("region_id", exp!.region_id)
        .eq("status", "published")
        .neq("id", expId!)
        .limit(20);
      if (error) throw error;
      // Same city first, then the rest of the region.
      const cid = exp!.city_id;
      return [...(data || [])].sort((a, b) => Number(b.city_id === cid) - Number(a.city_id === cid)).slice(0, 6);
    },
    enabled: !!exp?.region_id && !!expId,
  });

  // ── Transport that genuinely serves THIS listing's city ──
  const { data: cityTransport } = useQuery({
    queryKey: ["city-transport", exp?.city_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transport")
        .select("id, name_en, name_ar, from_en, from_ar, to_en, to_ar, price, duration, transport_type")
        .eq("city_id", exp!.city_id)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!exp?.city_id,
  });

  // ── City name (for eyebrow + key facts) ──
  const { data: city } = useQuery({
    queryKey: ["city-name", exp?.city_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("cities").select("name_en, name_ar").eq("id", exp!.city_id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!exp?.city_id,
  });

  // ── Fetch region name ──
  const { data: region } = useQuery({
    queryKey: ["region", exp?.region_id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("regions").select("name_en, name_ar").eq("id", exp!.region_id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!exp?.region_id,
  });

  // ── Derived values ──
  const e = exp as any;
  const pick = (k: string): string | null => (e ? (ar ? e[`${k}_ar`] || e[`${k}_en`] : e[`${k}_en`] || e[`${k}_ar`]) || null : null);
  const title = exp ? (ar ? exp.title_ar || exp.title_en : exp.title_en || exp.title_ar) : "";
  const description = pick("description") || "";
  const hostName = provider
    ? (ar ? provider.name_ar || provider.name_en : provider.name_en)
    : exp ? (ar ? (exp.host_name_ar || exp.host_name_en) : exp.host_name_en) : "";
  const regionName = region ? (ar ? region.name_ar : region.name_en) : "";
  const cityName = city ? (ar ? city.name_ar : city.name_en) : "";
  const egp = t("common.egp");

  // Real slots only — never a sample calendar.
  const slots = useMemo(() => (dbSlots ?? []) as any[], [dbSlots]);
  useEffect(() => {
    if (!selectedSlotId && slots.length) setSelectedSlotId(slots[0].id);
  }, [slots, selectedSlotId]);
  const [userPicked, setUserPicked] = useState(false);
  const selected = slots.find((s) => s.id === selectedSlotId) ?? null;

  // Real reviews only. No "verified attendee" badge: nothing proves attendance.
  const reviews = useMemo(() => (dbReviews ?? []).map((r: any) => ({
    initials: r.reviewer_initials || r.reviewer_name?.slice(0, 2)?.toUpperCase() || "??",
    name: r.reviewer_name,
    city: r.reviewer_city || "",
    rating: r.rating as number,
    text: r.review_text || "",
  })), [dbReviews]);

  const maxGuests = exp?.capacity_max || 12;
  const unitPrice = selected?.price ?? exp?.price ?? 0;
  const subtotal = unitPrice * guests;

  const messageHost = () => navigate(`/inbox?personId=${providerId || exp?.provider_id || ""}&kind=provider`);
  const goBooking = (slotId?: string | null) =>
    navigate(`/booking?type=experience&id=${exp?.id || id}${slotId ? `&slot=${slotId}` : ""}&guests=${guests}`);
  const tellUs = () => navigate("/about#contact");
  const requestToBook = () => {
    if (slots.length > 0 && !userPicked) {
      dateRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    goBooking(selected?.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-[56vh] max-h-[460px] w-full rounded-none" />
        <div className="max-w-[680px] mx-auto p-4 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!exp) return <NotFoundView context="experience" />;

  // A row with no provider is a Sandal guide entry about a real place — never a bookable offer.
  const isGuide = isGuideEntry(exp);

  const photos: string[] = exp.images?.length ? exp.images : exp.image ? [exp.image] : [];
  const remarks = pick("remarks");
  const included = pick("included");
  const notIncluded = pick("not_included");
  const cancellation = pick("cancellation_policy") || (ar ? DEFAULT_CANCELLATION_AR : DEFAULT_CANCELLATION_EN);
  const langs: string[] = Array.isArray(e.languages) ? e.languages.filter(Boolean) : [];
  const themeLabel = exp.theme === "other" && e.theme_other
    ? e.theme_other
    : EXPERIENCE_THEMES.find((x) => x.key === exp.theme)?.label[ar ? "ar" : "en"] ?? null;
  const { first: standfirst, rest } = splitStandfirst(description);
  const hasRating = (exp.rating ?? 0) > 0 && reviews.length > 0;

  // Key facts — only columns that exist.
  const facts: KeyFact[] = [];
  const dur = formatDuration(exp.duration_minutes, ar);
  if (dur) facts.push({ icon: Clock, label: dur });
  if (exp.capacity_max) {
    facts.push({
      icon: Users,
      label: exp.capacity_min && exp.capacity_min > 1 && exp.capacity_min < exp.capacity_max
        ? `${fmtNumber(exp.capacity_min, ar)}–${fmtNumber(exp.capacity_max, ar)} ${ar ? "ضيوف" : "guests"}`
        : `${ar ? "حتى" : "up to"} ${fmtNumber(exp.capacity_max, ar)} ${ar ? "ضيوف" : "guests"}`,
    });
  }
  if (langs.length) facts.push({ icon: Languages, label: langs.join(ar ? "، " : ", ") });
  if (themeLabel) facts.push({ icon: Tag, label: themeLabel });
  if (cityName) facts.push({ icon: MapPin, label: cityName });

  const eyebrow = [ar ? "تجربة" : "Experience", cityName || regionName].filter(Boolean).join(" · ");

  // Itinerary
  type Step = { step?: string; description?: string };
  const arr = (v: unknown): Step[] => (Array.isArray(v) ? (v as Step[]) : []);
  const steps = arr(ar ? (arr(e.itinerary_ar).length ? e.itinerary_ar : e.itinerary_en) : arr(e.itinerary_en).length ? e.itinerary_en : e.itinerary_ar)
    .filter((s) => (s?.step || "").trim() || (s?.description || "").trim());

  // Host
  const hostBio = provider ? (ar ? provider.bio_ar || provider.bio_en : provider.bio_en || provider.bio_ar) : null;
  const hostCity = provider ? (ar ? provider.city_ar || provider.city_en : provider.city_en) : null;
  const hostSub = [hostCity, provider?.years_active ? (ar ? `${fmtNumber(provider.years_active, ar)} سنوات نشاط` : `${provider.years_active} years active`) : null].filter(Boolean).join(" · ");
  const hostChips: string[] = [
    ...(provider?.languages ? String(provider.languages).split(/[,،]/).map((x) => x.trim()).filter(Boolean) : []),
    ...(Array.isArray(provider?.specialties) ? (provider!.specialties as any[]).map((s: any) => (typeof s === "string" ? s : ar ? s.ar || s.en : s.en)).filter(Boolean) : []),
  ];
  const hostInitials = (hostName || "").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const priceLabel = `${fmtNumber(unitPrice, ar)} ${egp}`;
  const perPerson = ar ? "للفرد" : "per person";
  const bookLabel = ar ? "اطلب الحجز" : "Request to book";
  const noPayNote = ar
    ? "لا يتم الدفع داخل التطبيق — يُرسل طلبك إلى المضيف ليؤكد التوفر ويرتب الدفع."
    : "No payment is taken in the app — your request goes to the host, who confirms availability and arranges payment.";

  const stepper = (
    <div className="flex items-center justify-between py-3">
      <span className="text-[15px] font-semibold text-foreground">{ar ? "عدد الضيوف" : "Guests"}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} aria-label={ar ? "تقليل" : "Fewer guests"} className="tap-target rounded-full border border-border">
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-base font-semibold w-6 text-center" aria-live="polite">{fmtNumber(guests, ar)}</span>
        <button type="button" onClick={() => setGuests(Math.min(maxGuests, guests + 1))} aria-label={ar ? "زيادة" : "More guests"} className="tap-target rounded-full border border-border">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const selectedSummary = selected
    ? `${formatSlotDay(selected.slot_date, ar, { weekday: "long", day: "numeric", month: "long" })} · ${formatClock(selected.start_time, ar)}`
    : null;

  return (
    <div className="min-h-screen bg-background pb-[150px] lg:pb-16">
      <ListingHero images={photos} title={title} eyebrow={eyebrow} ar={ar} onBack={() => navigate(-1)} wishlistType="experience" wishlistId={exp.id} />
      <KeyFacts facts={facts} />

      <div className="max-w-[1040px] mx-auto px-4 lg:flex lg:gap-10 lg:justify-center">
        <main className="max-w-[680px] w-full min-w-0">
          {isGuide && (
            <p className="pt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[13px] font-semibold text-foreground">
                <BookOpen className="w-4 h-4 text-primary-dark" />
                {ar ? "دليل صندل · لا يوجد مضيف محلي على صندل بعد" : "Sandal guide · No local host on Sandal yet"}
              </span>
            </p>
          )}
          <MachineTranslatedNote meta={e.translation_meta} field={ar ? "title_ar" : "title_en"} className="pt-3" />
          {hasRating && (
            <p className="pt-3 text-sm text-foreground">
              ★ {fmtNumber(Number(exp.rating), ar)} · {ar ? `${fmtNumber(reviews.length, ar)} تقييمات` : `${reviews.length} reviews`}
            </p>
          )}

          {/* a) Standfirst + body */}
          {description && (
            <div className="py-6">
              {standfirst && <p className={`article-standfirst ${ar ? "lang-ar" : "lang-en"} text-foreground`}>{standfirst}</p>}
              {rest && <p className="mt-4 first:mt-0 text-[15px] leading-7 text-foreground/90 whitespace-pre-line">{rest}</p>}
              <MachineTranslatedNote meta={e.translation_meta} field={ar ? "description_ar" : "description_en"} className="mt-2" />
            </div>
          )}

          {/* c) What you'll do */}
          {steps.length > 0 && (
            <Section title={ar ? "ماذا ستفعل" : "What you’ll do"} ar={ar}>
              <ol className="relative">
                {steps.map((s, i) => (
                  <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < steps.length - 1 && <span className="absolute top-8 bottom-0 start-[15px] w-px bg-border" aria-hidden />}
                    <span className="relative z-10 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {fmtNumber(i + 1, ar)}
                    </span>
                    <div className="pt-0.5 min-w-0">
                      {(s.step || "").trim() && <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-[1.05rem] text-foreground`}>{s.step}</p>}
                      {(s.description || "").trim() && <p className="text-[15px] leading-7 text-foreground/80 whitespace-pre-line">{s.description}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* d) Your host */}
          {!isGuide && (hostName || provider) && (
            <Section title={ar ? "مضيفك" : "Your host"} ar={ar}>
              <div className="flex items-center gap-4">
                {provider?.avatar ? (
                  <img src={provider.avatar} alt={hostName} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-semibold flex-shrink-0">{hostInitials || "·"}</div>
                )}
                <div className="min-w-0">
                  <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground`}>{hostName}</p>
                  {hostSub && <p className="text-[13px] text-muted-foreground">{hostSub}</p>}
                </div>
              </div>
              {hostBio && (
                <div className="mt-3">
                  <p className={`whitespace-pre-line ${bioOpen ? "" : "line-clamp-4"}`}>{hostBio}</p>
                  {hostBio.length > 220 && (
                    <button type="button" onClick={() => setBioOpen(!bioOpen)} className="mt-1 text-sm font-semibold text-primary-dark underline min-h-[44px]">
                      {bioOpen ? (ar ? "أقل" : "less") : (ar ? "المزيد" : "more")}
                    </button>
                  )}
                </div>
              )}
              {hostChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {hostChips.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-muted text-[13px] text-foreground">{c}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                {provider && (
                  <button type="button" onClick={() => navigate(`/provider/${provider.slug || provider.id}`)} className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground">
                    {ar ? "عرض الملف" : "View profile"}
                  </button>
                )}
                <button type="button" onClick={messageHost} className="flex-1 h-11 rounded-xl border border-primary text-primary-dark text-sm font-semibold inline-flex items-center justify-center gap-1.5">
                  <MessageCircle className="w-4 h-4" /> {ar ? "راسل" : "Message"}
                </button>
              </div>
            </Section>
          )}

          {/* e) Choose a date */}
          {!isGuide && (
          <Section ref={dateRef} id="choose-date" title={ar ? "اختر موعدًا" : "Choose a date"} ar={ar}>
            {slots.length > 0 ? (
              <>
                <MonthDatePicker
                  slots={slots}
                  selectedId={selectedSlotId}
                  onSelect={(sid) => { setSelectedSlotId(sid); setUserPicked(true); }}
                  ar={ar}
                  currency={egp}
                />
                <div className="mt-4 border-t border-border">{stepper}</div>
                <div className="flex justify-between text-[15px]">
                  <span>{fmtNumber(guests, ar)} × {priceLabel}</span>
                  <span className="font-semibold text-foreground">{fmtNumber(subtotal, ar)} {egp}</span>
                </div>
                <p className="mt-2 text-[13px] text-muted-foreground">{noPayNote}</p>
              </>
            ) : (
              <>
                <p>{ar ? "لم ينشر المضيف مواعيد بعد. راسله لتحديد موعد." : "The host hasn't published dates yet. Message them to agree a date."}</p>
                <button type="button" onClick={messageHost} className="mt-3 h-11 px-5 rounded-xl border border-primary text-primary-dark text-sm font-semibold inline-flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" /> {ar ? "راسل المضيف" : "Message the host"}
                </button>
              </>
            )}
          </Section>
          )}

          {/* f) Where we'll meet */}
          {(exp.meeting_point_name || (exp.meeting_point_lat != null && exp.meeting_point_lng != null)) && (
            <Section title={ar ? "أين سنلتقي" : "Where we’ll meet"} ar={ar}>
              {exp.meeting_point_lat != null && exp.meeting_point_lng != null ? (() => {
                const lat = Number(exp.meeting_point_lat), lng = Number(exp.meeting_point_lng);
                const bbox = [lng - 0.006, lat - 0.004, lng + 0.006, lat + 0.004].join(",");
                return (
                  <>
                    <div className="relative rounded-xl overflow-hidden border border-border h-[200px] bg-muted">
                      <iframe
                        title={ar ? "خريطة نقطة اللقاء" : "Meeting point map"}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
                        loading="lazy"
                        className="w-full h-full pointer-events-none border-0"
                        tabIndex={-1}
                      />
                    </div>
                    {exp.meeting_point_name && <p className="mt-2 font-semibold text-foreground">{exp.meeting_point_name}</p>}
                    <a href={mapsUrl(lat, lng)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 min-h-[44px] text-sm font-semibold text-primary-dark underline">
                      <MapPin className="w-4 h-4" /> {ar ? "افتح في خرائط جوجل" : "Open in Google Maps"}
                    </a>
                  </>
                );
              })() : (
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-dark" /> {exp.meeting_point_name}</p>
              )}
            </Section>
          )}

          {!isGuide && (<>
          {/* g) Good to know */}
          <Section title={ar ? "معلومات مهمة" : "Good to know"} ar={ar}>
            <dl className="divide-y divide-border">
              {[
                included && [ar ? "يشمل" : "What’s included", included],
                notIncluded && [ar ? "لا يشمل" : "Not included", notIncluded],
                langs.length > 0 && [ar ? "اللغات" : "Languages", langs.join(ar ? "، " : ", ")],
                [ar ? "سياسة الإلغاء" : "Cancellation", cancellation],
                remarks && [ar ? "ملاحظات مهمة" : "Main remarks", remarks],
              ].filter(Boolean).map((row) => {
                const [k, v] = row as [string, string];
                return (
                  <div key={k} className="py-3 first:pt-0">
                    <dt className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="mt-1 whitespace-pre-line" data-testid={k === (ar ? "سياسة الإلغاء" : "Cancellation") ? "cancellation-policy" : undefined}>{v}</dd>
                  </div>
                );
              })}
            </dl>
            {remarks && <MachineTranslatedNote meta={e.translation_meta} field={ar ? "remarks_ar" : "remarks_en"} className="mt-1" />}
          </Section>

          {/* h) Reviews (real only) */}
          <Section title={ar ? "التقييمات" : "Reviews"} ar={ar}>
            {reviews.length > 0 ? (
              <ul className="space-y-4">
                {reviews.slice(0, 6).map((r, i) => (
                  <li key={i}>
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-full bg-accent text-accent-foreground text-xs font-semibold flex items-center justify-center">{r.initials}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{r.name}</p>
                        <p className="text-[13px] text-muted-foreground">{"★".repeat(Math.round(r.rating))}{r.city ? ` · ${r.city}` : ""}</p>
                      </div>
                    </div>
                    {r.text && <p className="mt-1.5">{r.text}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">{ar ? "لا توجد تقييمات بعد." : "No reviews yet."}</p>
            )}
          </Section>
          </>)}

          {/* i) Getting there */}
          {cityTransport && cityTransport.length > 0 && (
            <Section title={t("experience.getting_there")} ar={ar}>
              <ul className="divide-y divide-border">
                {cityTransport.map((tr) => {
                  const Icon = tr.transport_type === "train" ? Train : Bus;
                  const from = ar ? (tr.from_ar || tr.from_en) : tr.from_en;
                  const to = ar ? (tr.to_ar || tr.to_en) : tr.to_en;
                  return (
                    <li key={tr.id}>
                      <button type="button" onClick={() => navigate(`/transport/${tr.id}`)} className="w-full flex items-center gap-3 py-3 text-start">
                        <Icon className="w-5 h-5 text-primary-dark flex-shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-foreground">{ar ? tr.name_ar || tr.name_en : tr.name_en}</span>
                          <span className="block text-[13px] text-muted-foreground">
                            {[from && to ? `${from} → ${to}` : null, tr.duration, `${fmtNumber(tr.price, ar)} ${egp}`].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {/* j) Read before you go */}
          <ReadBeforeYouGo cityId={exp.city_id} regionId={exp.region_id} ar={ar} />

          {/* k) More nearby */}
          {relatedExps && relatedExps.length > 0 && (
            <Section title={cityName && relatedExps.every((r) => r.city_id === exp.city_id) ? (ar ? `المزيد في ${cityName}` : `More in ${cityName}`) : (ar ? "المزيد بالقرب" : "More nearby")} ar={ar}>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 snap-x">
                {relatedExps.map((r) => {
                  const rTitle = ar ? r.title_ar || r.title_en : r.title_en;
                  return (
                    <button key={r.id} type="button" onClick={() => navigate(`/experience/${r.slug || r.id}`)} className="flex-shrink-0 w-[220px] snap-start text-start">
                      <div className="aspect-[3/2] rounded-xl overflow-hidden bg-muted">
                        {r.image && <img src={r.image} alt="" loading="lazy" className="w-full h-full object-cover" />}
                      </div>
                      <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-base mt-2 line-clamp-2 text-foreground`}>{rTitle}</p>
                      <p className="text-[13px] text-muted-foreground">
                        {[formatDuration(r.duration_minutes, ar), `${fmtNumber(r.price, ar)} ${egp}`].filter(Boolean).join(" · ")}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}
        </main>

        {/* Desktop sticky booking card */}
        {isGuide ? (
        <aside className="hidden lg:block w-[320px] flex-shrink-0 pt-6">
          <div className="sticky top-6 rounded-2xl border border-border bg-card p-5">
            <p className="text-[15px] text-foreground">{ar ? "تعرف مضيفًا محليًا هنا؟" : "Know a local host here?"}</p>
            <button type="button" onClick={tellUs} className="mt-3 w-full h-11 rounded-xl border border-border text-sm font-semibold">{ar ? "أخبرنا" : "Tell us"}</button>
            <WishlistButton itemType="experience" itemId={exp.id} variant="heart" withLabel className="mt-2 w-full h-11 rounded-xl border border-border text-sm font-semibold inline-flex items-center justify-center gap-1.5" />
          </div>
        </aside>
        ) : (
        <aside className="hidden lg:block w-[320px] flex-shrink-0 pt-6">
          <div className="sticky top-6 rounded-2xl border border-border bg-card shadow-card p-5">
            <p className="text-2xl font-bold text-foreground">{priceLabel} <span className="text-sm font-normal text-muted-foreground">{perPerson}</span></p>
            {slots.length > 0 ? (
              <>
                <button type="button" onClick={() => dateRef.current?.scrollIntoView({ behavior: "smooth" })} className="mt-3 w-full rounded-xl border border-border px-3 py-2.5 text-start">
                  <span className="block text-[13px] text-muted-foreground">{ar ? "الموعد" : "Date"}</span>
                  <span className="block text-sm font-semibold text-foreground">{selectedSummary}</span>
                </button>
                {stepper}
                <div className="flex justify-between text-sm pb-3">
                  <span>{ar ? "الإجمالي" : "Subtotal"}</span>
                  <span className="font-semibold">{fmtNumber(subtotal, ar)} {egp}</span>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">{ar ? "لا توجد مواعيد منشورة بعد." : "No dates published yet."}</p>
            )}
            <button type="button" onClick={() => goBooking(selected?.id)} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold">{bookLabel}</button>
            <button type="button" onClick={messageHost} className="mt-2 w-full h-11 rounded-xl border border-border text-sm font-semibold inline-flex items-center justify-center gap-1.5">
              <MessageCircle className="w-4 h-4" /> {ar ? "راسل المضيف" : "Message host"}
            </button>
            <p className="mt-3 text-[13px] text-muted-foreground">{noPayNote}</p>
          </div>
        </aside>
        )}
      </div>

      {isGuide ? (
        <div className="lg:hidden fixed inset-x-0 z-40 bg-card border-t border-border" style={{ bottom: "calc(68px + env(safe-area-inset-bottom, 0px))" }}>
          <div className="max-w-[680px] mx-auto px-4 py-2 flex items-center gap-3">
            <button type="button" onClick={tellUs} className="flex-1 min-h-[44px] text-start text-[15px] text-foreground">
              {ar ? "تعرف مضيفًا محليًا هنا؟ " : "Know a local host here? "}
              <span className="font-semibold text-primary-dark underline">{ar ? "أخبرنا" : "Tell us"}</span>
            </button>
            <WishlistButton itemType="experience" itemId={exp.id} variant="heart" className="tap-target rounded-full border border-border" />
          </div>
        </div>
      ) : (
      <ActionBar
        price={priceLabel}
        note={selected && userPicked ? `${perPerson} · ${selectedSummary}` : perPerson}
        buttonLabel={bookLabel}
        onPrimary={requestToBook}
        onMessage={messageHost}
        ar={ar}
      />
      )}
    </div>
  );
};

export default ExperienceDetail;
