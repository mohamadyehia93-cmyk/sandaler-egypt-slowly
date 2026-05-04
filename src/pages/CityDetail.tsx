import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Users, Calendar, Sparkles, Compass, Heart, Star, BookOpen, Palette, Mountain, Route, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cityData, experiences, audioTours, accommodation, products, whosWho, causes, latestPosts, trips } from "@/lib/sampleData";
import { useTransport } from "@/hooks/useListings";
import SectionHeader from "@/components/SectionHeader";
import CausesSection from "@/components/CausesSection";
import CityOfferingsMap, { OfferingPin } from "@/components/CityOfferingsMap";
import BottomNav from "@/components/BottomNav";

type PostItem = (typeof latestPosts)[number];

const CityPostsSection = ({
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
        <span className="text-xs text-muted-foreground">({posts.length})</span>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {allLabel}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Horizontal Post Cards */}
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {filtered.map((post) => (
          <div
            key={post.id}
            onClick={() => navigate(`/post/${post.id}`)}
            className="min-w-[220px] shrink-0 rounded-xl overflow-hidden shadow-card bg-card cursor-pointer"
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

const CityDetail = () => {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const { data: dbTransport = [] } = useTransport();

  const city = cityData[cityId || ""];
  if (!city) return <div className="p-8 text-center text-muted-foreground">City not found</div>;

  const cityExperiences = experiences.filter((e) => e.cityId === cityId);
  const cityAudioTours = audioTours.filter((a) => a.cityId === cityId);
  const cityAccommodation = accommodation.filter((a) => a.cityId === cityId);
  const cityProducts = products.filter((p) => p.cityId === cityId);
  const cityPeople = whosWho.filter((w) => w.cityId === cityId);
  const cityCauses = causes.filter((c) => c.cityId === cityId);
  const cityPosts = latestPosts.filter((p) => (p as any).cityId === cityId);
  const cityTransport = dbTransport.filter((tr) => tr.city_id === cityId);
  const cityTrips = trips.filter((tr) => tr.cityId === cityId);

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{city.name[lang]}</h1>
      </header>

      {/* Hero Image */}
      <div className="relative h-48 mx-4 mt-2 rounded-xl overflow-hidden">
        <img src={city.image} alt={city.name[lang]} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="text-xl font-bold text-white mb-1">{city.name[lang]}</h2>
          <div className="flex items-center gap-2 text-white/80 text-xs">
            <MapPin className="w-3 h-3" />
            <span>{city.governorate[lang]}</span>
            <span>•</span>
            <Users className="w-3 h-3" />
            <span>{city.population}</span>
          </div>
        </div>
      </div>

      <div className="space-y-5 pt-4">
        {/* About Section */}
        <div className="px-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">{lang === "ar" ? "نظرة عامة" : "Overview"}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{city.about.overview[lang]}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">{lang === "ar" ? "التاريخ" : "History"}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{city.about.history[lang]}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">{lang === "ar" ? "الثقافة" : "Culture"}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{city.about.culture[lang]}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mountain className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">{lang === "ar" ? "الجغرافيا" : "Geography"}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{city.about.geography[lang]}</p>
          </div>
        </div>

        {/* Highlights */}
        <div className="px-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">{lang === "ar" ? "أبرز المعالم" : "Highlights"}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {city.highlights.en.map((hEn, i) => {
              const slug = hEn.toLowerCase().replace(/[''`]/g, "").replace(/[^a-z0-9\u0600-\u06FF]+/g, "-").replace(/^-+|-+$/g, "");
              const label = city.highlights[lang][i] || hEn;
              return (
                <button
                  key={i}
                  onClick={() => navigate(`/city/${cityId}/highlight/${slug}`)}
                  className="bg-card rounded-lg p-3 shadow-card border border-border text-left hover:border-primary hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <span className="text-xs font-medium text-foreground">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Known For */}
        <div className="px-4">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">{lang === "ar" ? "تشتهر بـ" : "Known For"}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {city.knownFor[lang].map((k, i) => (
              <span key={i} className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">{k}</span>
            ))}
          </div>
        </div>

        {/* Best Time to Visit */}
        <div className="px-4">
          <div className="flex items-center gap-2 bg-card rounded-lg p-3 shadow-card border border-border">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <span className="text-xs text-muted-foreground">{lang === "ar" ? "أفضل وقت للزيارة" : "Best Time to Visit"}</span>
              <p className="text-sm font-medium text-foreground">{city.bestTime[lang]}</p>
            </div>
          </div>
        </div>

        {/* Categorized Posts/Articles */}
        {cityPosts.length > 0 && <CityPostsSection posts={cityPosts} lang={lang} navigate={navigate} />}

        {/* Who's Who */}
        {cityPeople.length > 0 && (
          <SectionHeader titleKey="section.whosWho" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {cityPeople.map((p) => (
                <div key={p.id} onClick={() => navigate(`/person/${p.id}`)} className="min-w-[160px] max-w-[160px] rounded-lg shadow-card bg-card overflow-hidden cursor-pointer">
                  <div className="relative h-28">
                    <img src={p.image} alt={p.name[lang]} className="w-full h-full object-cover" />
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

        {/* Experiences */}
        {cityExperiences.length > 0 && (
          <SectionHeader titleKey="section.experiences" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {cityExperiences.map((e) => (
                <div key={e.id} className="min-w-[220px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer" onClick={() => navigate(`/experience/${(e as any).slug || e.id}`)}>
                  <div className="relative h-32">
                    <img src={e.image} alt={e.title[lang]} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{e.title[lang]}</h3>
                    <span className="text-sm font-bold text-primary-dark">
                      {e.price === 0 ? t("common.free") : `${e.price} ${t("common.egp")}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}

        {/* Trips */}
        {cityTrips.length > 0 && (
          <SectionHeader titleKey="section.trips" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {cityTrips.map((trip) => (
                <div key={trip.id} className="min-w-[220px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer" onClick={() => navigate(`/trip/${(trip as any).slug || trip.id}`)}>
                  <div className="relative h-32">
                    <img src={trip.image} alt={trip.title[lang]} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Route className="w-3 h-3" /> {trip.route[lang]}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{trip.title[lang]}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">{trip.price} {t("common.egp")}</span>
                      <span className="text-[10px] text-muted-foreground">{trip.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}

        {cityAudioTours.length > 0 && (
          <SectionHeader titleKey="section.audioTours" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {cityAudioTours.map((tour) => (
                <div key={tour.id} className="min-w-[220px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer" onClick={() => navigate(`/audio-tour/${(tour as any).slug || tour.id}`)}>
                  <div className="relative h-32">
                    <img src={tour.image} alt={tour.title[lang]} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">{tour.title[lang]}</h3>
                    <span className="text-sm font-bold text-primary-dark">
                      {tour.price === 0 ? t("common.free") : `${tour.price} ${t("common.egp")}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}

        {/* Places to Stay */}
        {cityAccommodation.length > 0 && (
          <SectionHeader titleKey="section.placesToStay" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {cityAccommodation.map((a) => (
                <div key={a.id} className="min-w-[200px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer" onClick={() => navigate(`/stay/${(a as any).slug || a.id}`)}>
                  <div className="relative h-32">
                    <img src={a.image} alt={a.title[lang]} className="w-full h-full object-cover" />
                    <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                      <Heart className="w-4 h-4 text-foreground" />
                    </button>
                    <span className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {a.type[lang]}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-0.5">{a.title[lang]}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{a.location[lang]}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary-dark">
                        {a.price} {t("common.egp")}<span className="text-xs font-normal text-muted-foreground">{t("common.perNight")}</span>
                      </span>
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {a.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}

        {/* Getting Around */}
        {cityTransport.length > 0 && (
          <SectionHeader titleKey="section.gettingAround" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {cityTransport.map((tr) => (
                <div key={tr.id} className="min-w-[140px] rounded-lg shadow-card bg-card p-4 flex flex-col items-center gap-2 cursor-pointer" onClick={() => navigate(`/transport/${tr.slug || tr.id}`)}>
                  {tr.image ? <img src={tr.image} alt="" className="w-10 h-10 rounded-full object-cover" /> : <span className="text-3xl">🚐</span>}
                  <h3 className="text-xs font-semibold text-foreground text-center line-clamp-2">{lang === "ar" ? tr.name_ar : tr.name_en}</h3>
                  <span className="text-sm font-bold text-primary-dark">{tr.price} {t("common.egp")}</span>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}

        {/* Local Products */}
        {cityProducts.length > 0 && (
          <SectionHeader titleKey="section.products" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
              {cityProducts.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-40 snap-start rounded-lg overflow-hidden shadow-card bg-card cursor-pointer" onClick={() => navigate(`/product/${(p as any).slug || p.id}`)}>
                  <div className="relative h-32">
                    <img src={p.image} alt={p.title[lang]} className="w-full h-full object-cover" />
                    <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                      <Heart className="w-3.5 h-3.5 text-foreground" />
                    </button>
                    <span className="absolute bottom-2 left-2 bg-accent text-accent-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {p.badge[lang]}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-xs font-semibold text-foreground line-clamp-2 mb-1">{p.title[lang]}</h3>
                    <p className="text-[10px] text-muted-foreground mb-1">{p.village[lang]}</p>
                    <span className="text-sm font-bold text-primary-dark">{p.price} {t("common.egp")}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}

        {/* Causes */}
        {cityCauses.length > 0 && (
          <CausesSection regionId={city.regionId} cityFilter={cityId || ""} />
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default CityDetail;
