import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Sparkles, Clock, BookOpen, Route as RouteIcon, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import NotFoundView from "@/components/NotFound";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * HONESTY RULE for this page.
 * It used to invent a whole article per highlight: a hardcoded HIGHLIGHT_SEEDS
 * table of overviews / "what to see" / visitor tips for a handful of named places,
 * a regex "inferCategory" that labelled any other highlight, and template overview
 * and tips sentences generated from the city name. None of that was authored by
 * anyone or stored anywhere. It also listed sample experiences/trips/posts, which
 * linked to detail pages that do not exist.
 *
 * A highlight is just one string in cities.highlights_en/ar. So this page now shows
 * only: the highlight name, the city it belongs to, the city's own best-time note,
 * and REAL published listings for that city queried from the database.
 */
const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");

const HighlightDetail = () => {
  const { cityId, highlightSlug } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";

  const { data: city, isLoading } = useQuery({
    queryKey: ["city", cityId],
    enabled: !!cityId,
    queryFn: async () => {
      const { data, error } = await supabase.from("cities").select("*").eq("id", cityId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const match = useMemo(() => {
    if (!city) return null;
    const en = city.highlights_en || [];
    const arr = city.highlights_ar || [];
    const idx = en.findIndex((h: string) => slugify(h) === highlightSlug);
    if (idx === -1) return null;
    return { en: en[idx], ar: arr[idx] || en[idx] };
  }, [city, highlightSlug]);

  const { data: related } = useQuery({
    queryKey: ["highlight-related", cityId],
    enabled: !!cityId,
    queryFn: async () => {
      const [exp, trips, posts] = await Promise.all([
        supabase.from("experiences").select("id, slug, title_en, title_ar, image").eq("status", "published").eq("city_id", cityId!).limit(6),
        supabase.from("trips").select("id, slug, title_en, title_ar, image").eq("status", "published").eq("city_id", cityId!).limit(6),
        supabase.from("posts").select("id, slug, title_en, title_ar, image, read_time_minutes").eq("status", "published").eq("city_id", cityId!).limit(6),
      ]);
      return { experiences: exp.data ?? [], trips: trips.data ?? [], posts: posts.data ?? [] };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!city || !match) return <NotFoundView context="highlight" />;

  const title = ar ? match.ar : match.en;
  const cityName = ar ? city.name_ar : city.name_en;
  const governorate = ar ? city.governorate_ar : city.governorate_en;
  const bestTime = ar ? city.best_time_ar : city.best_time_en;

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground line-clamp-1">{title}</h1>
      </header>

      {/* Hero uses the CITY image — labelled as such, never presented as a photo of
          this specific highlight, because no per-highlight image is stored. */}
      {city.image && (
        <div className="relative h-52 mx-4 mt-2 rounded-xl overflow-hidden">
          <img src={city.image} alt={cityName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
            <button
              onClick={() => navigate(`/city/${city.id}`)}
              className="flex items-center gap-1.5 text-white/90 text-xs hover:text-white"
            >
              <MapPin className="w-3 h-3" />
              <span>{cityName}{governorate ? `, ${governorate}` : ""}</span>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6 pt-5">
        <p className="px-4 text-sm text-muted-foreground leading-relaxed">
          {ar
            ? `${title} من معالم ${cityName} المدرجة في دليل المدينة.`
            : `${title} is listed among ${cityName}'s highlights in the city guide.`}
        </p>

        {bestTime && (
          <section className="px-4">
            <div className="flex items-center gap-2 bg-card rounded-lg p-3 shadow-card border border-border">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground">
                  {ar ? `أفضل وقت لزيارة ${cityName}` : `Best time to visit ${cityName}`}
                </span>
                <p className="text-sm font-medium text-foreground">{bestTime}</p>
              </div>
            </div>
          </section>
        )}

        {related && related.experiences.length > 0 && (
          <section>
            <div className="px-4 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                {ar ? `تجارب في ${cityName}` : `Experiences in ${cityName}`}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3 px-4">
              {related.experiences.map((exp: any) => (
                <div key={exp.id} onClick={() => navigate(`/experience/${exp.slug || exp.id}`)}
                     className="rounded-xl overflow-hidden shadow-card bg-card cursor-pointer">
                  {exp.image && <img src={exp.image} alt={ar ? exp.title_ar : exp.title_en} className="w-full h-20 object-cover" />}
                  <div className="p-2">
                    <h4 className="text-[11px] font-semibold text-foreground line-clamp-2 leading-snug">{ar ? exp.title_ar : exp.title_en}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {related && related.trips.length > 0 && (
          <section>
            <div className="px-4 flex items-center gap-2 mb-2">
              <RouteIcon className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">{ar ? "رحلات في المدينة" : "Trips in this city"}</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 px-4">
              {related.trips.map((tr: any) => (
                <div key={tr.id} onClick={() => navigate(`/trip/${tr.slug || tr.id}`)}
                     className="rounded-xl overflow-hidden shadow-card bg-card cursor-pointer">
                  {tr.image && <img src={tr.image} alt={ar ? tr.title_ar : tr.title_en} className="w-full h-20 object-cover" />}
                  <div className="p-2">
                    <h4 className="text-[11px] font-semibold text-foreground line-clamp-2 leading-snug">{ar ? tr.title_ar : tr.title_en}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {related && related.posts.length > 0 && (
          <section>
            <div className="px-4 flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">{ar ? "مقالات ذات صلة" : "Related Posts"}</h3>
            </div>
            <div className="grid grid-cols-3 gap-3 px-4">
              {related.posts.map((post: any) => (
                <div key={post.id} onClick={() => navigate(`/post/${post.slug || post.id}`)}
                     className="rounded-xl overflow-hidden shadow-card bg-card cursor-pointer">
                  {post.image && <img src={post.image} alt={ar ? post.title_ar : post.title_en} className="w-full h-20 object-cover" />}
                  <div className="p-2">
                    <h4 className="text-[11px] font-semibold text-foreground line-clamp-2 leading-snug mb-1">{ar ? post.title_ar : post.title_en}</h4>
                    {post.read_time_minutes ? (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />{post.read_time_minutes} {ar ? "د" : "min"}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default HighlightDetail;
