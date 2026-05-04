import { ArrowLeft, Headphones, Play, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAudioTours, useRegions } from "@/hooks/useListings";
import CityBadge from "@/components/CityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";

type ThemeKey = "history" | "nature" | "culture" | "coast";

const THEME_META: Record<ThemeKey, { en: string; ar: string; emoji: string }> = {
  history: { en: "History & Temples", ar: "التاريخ والمعابد", emoji: "🏛️" },
  culture: { en: "Culture & Heritage", ar: "الثقافة والتراث", emoji: "🎭" },
  nature: { en: "Nature & Wildlife", ar: "الطبيعة والحياة البرية", emoji: "🌿" },
  coast: { en: "Coast & Sea", ar: "الساحل والبحر", emoji: "🌊" },
};

const THEME_ORDER: ThemeKey[] = ["history", "culture", "nature", "coast"];

const classifyTour = (t: any): ThemeKey => {
  const txt = `${t.title_en ?? ""} ${t.title_ar ?? ""}`.toLowerCase();
  if (/(temple|tomb|pharaoh|oracle|akhenaten|edfu|luxor|aswan|nubian|hathor|christianity|fortress|ancient|gateway|resistance)/.test(txt)) return "history";
  if (/(birds|whales|reef|blue hole|oasis|nature|palm|wildlife|lake)/.test(txt)) return "nature";
  if (/(sea|port|beach|red sea|gulf|hurghada|matrouh|marsa|dahab|quseir|coast)/.test(txt)) return "coast";
  return "culture";
};

const AllAudioTours = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const { data: audioTours = [], isLoading } = useAudioTours();
  const { data: regions = [] } = useRegions();

  const filtered = useMemo(
    () =>
      (audioTours as any[]).filter((a) => {
        if (activeRegion && a.region_id !== activeRegion) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (a.title_en ?? "").toLowerCase().includes(q) || (a.title_ar ?? "").includes(q);
      }),
    [search, activeRegion, audioTours]
  );

  const grouped = useMemo(() => {
    const g: Record<ThemeKey, any[]> = { history: [], culture: [], nature: [], coast: [] };
    filtered.forEach((a) => g[classifyTour(a)].push(a));
    return g;
  }, [filtered]);

  const regionCounts = useMemo(() => {
    const c: Record<string, number> = {};
    (audioTours as any[]).forEach((a) => {
      if (a.region_id) c[a.region_id] = (c[a.region_id] || 0) + 1;
    });
    return c;
  }, [audioTours]);

  return (
    <div className="min-h-screen bg-surface pb-8">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {lang === "ar" ? "جميع الجولات الصوتية" : "All Audio Tours"}
          </h1>
          <span className="text-xs text-muted-foreground ms-auto">
            {filtered.length} {lang === "ar" ? "جولة" : "tours"}
          </span>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "ابحث في الجولات..." : "Search tours..."}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Region filter chips */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveRegion(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
              !activeRegion ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
            }`}
          >
            {lang === "ar" ? "كل المناطق" : "All Regions"}
          </button>
          {(regions as any[]).map((r) => {
            const count = regionCounts[r.id] || 0;
            if (count === 0) return null;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRegion(activeRegion === r.id ? null : r.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors flex items-center gap-1.5 ${
                  activeRegion === r.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                }`}
              >
                {r.emoji} {lang === "ar" ? r.name_ar : r.name_en}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="pt-4">
        {THEME_ORDER.map((themeKey) => {
          const tours = grouped[themeKey];
          if (!tours || tours.length === 0) return null;
          const meta = THEME_META[themeKey];

          return (
            <section key={themeKey} className="mb-8">
              <div className="flex items-end justify-between px-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{meta.emoji}</span>
                  <h2 className="text-base font-bold text-foreground">
                    {lang === "ar" ? meta.ar : meta.en}
                  </h2>
                  <span className="text-xs text-muted-foreground">({tours.length})</span>
                </div>
              </div>

              <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
                {tours.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/audio-tour/${a.slug || a.id}`)}
                    className="min-w-[260px] shrink-0 rounded-lg overflow-hidden shadow-card bg-card cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="relative h-36">
                      <img src={a.image} alt={lang === "ar" ? a.title_ar : a.title_en} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-medium">
                        <Headphones className="w-3 h-3" />
                        {a.duration_minutes} {t("common.min")} · {a.stops_count} {t("common.stops")}
                      </div>
                      <button
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-primary text-primary-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-sm font-bold text-primary-foreground line-clamp-2 leading-tight">
                          {lang === "ar" ? a.title_ar : a.title_en}
                        </h3>
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      {a.city_id && <CityBadge cityId={a.city_id} />}
                      <span className="text-sm font-bold text-primary-dark">
                        {a.price === 0 ? t("common.free") : `${a.price} ${t("common.egp")}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد نتائج" : "No tours found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAudioTours;
