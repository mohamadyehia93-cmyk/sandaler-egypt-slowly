import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import { useRegions, useCities, useExperiences, useTrips, useAudioTours, useAccommodations, useProducts, useEvents, usePosts } from "@/hooks/useListings";
import { getRegionImage } from "@/lib/regionImageMap";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtNumber } from "@/components/listing/format";

type Named = { id: string; name_en: string | null; name_ar: string | null; image?: string | null; region_id?: string | null };

/** Places index: every region, with its cities as large image tiles and real counts. */
const Places = () => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const { data: regions, isLoading } = useRegions();
  const { data: cities } = useCities();
  const sources = [useExperiences().data, useTrips().data, useAudioTours().data, useAccommodations().data, useProducts().data, useEvents().data];
  const { data: posts } = usePosts();

  // Published rows only (the hooks already filter status = published).
  const counts = useMemo(() => {
    const offers = new Map<string, number>();
    const articles = new Map<string, number>();
    const today = new Date().toISOString().slice(0, 10);
    sources.forEach((rows) => (rows as any[] | undefined)?.forEach((r) => r.city_id && !(r.start_date && String(r.end_date || r.start_date).slice(0, 10) < today) && offers.set(r.city_id, (offers.get(r.city_id) ?? 0) + 1)));
    (posts as any[] | undefined)?.forEach((r) => r.city_id && articles.set(r.city_id, (articles.get(r.city_id) ?? 0) + 1));
    return { offers, articles };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...sources, posts]);

  const name = (r: Named) => (ar ? r.name_ar || r.name_en : r.name_en) || "";
  const countLine = (id: string) => {
    const o = counts.offers.get(id) ?? 0, a = counts.articles.get(id) ?? 0;
    const parts = [
      o ? (ar ? `${fmtNumber(o, ar)} عروض` : `${o} ${o === 1 ? "offer" : "offers"}`) : null,
      a ? (ar ? `${fmtNumber(a, ar)} مقالات` : `${a} ${a === 1 ? "article" : "articles"}`) : null,
    ].filter(Boolean);
    return parts.join(" · ");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title={ar ? "الأماكن" : "Places"} />
      <div className="mx-auto max-w-5xl px-4 py-4">
        <p className="mb-2 text-[15px] leading-relaxed text-muted-foreground">
          {ar ? "ابدأ من منطقة، ثم اختر مدينة لتكتشف ما فيها." : "Start with a region, then pick a city to see what's there."}
        </p>

        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="my-6 aspect-[3/2] w-full rounded-xl" />)}

        {((regions ?? []) as Named[]).map((r) => {
          const photo = getRegionImage(r.id) ?? r.image ?? null;
          const regionCities = ((cities ?? []) as Named[]).filter((c) => c.region_id === r.id);
          return (
            <section key={r.id} className="py-6 border-t border-border first-of-type:border-t-0">
              <button type="button" onClick={() => navigate(`/region/${r.id}`)} className="focus-ring relative block w-full aspect-[16/9] lg:aspect-[3/1] overflow-hidden rounded-xl text-start">
                {photo ? <img src={photo} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-primary/40 to-accent/40" />}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-4 start-4 end-4 flex items-end justify-between gap-3">
                  <span className={`listing-title ${ar ? "lang-ar" : "lang-en"} text-primary-foreground text-3xl`}>{name(r)}</span>
                  <ChevronRight className="h-6 w-6 text-primary-foreground rtl:rotate-180 flex-shrink-0" />
                </div>
              </button>
              {regionCities.length > 0 && (
                <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {regionCities.map((c) => {
                    const line = countLine(c.id);
                    return (
                      <button key={c.id} type="button" onClick={() => navigate(`/city/${c.id}`)} className="focus-ring text-start">
                        <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-muted">
                          {c.image ? <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-primary/30 to-accent/30" />}
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                          <span className={`absolute bottom-2 start-3 end-3 listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-lg text-primary-foreground leading-tight`}>{name(c)}</span>
                        </div>
                        {line && <p className="mt-1.5 text-[13px] text-muted-foreground">{line}</p>}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Places;
