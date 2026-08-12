import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, MapPin, ChevronDown, Users, Headphones, Clock, MapPinned, Compass, BookOpen, Palette, Mountain } from "lucide-react";
import WishlistButton from "@/components/WishlistButton";
import { useI18n } from "@/lib/i18n";
import { bylineNames } from "@/lib/postByline";
// Sample experiences/posts used to be merged into the DB results here, so a region
// page mixed fabricated listings (with their own invented ratings and prices) in
// with real ones. Only real rows are rendered now.
import { useAudioTours, useExperiences, useWhosWho, usePosts, useEvents, useTrips, useProducts } from "@/hooks/useListings";
import SectionHeader from "@/components/SectionHeader";
import EventsSection from "@/components/EventsSection";
import CausesSection from "@/components/CausesSection";
import RegionMap from "@/components/RegionMap";
import BottomNav from "@/components/BottomNav";
import SmartImage from "@/components/ui/SmartImage";
import NotFoundView from "@/components/NotFound";
import DetailSkeleton from "@/components/DetailSkeleton";

type PostItem = {
  id: string;
  slug?: string;
  title: { en: string; ar: string };
  category: { en: string; ar: string };
  author: { en: string; ar: string };
  image: string;
  readTime: number;
  cityId?: string;
  regionId?: string;
};

