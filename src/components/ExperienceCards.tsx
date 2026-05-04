import { useState, useMemo } from "react";
import { Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { experienceThemes, regions } from "@/lib/sampleData";
import { useExperiences, useRegions } from "@/hooks/useListings";
import CityBadge from "./CityBadge";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

const ExperienceCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { data: experiences, isLoading } = useExperiences();
  const { data: dbRegions } = useRegions();
  const [activeRegion, setActiveRegion] = useState("all");

  const regionsList =
    dbRegions ??
    regions.map((r) => ({ id: r.id, name_en: r.nameKey, name_ar: r.nameKey, emoji: r.emoji }));

  const filtered = (experiences ?? []).filter(
    (e) => activeRegion === "all" || e.region_id === activeRegion
  );

  // Group by theme, preserving the experienceThemes order
  const grouped = useMemo(() => {
    return experienceThemes
      .map((th) => ({
        theme: th,
        items: filtered.filter((e) => e.theme === th.key),
      }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <section className="pb-6">
      {/* Header */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t("section.experiences")}
        </h2>
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

      {/* Grouped vertical feed */}
      {isLoading ? (
        <div className="px-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <p className="px-4 text-sm text-muted-foreground text-center py-8">
          {lang === "ar" ? "لا توجد تجارب" : "No experiences found"}
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ theme, items }) => (
            <div key={theme.key}>
              <div className="px-4 mb-2 flex items-center gap-2">
                <span className="text-lg">{theme.emoji}</span>
                <h3 className="text-base font-bold text-foreground">{theme.label[lang]}</h3>
                <span className="text-xs text-muted-foreground">({items.length})</span>
              </div>

              <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory">
                {items.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => navigate(`/experience/${e.slug || e.id}`)}
                    className="min-w-[200px] max-w-[200px] snap-start rounded-lg overflow-hidden shadow-card bg-card text-start"
                  >
                    <div className="relative h-32">
                      <img
                        src={e.image || "/placeholder.svg"}
                        alt={lang === "ar" ? e.title_ar : e.title_en}
                        className="w-full h-full object-cover"
                      />
                      <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                        <Heart className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">
                        {lang === "ar" ? e.title_ar : e.title_en}
                      </h4>
                      {e.host_name_en && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {e.host_image && (
                            <img src={e.host_image} alt="" className="w-4 h-4 rounded-full object-cover" />
                          )}
                          <span className="text-[10px] text-primary font-medium truncate">
                            {lang === "ar" ? e.host_name_ar : e.host_name_en}
                          </span>
                        </div>
                      )}
                      {e.city_id && <div className="mb-2"><CityBadge cityId={e.city_id} /></div>}
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
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ExperienceCards;
