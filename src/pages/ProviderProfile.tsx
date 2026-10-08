import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Clock, Languages, LayoutGrid, MessageCircle, CheckCircle } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import FollowButton from "@/components/FollowButton";
import Avatar from "@/components/AvatarFallback";
import NotFoundView from "@/components/NotFound";
import ProviderStatusView from "@/components/ProviderStatusView";
import ProviderContactCard from "@/components/ProviderContactCard";
import ExpertCollections from "@/components/ExpertCollections";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PROVIDER_PUBLIC_COLUMNS } from "@/lib/providerColumns";
import KeyFacts, { type KeyFact } from "@/components/listing/KeyFacts";
import Section from "@/components/listing/Section";
import ReadBeforeYouGo from "@/components/listing/ReadBeforeYouGo";
import { fmtNumber, formatDuration, listingLocale } from "@/components/listing/format";

/**
 * INTEGRITY RULE for this page: everything shown comes from this provider's row
 * or from published rows they own. No sample listings, ratings or follower counts;
 * empty sections hide themselves.
 */

const roleLabels: Record<string, { en: string; ar: string }> = {
  "culture-actor": { en: "Culture actor", ar: "فاعل ثقافي" },
  "service-provider": { en: "Experience host", ar: "مضيف تجارب" },
  "accommodation-host": { en: "Stay host", ar: "مضيف إقامة" },
  "transport-provider": { en: "Transport provider", ar: "مقدم مواصلات" },
  "trip-organizer": { en: "Trip organiser", ar: "منظم رحلات" },
  "product-seller": { en: "Maker", ar: "حرفي" },
  organization: { en: "Organisation", ar: "مؤسسة" },
};

type OfferType = "experience" | "trip" | "stay" | "product" | "event";
type Offer = { type: OfferType; id: string; path: string; title: string; image: string | null; meta: string };

// Owner columns all hold providers.id (see src/lib/providerRecord.ts).
const SOURCES: { type: OfferType; table: string; col: string; route: string; cols: string }[] = [
  { type: "experience", table: "experiences", col: "provider_id", route: "/experience", cols: "id, slug, title_en, title_ar, image, price, duration_minutes" },
  { type: "trip", table: "trips", col: "organizer_id", route: "/trip", cols: "id, slug, title_en, title_ar, image, price, duration_days, date" },
  { type: "stay", table: "accommodations", col: "host_id", route: "/stay", cols: "id, slug, name_en, name_ar, image, price_per_night" },
  { type: "product", table: "products", col: "seller_id", route: "/product", cols: "id, slug, name_en, name_ar, image, price" },
  { type: "event", table: "events", col: "organizer_id", route: "/event", cols: "id, slug, title_en, title_ar, image, price, is_free, start_date" },
];