const RegionPostsSection = ({
  posts,
  lang,
  navigate,
}: {
  posts: PostItem[];
  lang: "en" | "ar";
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    const cats = new Map<string, string>();
    posts.forEach((p) => {
      const key = p.category.en.toLowerCase();
      if (!cats.has(key)) cats.set(key, p.category[lang]);
    });
    return Array.from(cats.entries()).map(([key, label]) => ({ key, label }));
  }, [posts, lang]);

  const filtered =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.category.en.toLowerCase() === activeCategory);

  const allLabel = lang === "ar" ? "الكل" : "All";

  return (
    <div className="space-y-3">
      <div className="px-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-primary" />
        <h3 className="text-base font-bold text-foreground">
          {lang === "ar" ? "مقالات ومنشورات" : "Posts & Articles"}
        </h3>
        <button
          onClick={() => navigate("/posts")}
          className="ms-auto text-xs font-semibold text-primary hover:underline"
        >
          {lang === "ar" ? "عرض الكل ←" : "See all →"}
        </button>
      </div>

      <div className="flex gap-2 px-4 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          {allLabel}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 px-4">
        {filtered.slice(0, 3).map((post) => (
          <div
            key={post.id}
            onClick={() => navigate(`/post/${post.id}`)}
            className="rounded-xl overflow-hidden shadow-card bg-card cursor-pointer"
          >
            <div className="relative h-32">
              <img src={post.image} alt={post.title[lang]} className="w-full h-full object-cover" />
              <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                {post.category[lang]}
              </span>
            </div>
            <div className="p-3">
              <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-2">{post.title[lang]}</h4>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground truncate">{post.author[lang]}</span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                  <Clock className="w-3 h-3" />
                  {post.readTime} {lang === "ar" ? "د" : "min"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RegionDetail = () => {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [selectedCity, setSelectedCity] = useState("all");
  const [cityDropOpen, setCityDropOpen] = useState(false);

  // Region copy and its city list come from the regions/cities tables. There is
  // no sample fallback: an unknown region id must 404.
  const { data: regionRow, isLoading: lRegion } = useQuery({
    queryKey: ["region", regionId],
    enabled: !!regionId,
    queryFn: async () => {
      const { data, error } = await supabase.from("regions").select("*").eq("id", regionId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: cities = [] } = useQuery({
    queryKey: ["region-cities", regionId],
    enabled: !!regionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities").select("id, name_en, name_ar").eq("region_id", regionId!).order("name_en");
      if (error) throw error;
      return (data || []).map((c) => ({ id: c.id, name: { en: c.name_en || "", ar: c.name_ar || c.name_en || "" } }));
    },
  });

  const cityFilter = <T extends { cityId?: string }>(items: T[]) =>
    selectedCity === "all" ? items : items.filter((i) => i.cityId === selectedCity);

  const { data: dbAudioTours = [], isLoading: l1 } = useAudioTours();
  const { data: dbExperiences = [], isLoading: l2 } = useExperiences();
  const { data: dbWhosWho = [], isLoading: l3 } = useWhosWho();
  const { data: dbPosts = [], isLoading: l4 } = usePosts();
  const { data: dbEvents = [] } = useEvents();
  const { data: dbTrips = [] } = useTrips();
  const { data: dbProducts = [] } = useProducts();
  // City copy comes from the cities table, not the sample cityData map, so a
  // selected city can never show another city's overview.
  const { data: selectedCityRow } = useQuery({
    queryKey: ["region-city", selectedCity, lang],
    enabled: selectedCity !== "all",
    queryFn: async () => {
      const { data } = await supabase
        .from("cities").select("name_en, name_ar, overview_en, overview_ar")
        .eq("id", selectedCity).maybeSingle();
      if (!data) return null;
      return {
        name: lang === "ar" ? (data.name_ar || data.name_en) : data.name_en,
        overview: (lang === "ar" ? (data.overview_ar || data.overview_en) : data.overview_en) || "",
      };
    },
  });
  const isLoading = l1 || l2 || l3 || l4 || lRegion;

  if (isLoading) return <DetailSkeleton variant="region" />;
  if (!regionRow) return <NotFoundView context="region" />;

  const region = {
    emoji: regionRow.emoji || "",
    color: regionRow.color || "hsl(var(--primary))",
    name: lang === "ar" ? regionRow.name_ar || regionRow.name_en || "" : regionRow.name_en || "",
    about: lang === "ar" ? regionRow.about_ar || "" : regionRow.about_en || "",
  };

  const dedupe = <T extends { id: string }>(arr: T[]) => {
    const seen = new Set<string>();
    return arr.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
  };

  const regionExperiences = cityFilter(
    dedupe([
      ...(dbExperiences as any[]).filter((e) => e.region_id === regionId).map((e) => ({
        id: e.slug || e.id, slug: e.slug,
        title: { en: e.title_en, ar: e.title_ar || e.title_en },
        image: e.image, price: e.price ?? 0, rating: e.rating ?? 0,
        cityId: e.city_id, regionId: e.region_id,
      })),
    ])
  );
  // Trips now carry a real city_id/region_id, so they belong on this page too.
  const regionTrips = cityFilter(
    dedupe([
      ...(dbTrips as any[]).filter((tr) => tr.region_id === regionId).map((tr) => ({
        id: tr.slug || tr.id, slug: tr.slug,
        title: { en: tr.title_en, ar: tr.title_ar || tr.title_en },
        route: { en: tr.route_en || "", ar: tr.route_ar || "" },
        image: tr.image, price: tr.price ?? 0,
        cityId: tr.city_id, regionId: tr.region_id,
      })),
    ])
  );
  // Products carry city_id/region_id from the seller's city picker.
  const regionProducts = cityFilter(
    dedupe([
      ...(dbProducts as any[]).filter((p) => p.region_id === regionId).map((p) => ({
        id: p.slug || p.id, slug: p.slug,
        title: { en: p.name_en, ar: p.name_ar || p.name_en },
        image: p.image, price: p.price ?? 0,
        cityId: p.city_id, regionId: p.region_id,
      })),
    ])
  );
  const regionEvents = (dbEvents as any[])
    .filter((e) => e.region_id === regionId)
    .filter((e) => selectedCity === "all" || e.city_id === selectedCity);
  const regionPosts = dedupe([
    ...(dbPosts as any[]).filter((p) => p.region_id === regionId).map((p) => ({
      id: p.slug || p.id, slug: p.slug,
      title: { en: p.title_en, ar: p.title_ar || p.title_en },
      category: { en: p.category || "Article", ar: p.category || "مقال" },
      author: bylineNames(p),
      image: p.image, readTime: p.read_time_minutes ?? 5,
      cityId: p.city_id, regionId: p.region_id,
    })) as any[],
  ]);
  const regionPeople = cityFilter(
    dedupe([
      ...(dbWhosWho as any[])
        .filter((w) => w.region_id === regionId && (w.status ?? "published") === "published")
        .map((w) => ({
          id: w.slug || w.id, slug: w.slug,
          name: { en: w.name_en, ar: w.name_ar || w.name_en },
          role: { en: w.role_en || "", ar: w.role_ar || "" },
          bio: { en: w.bio_en || "", ar: w.bio_ar || "" },
          image: w.image, cityId: w.city_id, regionId: w.region_id,
        })),
    ])
  );

  const regionAudioTours = cityFilter(
    (dbAudioTours as any[])
      .filter((a) => a.region_id === regionId)
      .map((a) => ({
        id: a.slug || a.id,
        title: { en: a.title_en, ar: a.title_ar || a.title_en },
        image: a.image,
        regionId: a.region_id,
        cityId: a.city_id,
        duration: a.duration_minutes,
        stops: a.stops_count,
        price: a.price ?? 0,
      }))
  );

  const selectedCityLabel = selectedCity === "all"
    ? t("filter.allCities")
    : cities.find((c) => c.id === selectedCity)?.name[lang] || selectedCity;

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl">{region.emoji}</span>
          <h1 className="text-lg font-bold text-foreground">{region.name}</h1>
        </div>
      </header>

      {/* Hero banner */}
      <div
        className="mx-4 mt-2 mb-3 h-36 rounded-xl flex items-end p-4"
        style={{ background: `linear-gradient(135deg, ${region.color}40, ${region.color}15)` }}
      >
        <span className="text-5xl">{region.emoji}</span>
      </div>

      {/* City filter dropdown */}
      {cities.length > 0 && (
        <div className="px-4 mb-4 relative">
          <button
            onClick={() => setCityDropOpen(!cityDropOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card shadow-card border border-border w-full"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground flex-1 text-start">{selectedCityLabel}</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${cityDropOpen ? "rotate-180" : ""}`} />
          </button>
          {cityDropOpen && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-card rounded-lg shadow-elevated border border-border z-30 overflow-hidden">
              <button
                onClick={() => { setSelectedCity("all"); setCityDropOpen(false); }}
                className={`w-full px-3 py-2.5 text-start text-sm ${selectedCity === "all" ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-secondary"}`}
              >
                {t("filter.allCities")}
              </button>
              {cities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCityDropOpen(false); navigate(`/city/${c.id}`); }}
                  className="w-full px-3 py-2.5 text-start text-sm text-foreground hover:bg-secondary border-t border-border"
                >
                  {c.name[lang]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* About — show city-specific overview when a city is selected, otherwise region description */}
      {selectedCity !== "all" && selectedCityRow?.overview ? (
        <div className="px-4 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">
              {lang === "ar" ? "عن" : "About"} {selectedCityRow.name}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {selectedCityRow.overview}
          </p>
        </div>
      ) : region.about ? (
        <div className="px-4 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">
              {lang === "ar" ? "عن المنطقة" : "About"}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{region.about}</p>
        </div>
      ) : null}

      {/* Interactive Map */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">
            {lang === "ar" ? "خريطة المنطقة" : "Region Map"}
          </h3>
        </div>
        <RegionMap regionId={regionId || ""} color={region.color} />
      </div>

      <div className="space-y-6 pt-1">
        {/* Categorized Posts/Articles */}
        {regionPosts.length > 0 && <RegionPostsSection posts={regionPosts} lang={lang} navigate={navigate} />}

        {/* Who's Who */}
        {regionPeople.length > 0 && (
          <SectionHeader titleKey="section.whosWho" onSeeAll={() => navigate("/people")}>
            <div className="grid grid-cols-3 gap-3 px-4">
              {regionPeople.slice(0, 3).map((p) => (
                <div key={p.id} onClick={() => navigate(`/person/${p.id}`)} className="rounded-lg shadow-card bg-card overflow-hidden cursor-pointer">
                  <div className="relative h-28">
                    <img src={p.image || "/placeholder.svg"} alt={p.name[lang]} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-xs font-bold text-white line-clamp-1">{p.name[lang]}</h3>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-1.5">
                      <Users className="w-2.5 h-2.5" /> {p.role[lang]}
                    </span>
                    <p className="text-[10px] text-muted-foreground line-clamp-3 leading-relaxed">{p.bio[lang]}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}

        {/* Events */}
        <EventsSection events={regionEvents} />

        {/* Experiences */}
        {regionExperiences.length > 0 && (
          <SectionHeader titleKey="section.experiences" onSeeAll={() => navigate("/?tab=experiences")}>
            <div className="grid grid-cols-3 gap-3 px-4">
              {regionExperiences.slice(0, 3).map((e) => (
                <div key={e.id} className="rounded-lg overflow-hidden shadow-card bg-card cursor-pointer" onClick={() => navigate(`/experience/${e.id}`)}>
                  <div className="relative h-32">
                    <img src={e.image} alt={e.title[lang]} className="w-full h-full object-cover" />
                    <WishlistButton itemType="experience" itemId={e.id} className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{e.title[lang]}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary-dark">
                        {e.price === 0 ? t("common.free") : `${e.price} ${t("common.egp")}`}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {e.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}

        {/* Trips */}
        {regionTrips.length > 0 && (
          <SectionHeader titleKey="section.trips" onSeeAll={() => navigate("/trips")}>
            <div className="grid grid-cols-3 gap-3 px-4">
              {regionTrips.slice(0, 3).map((tr) => (
                <div key={tr.id} className="rounded-lg overflow-hidden shadow-card bg-card cursor-pointer" onClick={() => navigate(`/trip/${tr.id}`)}>
                  <div className="relative h-32">
                    {tr.image ? (
                      <img src={tr.image} alt={tr.title[lang]} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-secondary" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">{tr.title[lang]}</h3>
                    {tr.route[lang] && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mb-1">{tr.route[lang]}</p>
                    )}
                    <span className="text-sm font-bold text-primary-dark">
                      {tr.price === 0 ? t("common.free") : `${tr.price} ${t("common.egp")}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}

        {/* Audio Tours */}
        {regionAudioTours.length > 0 && (
          <SectionHeader titleKey="section.audioTours" onSeeAll={() => navigate("/audio-tours")}>
            <div className="grid grid-cols-3 gap-3 px-4">
              {regionAudioTours.slice(0, 3).map((tour) => (
                <div key={tour.id} onClick={() => navigate(`/audio-tour/${tour.id}`)} className="rounded-lg overflow-hidden shadow-card bg-card cursor-pointer">
                  <div className="relative h-32">
                    <img src={tour.image} alt={tour.title[lang]} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Headphones className="w-3 h-3" /> {t("common.audioTour")}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1.5">{tour.title[lang]}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1.5">
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {tour.duration} {t("common.min")}</span>
                      <span className="flex items-center gap-0.5"><MapPinned className="w-3 h-3" /> {tour.stops} {t("common.stops")}</span>
                    </div>
                    <span className="text-sm font-bold text-primary-dark">
                      {tour.price === 0 ? t("common.free") : `${tour.price} ${t("common.egp")}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}


        {/* Causes */}
        <CausesSection regionId={regionId || ""} cityFilter={selectedCity} />
      </div>

      <BottomNav />
    </div>
  );
};

export default RegionDetail;
