import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { trips, regions } from "@/lib/sampleData";
import SectionHeader from "./SectionHeader";

const TripCards = () => {
  const { lang, t } = useI18n();
  const [activeRegion, setActiveRegion] = useState("all");
  const [regionOpen, setRegionOpen] = useState(false);

  const filtered = trips.filter((tr) => {
    return activeRegion === "all" || tr.regionId === activeRegion;
  });

  const activeRegionLabel = activeRegion === "all"
    ? (lang === "ar" ? "كل المناطق" : "All Regions")
    : t(regions.find((r) => r.id === activeRegion)?.nameKey ?? "");

  return (
    <SectionHeader titleKey="section.trips" onSeeAll={() => {}}>
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
          <div key={tr.id} className="min-w-[220px] rounded-lg overflow-hidden shadow-card bg-card">
            <div className="relative h-32">
              <img src={tr.image} alt={tr.title[lang]} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1 text-xs text-accent mb-1">
                <MapPin className="w-3 h-3" />
                <span>{tr.route[lang]}</span>
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
