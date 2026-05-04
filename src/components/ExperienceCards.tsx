import { useState } from "react";
import { Heart } from "lucide-react";
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

      {/* Region dropdown (compact teal) */}
      <div className="px-4 mb-3">
        <select
          value={activeRegion}
          onChange={(e) => setActiveRegion(e.target.value)}
          className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold border-0 outline-none cursor-pointer"
        >
          <option value="all">{lang === "ar" ? "كل المناطق" : "All Regions"}</option>
          {regionsList.map((r) => (
            <option key={r.id} value={r.id}>
              {lang === "ar" ? r.name_ar : r.name_en}
            </option>
          ))}
        </select>
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
