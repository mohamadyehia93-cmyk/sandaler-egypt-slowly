import { useState } from "react";
import { MapPin, ChevronDown, Users, Lock, Clock, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { trips, experienceThemes, ExperienceTheme, regions, TripAccessType, TripDuration } from "@/lib/sampleData";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";

const TripCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const [activeTheme, setActiveTheme] = useState<ExperienceTheme | "all">("all");
  const [activeRegion, setActiveRegion] = useState("all");
  const [regionOpen, setRegionOpen] = useState(false);
  const [activeAccess, setActiveAccess] = useState<TripAccessType | "all">("all");
  const [activeDuration, setActiveDuration] = useState<TripDuration | "all">("all");

  const filtered = trips.filter((tr) => {
    const themeMatch = activeTheme === "all" || tr.theme === activeTheme;
    const regionMatch = activeRegion === "all" || tr.regionId === activeRegion;
    const accessMatch = activeAccess === "all" || tr.accessType === activeAccess;
    const durationMatch = activeDuration === "all" || tr.duration === activeDuration;
    return themeMatch && regionMatch && accessMatch && durationMatch;
  });

  const activeRegionLabel = activeRegion === "all"
    ? (lang === "ar" ? "كل المناطق" : "All Regions")
    : t(regions.find((r) => r.id === activeRegion)?.nameKey ?? "");

  return (
    <SectionHeader titleKey="section.trips" onSeeAll={() => {}}>
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
            {regions.map((r) => (
              <button
                key={r.id}
                onClick={() => { setActiveRegion(r.id); setRegionOpen(false); }}
                className={`w-full text-start px-3 py-2 text-xs ${activeRegion === r.id ? "text-primary font-semibold bg-secondary" : "text-foreground"}`}
              >
                {r.emoji} {t(r.nameKey)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {filtered.map((tr) => (
          <div key={tr.id} onClick={() => navigate(`/trip/${tr.id}`)} className="min-w-[220px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer">
            <div className="relative h-32">
              <img src={tr.image} alt={tr.title[lang]} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <CityBadge cityId={tr.cityId} />
                <span className="text-[10px] text-muted-foreground">{tr.route[lang]}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2">{tr.title[lang]}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary-dark">{tr.price} {t("common.egp")}</span>
                <button className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {t("common.book")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default TripCards;