const TYPE_LABEL: Record<OfferType, { en: string; ar: string }> = {
  experience: { en: "Experiences", ar: "تجارب" },
  trip: { en: "Trips", ar: "رحلات" },
  stay: { en: "Stays", ar: "إقامات" },
  product: { en: "Products", ar: "منتجات" },
  event: { en: "Events", ar: "فعاليات" },
};

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const { user: authUser } = useAuth();
  const [bioOpen, setBioOpen] = useState(false);
  const [tab, setTab] = useState<OfferType | null>(null);

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", id],
    queryFn: async () => {
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const col = UUID_RE.test(id!) ? "id" : "slug";
      const { data, error } = await (supabase as any).from("providers").select(PROVIDER_PUBLIC_COLUMNS).eq(col, id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: rawOffers = [] } = useQuery({
    queryKey: ["provider-offers", provider?.id],
    queryFn: async () => {
      const results = await Promise.all(
        SOURCES.map(async (s) => {
          const { data, error } = await (supabase as any).from(s.table).select(s.cols).eq(s.col, provider!.id).eq("status", "published").limit(24);
          return error ? [] : (data || []).map((r: any) => ({ ...r, __type: s.type, __route: s.route }));
        }),
      );
      return results.flat();
    },
    enabled: !!provider?.id,
  });

  const expIds = rawOffers.filter((r: any) => r.__type === "experience").map((r: any) => r.id);
  const { data: reviews = [] } = useQuery({
    queryKey: ["provider-reviews", expIds.join(",")],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("experience_reviews").select("id, rating, review_text, reviewer_name, reviewer_city, created_at")
        .in("experience_id", expIds).not("user_id", "is", null).order("created_at", { ascending: false }).limit(6);
      return error ? [] : (data as any[]);
    },
    enabled: expIds.length > 0,
  });

  const { data: cityRow } = useQuery({
    queryKey: ["provider-city", provider?.city_en],
    queryFn: async () => {
      const { data } = await supabase.from("cities").select("id, region_id").ilike("name_en", provider!.city_en).maybeSingle();
      return data;
    },
    enabled: !!provider?.city_en,
  });

  const egp = ar ? "ج.م" : "EGP";
  const offers: Offer[] = useMemo(() => rawOffers.map((r: any) => {
    const title = (ar ? r.title_ar || r.name_ar || r.title_en || r.name_en : r.title_en || r.name_en) || "";
    const money = (n: number) => `${fmtNumber(Number(n || 0), ar)} ${egp}`;
    let meta: (string | null)[] = [];
    if (r.__type === "experience") meta = [formatDuration(r.duration_minutes, ar), money(r.price)];
    if (r.__type === "trip") meta = [r.date || (r.duration_days ? (ar ? `${fmtNumber(r.duration_days, ar)} أيام` : `${r.duration_days} days`) : null), money(r.price)];
    if (r.__type === "stay") meta = [`${money(r.price_per_night)} ${ar ? "/ليلة" : "/ night"}`];
    if (r.__type === "product") meta = [money(r.price)];
    if (r.__type === "event") meta = [
      r.start_date ? new Date(r.start_date.slice(0, 10) + "T00:00:00").toLocaleDateString(listingLocale(ar), { day: "numeric", month: "short" }) : null,
      r.is_free || !r.price ? (ar ? "مجاني" : "Free") : money(r.price),
    ];
    return { type: r.__type, id: r.id, path: `${r.__route}/${r.slug || r.id}`, title, image: r.image || null, meta: meta.filter(Boolean).join(" · ") };
  }), [rawOffers, ar, egp]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-44 w-full rounded-none" />
        <div className="max-w-[680px] mx-auto px-4 space-y-3">
          <Skeleton className="w-24 h-24 rounded-full -mt-12" />
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    );
  }
  if (!provider) return <NotFoundView context="person" />;

  const name = (ar ? provider.name_ar || provider.name_en : provider.name_en) || "";
  const bio = ar ? provider.bio_ar || provider.bio_en : provider.bio_en || provider.bio_ar;
  const city = ar ? provider.city_ar || provider.city_en : provider.city_en;
  const tagline = ar ? provider.tagline_ar || provider.tagline_en : provider.tagline_en;
  const role = roleLabels[provider.role]?.[ar ? "ar" : "en"] || (ar ? "مقدم خدمة" : "Provider");
  const specialties: any[] = Array.isArray(provider.specialties) ? provider.specialties : [];
  const isSelf = !!authUser && provider.user_id === authUser.id;

  const facts: KeyFact[] = [];
  if (city) facts.push({ icon: MapPin, label: city });
  if (provider.years_active > 0) facts.push({ icon: Clock, label: ar ? `${fmtNumber(provider.years_active, ar)} سنوات نشاط` : `${provider.years_active} years active` });
  if (provider.languages) facts.push({ icon: Languages, label: String(provider.languages) });
  if (offers.length) facts.push({ icon: LayoutGrid, label: ar ? `${fmtNumber(offers.length, ar)} عروض منشورة` : `${offers.length} published ${offers.length === 1 ? "offer" : "offers"}` });

  const types = Array.from(new Set(offers.map((o) => o.type)));
  const activeTab = tab && types.includes(tab) ? tab : types[0];
  const shown = types.length > 1 ? offers.filter((o) => o.type === activeTab) : offers;

  const actionBtn = "h-11 px-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Cover */}
      <div className="relative h-44 lg:h-64 overflow-hidden bg-gradient-to-br from-primary/50 via-primary/20 to-accent/40">
        {provider.cover_image && <img src={provider.cover_image} alt="" className="w-full h-full object-cover" />}
        <div className="absolute top-3 inset-x-3 flex justify-between pt-[env(safe-area-inset-top,0px)]">
          <button type="button" onClick={() => navigate(-1)} aria-label={ar ? "رجوع" : "Back"} className="tap-target rounded-full bg-background/80 backdrop-blur-sm text-foreground">
            <ArrowLeft className={`w-5 h-5 ${ar ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4">
        {/* Identity */}
        <div className="-mt-12 relative z-10">
          <Avatar src={provider.avatar} name={name} className="w-24 h-24 rounded-full border-4 border-background shadow-card" />
        </div>
        <h1 className={`listing-title ${ar ? "lang-ar" : "lang-en"} text-foreground text-3xl mt-3 flex items-center gap-2`}>
          {name}
          {provider.verified && <CheckCircle className="w-5 h-5 text-primary-dark" aria-label={ar ? "موثّق" : "Verified"} />}
        </h1>
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary-dark mt-1">{[role, city].filter(Boolean).join(" · ")}</p>
        {tagline && <p className={`article-standfirst ${ar ? "lang-ar" : "lang-en"} text-foreground mt-3`}>{tagline}</p>}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          {!isSelf && (
            <button type="button" onClick={() => navigate(`/inbox?personId=${provider.id}&kind=provider`)} className={`${actionBtn} bg-primary text-primary-foreground`}>
              <MessageCircle className="w-4 h-4" /> {ar ? "راسل" : "Message"}
            </button>
          )}
          <FollowButton targetType="provider" targetId={provider.id} variant="outline" />
          <ShareButton title={name} showLabel className={`${actionBtn} border border-border text-foreground`} iconClassName="w-4 h-4" />
        </div>
      </div>

      <div className="mt-5"><KeyFacts facts={facts} /></div>

      <div className="max-w-[680px] mx-auto px-4">
        {provider.user_id && <div className="pt-4"><ProviderStatusView userId={provider.user_id} accentText="text-primary-dark" /></div>}

        {bio && (
          <Section title={ar ? "نبذة" : "About"} ar={ar}>
            <p className={`whitespace-pre-line ${bioOpen ? "" : "line-clamp-6"}`}>{bio}</p>
            {bio.length > 320 && (
              <button type="button" onClick={() => setBioOpen(!bioOpen)} className="mt-1 text-sm font-semibold text-primary-dark underline min-h-[44px]">
                {bioOpen ? (ar ? "أقل" : "Less") : (ar ? "المزيد" : "More")}
              </button>
            )}
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {specialties.map((s, i) => {
                  const label = typeof s === "string" ? s : ar ? s.ar || s.en : s.en || s.ar;
                  return label ? <span key={i} className="px-2.5 py-1 rounded-full bg-muted text-[13px] text-foreground">{label}</span> : null;
                })}
              </div>
            )}
          </Section>
        )}

        {offers.length > 0 && (
          <Section title={ar ? "العروض" : "Offers"} ar={ar}>
            {types.length > 1 && (
              <div role="tablist" className="flex gap-2 overflow-x-auto hide-scrollbar mb-4">
                {types.map((ty) => (
                  <button key={ty} role="tab" aria-selected={ty === activeTab} type="button" onClick={() => setTab(ty)}
                    className={`min-h-[40px] px-4 rounded-full text-sm font-semibold border flex-shrink-0 ${ty === activeTab ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-border"}`}>
                    {TYPE_LABEL[ty][ar ? "ar" : "en"]} · {fmtNumber(offers.filter((o) => o.type === ty).length, ar)}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 snap-x">
              {shown.map((o) => (
                <button key={`${o.type}-${o.id}`} type="button" onClick={() => navigate(o.path)} className="flex-shrink-0 w-[220px] snap-start text-start">
                  <div className="aspect-[3/2] rounded-xl overflow-hidden bg-muted">{o.image && <img src={o.image} alt="" loading="lazy" className="w-full h-full object-cover" />}</div>
                  <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-base mt-2 line-clamp-2 text-foreground`}>{o.title}</p>
                  {o.meta && <p className="text-[13px] text-muted-foreground">{o.meta}</p>}
                </button>
              ))}
            </div>
          </Section>
        )}

        <ExpertCollections userId={provider.user_id} />

        {reviews.length > 0 && (
          <Section title={ar ? "التقييمات" : "Reviews"} ar={ar}>
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id}>
                  <p className="text-sm font-semibold text-foreground">{r.reviewer_name}</p>
                  <p className="text-[13px] text-muted-foreground">{"★".repeat(Math.round(r.rating || 0))}{r.reviewer_city ? ` · ${r.reviewer_city}` : ""}</p>
                  {r.review_text && <p className="mt-1">{r.review_text}</p>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <div className="border-t border-border pt-2"><ProviderContactCard providerId={provider.id} /></div>

        <ReadBeforeYouGo cityId={cityRow?.id} regionId={cityRow?.region_id} ar={ar} />
      </div>
    </div>
  );
};

export default ProviderProfile;
