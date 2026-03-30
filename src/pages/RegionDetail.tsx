import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star, MapPin, ChevronDown, Users, Headphones, Clock, MapPinned, Compass } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { regions, regionCities, experiences, latestPosts, whosWho, audioTours, causes } from "@/lib/sampleData";
import SectionHeader from "@/components/SectionHeader";
import CausesSection from "@/components/CausesSection";
import BottomNav from "@/components/BottomNav";

const RegionDetail = () => {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [selectedCity, setSelectedCity] = useState("all");
  const [cityDropOpen, setCityDropOpen] = useState(false);

  const region = regions.find((r) => r.id === regionId);
  if (!region) return <div className="p-8 text-center text-muted-foreground">Region not found</div>;

  const cities = regionCities[regionId || ""] || [];

  const cityFilter = <T extends { cityId?: string }>(items: T[]) =>
    selectedCity === "all" ? items : items.filter((i) => i.cityId === selectedCity);

  const regionExperiences = cityFilter(experiences.filter((e) => e.regionId === regionId));
  const regionPosts = latestPosts.filter((p) => p.regionId === regionId);
  const regionPeople = cityFilter(whosWho.filter((w) => w.regionId === regionId));
  const regionAudioTours = cityFilter(audioTours.filter((a) => a.regionId === regionId));

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
          <h1 className="text-lg font-bold text-foreground">{t(region.nameKey)}</h1>
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
                <div key={c.id} className="flex items-center border-t border-border">
                  <button
                    onClick={() => { setSelectedCity(c.id); setCityDropOpen(false); }}
                    className={`flex-1 px-3 py-2.5 text-start text-sm ${selectedCity === c.id ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-secondary"}`}
                  >
                    {c.name[lang]}
                  </button>
                  <button
                    onClick={() => { setCityDropOpen(false); navigate(`/city/${c.id}`); }}
                    className="px-3 py-2.5 text-xs text-primary hover:bg-primary/10 font-medium"
                  >
                    →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* About */}
      {region.about && (
        <div className="px-4 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">
              {lang === "ar" ? "عن المنطقة" : "About"}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{region.about[lang]}</p>
        </div>
      )}

      <div className="space-y-6 pt-1">
        {/* Latest Posts */}
        {regionPosts.length > 0 && (
          <SectionHeader titleKey="section.latestPosts" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {regionPosts.map((post) => (
                <div key={post.id} className="min-w-[200px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
                  <div className="relative h-28">
                    <img src={post.image} alt={post.title[lang]} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {post.category[lang]}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">{post.title[lang]}</h3>
                  </div>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}
        {/* Who's Who */}
        {regionPeople.length > 0 && (
          <SectionHeader titleKey="section.whosWho" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {regionPeople.map((p) => (
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
        {regionExperiences.length > 0 && (
          <SectionHeader titleKey="section.experiences" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {regionExperiences.map((e) => (
                <div key={e.id} className="min-w-[220px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer" onClick={() => navigate(`/experience/${e.id}`)}>
                  <div className="relative h-32">
                    <img src={e.image} alt={e.title[lang]} className="w-full h-full object-cover" />
                    <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                      <Heart className="w-4 h-4 text-foreground" />
                    </button>
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

        {/* Audio Tours */}
        {regionAudioTours.length > 0 && (
          <SectionHeader titleKey="section.audioTours" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {regionAudioTours.map((tour) => (
                <div key={tour.id} className="min-w-[220px] rounded-lg overflow-hidden shadow-card bg-card">
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

        {/* Latest Posts */}
        {regionPosts.length > 0 && (
          <SectionHeader titleKey="section.latestPosts" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {regionPosts.map((post) => (
                <div key={post.id} className="min-w-[200px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
                  <div className="relative h-28">
                    <img src={post.image} alt={post.title[lang]} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {post.category[lang]}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">{post.title[lang]}</h3>
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
