import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTrips, useRegions } from "@/hooks/useListings";
import { experienceThemes, ExperienceTheme } from "@/lib/sampleData";
import CityBadge from "@/components/CityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/BottomNav";

const AllTrips = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const themeParam = (params.get("theme") as ExperienceTheme | null) ?? "all";
  const [activeTheme, setActiveTheme] = useState<ExperienceTheme | "all">(themeParam);
  const [activeRegion, setActiveRegion] = useState("all");
  const [query, setQuery] = useState("");

  const { data: trips, isLoading } = useTrips();
  const { data: dbRegions } = useRegions();
  const regionsList = dbRegions ?? [];

  const filtered = useMemo(() => {
    return (trips ?? []).filter((tr: any) => {
      const themeMatch = activeTheme === "all" || tr.theme === activeTheme;
      const regionMatch = activeRegion === "all" || tr.region_id === activeRegion;
      const title = lang === "ar" ? tr.title_ar : tr.title_en;
      const queryMatch = !query.trim() || title?.toLowerCase().includes(query.toLowerCase());
      return themeMatch && regionMatch && queryMatch;
    });
  }, [trips, activeTheme, activeRegion, query, lang]);

  const setTheme = (key: ExperienceTheme | "all") => {
    setActiveTheme(key);
    if (key === "all") params.delete("theme");
    else params.set("theme", key);
    setParams(params, { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {lang === "ar" ? "كل الرحلات" : "All Trips"}
          </h1>
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} {lang === "ar" ? "رحلة" : "trips"}
          </span>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "ar" ? "ابحث عن رحلات..." : "Search trips..."}
              className="w-full pl-9 pr-3 h-9 text-sm bg-secondary rounded-lg border-0 outline-none"
            />
          </div>
        </div>

        {/* Theme pills */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setTheme("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
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
              onClick={() => setTheme(th.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                activeTheme === th.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {th.emoji} {th.label[lang]}
            </button>
          ))}
        </div>

        {/* Region select */}
        <div className="px-4 pb-3">
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
      </header>

      <div className="px-4 py-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            {lang === "ar" ? "لا توجد رحلات" : "No trips found"}
          </p>
        ) : (
          filtered.map((tr: any) => (
            <button
              key={tr.id}
              onClick={() => navigate(`/trip/${tr.slug || tr.id}`)}
              className="w-full flex gap-3 rounded-lg overflow-hidden shadow-card bg-card text-start"
            >
              <img
                src={tr.image || "/placeholder.svg"}
                alt={lang === "ar" ? tr.title_ar : tr.title_en}
                className="w-28 h-28 object-cover shrink-0"
              />
              <div className="flex-1 py-2 pr-3 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">
                    {lang === "ar" ? tr.title_ar : tr.title_en}
                  </h4>
                  {tr.city_id && <CityBadge cityId={tr.city_id} />}
                  {(tr.route_en || tr.route_ar) && (
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                      {lang === "ar" ? tr.route_ar : tr.route_en}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-primary-dark">
                    {tr.price} {t("common.egp")}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {t("common.book")}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default AllTrips;
