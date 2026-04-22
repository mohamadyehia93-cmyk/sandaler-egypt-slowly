import { useState } from "react";
import { Heart, MapPin, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { experienceThemes, ExperienceTheme, regions } from "@/lib/sampleData";
import { useExperiences, useRegions } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

const ExperienceCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { data: experiences, isLoading } = useExperiences();
  const { data: dbRegions } = useRegions();
  const [activeTheme, setActiveTheme] = useState<ExperienceTheme | "all">("all");
  const [activeRegion, setActiveRegion] = useState("all");
  const [regionOpen, setRegionOpen] = useState(false);

  const filtered = (experiences ?? []).filter((e) => {
    const themeMatch = activeTheme === "all" || e.theme === activeTheme;
    const regionMatch = activeRegion === "all" || e.region_id === activeRegion;
    return themeMatch && regionMatch;
  });

  const regionsList = dbRegions ?? regions.map(r => ({ id: r.id, name_en: r.nameKey, name_ar: r.nameKey, emoji: r.emoji }));

  const activeRegionLabel = activeRegion === "all"
    ? (lang === "ar" ? "كل المناطق" : "All Regions")
    : (() => {
        const r = regionsList.find(r => r.id === activeRegion);
        return r ? (lang === "ar" ? r.name_ar : r.name_en) : "";
      })();

  return (
    <SectionHeader titleKey="section.experiences" onSeeAll={() => {}}>
      {/* Theme filter pills */}
      <div className="flex gap-2 px-4 mb-3 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTheme("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTheme === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {lang === "ar" ? "الكل" : "All"}
        </button>
        {experienceThemes.map((th) => (
          <button
            key={th.key}
            onClick={() => setActiveTheme(th.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTheme === th.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {th.emoji} {th.label[lang]}
          </button>
        ))}
      </div>

      {/* Region dropdown */}
      <div className="relative px-4 mb-3">
        <button
          onClick={() => setRegionOpen(!regionOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground shadow-card"
        >
          <MapPin className="w-3.5 h-3.5 text-primary" />
          {activeRegionLabel}
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${regionOpen ? "rotate-180" : ""}`} />
        </button>
        {regionOpen && (
          <div className="absolute top-full left-4 mt-1 z-30 bg-card rounded-lg shadow-elevated border border-border py-1 min-w-[160px]">
            <button
              onClick={() => { setActiveRegion("all"); setRegionOpen(false); }}
              className={`w-full text-start px-3 py-2 text-xs ${activeRegion === "all" ? "text-primary font-semibold bg-secondary" : "text-foreground"}`}
            >
              {lang === "ar" ? "كل المناطق" : "All Regions"}
            </button>
            {regionsList.map((r) => (
              <button
                key={r.id}
                onClick={() => { setActiveRegion(r.id); setRegionOpen(false); }}
                className={`w-full text-start px-3 py-2 text-xs ${activeRegion === r.id ? "text-primary font-semibold bg-secondary" : "text-foreground"}`}
              >
                {r.emoji} {lang === "ar" ? r.name_ar : r.name_en}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="min-w-[200px] h-[220px] rounded-lg" />
          ))
        ) : filtered.map((e) => (
          <button
            key={e.id}
            onClick={() => navigate(`/experience/${e.slug || e.id}`)}
            className="min-w-[200px] rounded-lg overflow-hidden shadow-card bg-card text-start"
          >
            <div className="relative h-32">
              <img src={e.image || "/placeholder.svg"} alt={lang === "ar" ? e.title_ar : e.title_en} className="w-full h-full object-cover" />
              <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                <Heart className="w-4 h-4 text-foreground" />
              </button>
              <span className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                {experienceThemes.find((th) => th.key === e.theme)?.label[lang]}
              </span>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">
                {lang === "ar" ? e.title_ar : e.title_en}
              </h3>
              {e.host_name_en && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  {e.host_image && <img src={e.host_image} alt="" className="w-4 h-4 rounded-full object-cover" />}
                  <span className="text-[10px] text-primary font-medium truncate">
                    {lang === "ar" ? e.host_name_ar : e.host_name_en}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                {e.city_id && <CityBadge cityId={e.city_id} />}
                {e.date && <span className="text-[10px] text-muted-foreground">{e.date}</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary-dark">
                  {e.price === 0 ? t("common.free") : `${e.price} ${t("common.egp")}`}
                </span>
                <span className="text-xs text-muted-foreground">⭐ {e.rating}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </SectionHeader>
  );
};

export default ExperienceCards;
