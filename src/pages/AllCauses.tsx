import { ArrowLeft, Heart, Users, Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useCauses, useRegions } from "@/hooks/useListings";
import CityBadge from "@/components/CityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";

type ThemeKey = "heritage" | "community" | "environment" | "education";

const THEME_META: Record<ThemeKey, { en: string; ar: string; emoji: string }> = {
  heritage: { en: "Heritage & Culture", ar: "التراث والثقافة", emoji: "🏺" },
  community: { en: "Community & Health", ar: "المجتمع والصحة", emoji: "🤝" },
  environment: { en: "Environment & Sustainability", ar: "البيئة والاستدامة", emoji: "🌱" },
  education: { en: "Education & Learning", ar: "التعليم والتعلّم", emoji: "📚" },
};

const THEME_ORDER: ThemeKey[] = ["heritage", "community", "environment", "education"];

const classifyCause = (c: any): ThemeKey => {
  const cat = (c.category_en ?? "").toLowerCase();
  if (cat.includes("heritage") || cat.includes("culture")) return "heritage";
  if (cat.includes("environment") || cat.includes("sustain")) return "environment";
  if (cat.includes("education")) return "education";
  return "community";
};

const AllCauses = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data: causes = [], isLoading } = useCauses();
  const { data: regions = [] } = useRegions();

  const filtered = useMemo(
    () =>
      (causes as any[]).filter((c) => {
        if (activeRegion && c.region_id !== activeRegion) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (c.title_en ?? "").toLowerCase().includes(q) || (c.title_ar ?? "").includes(q);
      }),
    [search, activeRegion, causes]
  );

  const grouped = useMemo(() => {
    const g: Record<ThemeKey, any[]> = { heritage: [], community: [], environment: [], education: [] };
    filtered.forEach((c) => g[classifyCause(c)].push(c));
    return g;
  }, [filtered]);

  const regionCounts = useMemo(() => {
    const c: Record<string, number> = {};
    (causes as any[]).forEach((x) => {
      if (x.region_id) c[x.region_id] = (c[x.region_id] || 0) + 1;
    });
    return c;
  }, [causes]);

  return (
    <div className="min-h-screen bg-surface pb-8">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {lang === "ar" ? "القضايا" : "Causes"}
          </h1>
          <span className="text-xs text-muted-foreground ms-auto">
            {filtered.length} {lang === "ar" ? "قضية" : "causes"}
          </span>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "ابحث في القضايا..." : "Search causes..."}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="px-4 pb-3 flex">
          <select
            value={activeRegion ?? ""}
            onChange={(e) => setActiveRegion(e.target.value || null)}
            className="w-auto px-4 py-2 rounded-full bg-primary text-primary-foreground border border-primary text-xs font-semibold outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_0.75rem_center] pe-8"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
            }}
          >
            <option value="" className="bg-card text-foreground">
              {lang === "ar" ? "كل المناطق" : "All Regions"}
            </option>
            {(regions as any[]).map((r) => {
              const count = regionCounts[r.id] || 0;
              if (count === 0) return null;
              return (
                <option key={r.id} value={r.id} className="bg-card text-foreground">
                  {r.emoji} {lang === "ar" ? r.name_ar : r.name_en}
                </option>
              );
            })}
          </select>
        </div>
      </header>

      <div className="pt-4">
        {isLoading ? (
          <div className="px-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          THEME_ORDER.map((themeKey) => {
            const items = grouped[themeKey];
            if (!items || items.length === 0) return null;
            const meta = THEME_META[themeKey];

            return (
              <section key={themeKey} className="mb-8">
                <div className="flex items-end justify-between px-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.emoji}</span>
                    <h2 className="text-base font-bold text-foreground">
                      {lang === "ar" ? meta.ar : meta.en}
                    </h2>
                    <span className="text-xs text-muted-foreground">({items.length})</span>
                  </div>
                </div>

                <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
                  {items.map((cause: any) => {
                    const goal = cause.goal || 1;
                    const progress = Math.round(((cause.raised ?? 0) / goal) * 100);
                    const title = lang === "ar" ? cause.title_ar : cause.title_en;
                    const category = lang === "ar" ? cause.category_ar : cause.category_en;
                    const orgName = lang === "ar" ? cause.org_name_ar : cause.org_name_en;
                    return (
                      <div
                        key={cause.id}
                        onClick={() => navigate(`/cause/${cause.slug || cause.id}`)}
                        className="min-w-[240px] shrink-0 rounded-lg overflow-hidden shadow-card bg-card cursor-pointer active:scale-[0.98] transition-transform"
                      >
                        <div className="relative h-32">
                          <img src={cause.image} alt={title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          {category && (
                            <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                              {category}
                            </span>
                          )}
                          <button
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Heart className="w-3.5 h-3.5 text-foreground" />
                          </button>
                        </div>
                        <div className="p-3">
                          <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">
                            {title}
                          </h3>
                          {cause.city_id && <CityBadge cityId={cause.city_id} />}
                          {orgName && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 mb-2">
                              {cause.org_logo && <span>{cause.org_logo}</span>}
                              <span className="font-medium truncate">{orgName}</span>
                            </div>
                          )}
                          <div className="w-full bg-border rounded-full h-1.5 mb-1">
                            <div
                              className="bg-primary h-1.5 rounded-full"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] mb-2">
                            <span className="text-primary font-semibold">{progress}%</span>
                            <span className="flex items-center gap-0.5 text-muted-foreground">
                              <Users className="w-3 h-3" /> {cause.supporters ?? 0}
                            </span>
                          </div>
                          {(() => {
                            const r = (regions as any[]).find((x) => x.id === cause.region_id);
                            if (!r) return null;
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/region/${cause.region_id}`);
                                }}
                                className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                              >
                                <MapPin className="w-3 h-3" />
                                {r.emoji} {lang === "ar" ? r.name_ar : r.name_en}
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد نتائج" : "No causes found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCauses;
