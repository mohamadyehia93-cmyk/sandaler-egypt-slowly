import { useState, useMemo } from "react";
import { MapPin, ChevronDown, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { EXPERIENCE_THEMES } from "@/lib/listingTaxonomy";
import { useTrips, useRegions } from "@/hooks/useListings";
import CityBadge from "./CityBadge";
import { Skeleton } from "./ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type TripAccessType = "public" | "private";
type TripDuration = "one-day" | "multi-day";

const TripCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { data: trips, isLoading } = useTrips();
  const { data: dbRegions } = useRegions();
  const [activeRegion, setActiveRegion] = useState("all");
  const [activeAccess, setActiveAccess] = useState<TripAccessType | "all">("all");
  const [activeDuration, setActiveDuration] = useState<TripDuration | "all">("all");

  const filtered = (trips ?? []).filter((tr) => {
    const regionMatch = activeRegion === "all" || tr.region_id === activeRegion;
    const accessMatch = activeAccess === "all" || tr.access_type === activeAccess;
    const durationMatch =
      activeDuration === "all" ||
      (activeDuration === "one-day" ? (tr.duration_days ?? 1) <= 1 : (tr.duration_days ?? 1) > 1);
    return regionMatch && accessMatch && durationMatch;
  });

  const regionsList = dbRegions ?? [];

  const activeRegionLabel =
    activeRegion === "all"
      ? lang === "ar" ? "كل المناطق" : "All Regions"
      : (() => {
          const r = regionsList.find((r) => r.id === activeRegion);
          return r ? (lang === "ar" ? r.name_ar : r.name_en) : "";
        })();

  // Group trips by theme, preserving order
  const grouped = useMemo(() => {
    return EXPERIENCE_THEMES
      .map((th) => ({
        theme: th,
        items: filtered.filter((tr: any) => tr.theme === th.key),
      }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <section className="pb-6">
      {/* Header row */}
      <div className="px-4 mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t("section.trips")}
        </h2>
      </div>

      {/* Filter dropdowns row */}
      <div className="flex gap-2 px-4 mb-3 overflow-x-auto hide-scrollbar">
        {/* Region dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground shadow-card" aria-label={lang === "ar" ? "تصفية حسب المنطقة" : "Filter by region"}>
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {activeRegionLabel}
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px] max-h-72 overflow-y-auto">
            <DropdownMenuRadioGroup value={activeRegion} onValueChange={setActiveRegion}>
              <DropdownMenuRadioItem value="all">{lang === "ar" ? "كل المناطق" : "All Regions"}</DropdownMenuRadioItem>
              {regionsList.map((r) => (
                <DropdownMenuRadioItem key={r.id} value={r.id}>
                  {r.emoji} {lang === "ar" ? r.name_ar : r.name_en}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Access type dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground shadow-card" aria-label={lang === "ar" ? "تصفية حسب نوع الرحلة" : "Filter by trip type"}>
            <Users className="w-3.5 h-3.5 text-primary" />
            {activeAccess === "all"
              ? lang === "ar"
                ? "نوع الرحلة"
                : "Trip Type"
              : activeAccess === "public"
              ? lang === "ar"
                ? "عامة"
                : "Public"
              : lang === "ar"
              ? "عند الطلب"
              : "On Request"}
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px]">
            <DropdownMenuRadioGroup value={activeAccess} onValueChange={(value) => setActiveAccess(value as TripAccessType | "all")}>
              {(
                [
                  { key: "all" as const, label: { en: "All Types", ar: "كل الأنواع" } },
                  { key: "public" as const, label: { en: "Public", ar: "عامة" } },
                  { key: "private" as const, label: { en: "On Request", ar: "عند الطلب" } },
                ] as const
              ).map(({ key, label }) => (
                <DropdownMenuRadioItem key={key} value={key}>
                  {label[lang]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Duration dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground shadow-card" aria-label={lang === "ar" ? "تصفية حسب المدة" : "Filter by duration"}>
            <Clock className="w-3.5 h-3.5 text-primary" />
            {activeDuration === "all"
              ? lang === "ar"
                ? "المدة"
                : "Duration"
              : activeDuration === "one-day"
              ? lang === "ar"
                ? "يوم واحد"
                : "Day Trip"
              : lang === "ar"
              ? "متعدد الأيام"
              : "Multi-Day"}
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px]">
            <DropdownMenuRadioGroup value={activeDuration} onValueChange={(value) => setActiveDuration(value as TripDuration | "all")}>
              {(
                [
                  { key: "all" as const, label: { en: "All Durations", ar: "كل المدد" } },
                  { key: "one-day" as const, label: { en: "Day Trip", ar: "يوم واحد" } },
                  { key: "multi-day" as const, label: { en: "Multi-Day", ar: "متعدد الأيام" } },
                ] as const
              ).map(({ key, label }) => (
                <DropdownMenuRadioItem key={key} value={key}>
                  {label[lang]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Grouped vertical feed with horizontal scrollers */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3 px-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[220px] rounded-lg" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <p className="px-4 text-sm text-muted-foreground text-center py-8">
          {lang === "ar" ? "لا توجد رحلات" : "No trips found"}
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ theme, items }) => (
            <div key={theme.key}>
              <div className="px-4 mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{theme.emoji}</span>
                  <h3 className="text-base font-bold text-foreground">{theme.label[lang]}</h3>
                  <span className="text-xs text-muted-foreground">({items.length})</span>
                </div>
                <button
                  onClick={() => navigate(`/trips?theme=${theme.key}`)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {lang === "ar" ? "عرض الكل ←" : "See all →"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 px-4">
                {items.slice(0, 3).map((tr: any) => (
                  <div
                    key={tr.id}
                    onClick={() => navigate(`/trip/${tr.slug || tr.id}`)}
                    className="rounded-lg overflow-hidden shadow-card bg-card cursor-pointer"
                  >
                    <div className="relative h-32">
                      <img
                        src={tr.image || "/placeholder.svg"}
                        alt={lang === "ar" ? tr.title_ar : tr.title_en}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {tr.city_id && <CityBadge cityId={tr.city_id} />}
                        <span className="text-[10px] text-muted-foreground">
                          {lang === "ar" ? tr.route_ar : tr.route_en}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">
                        {lang === "ar" ? tr.title_ar : tr.title_en}
                      </h4>
                      {tr.organizer_name_en && (
                        <div className="flex items-center gap-1.5 mb-2">
                          {tr.organizer_image && (
                            <img
                              src={tr.organizer_image}
                              alt=""
                              className="w-4 h-4 rounded-full object-cover"
                            />
                          )}
                          <span className="text-[10px] text-primary font-medium truncate">
                            {lang === "ar" ? tr.organizer_name_ar : tr.organizer_name_en}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary-dark">
                          {tr.price} {t("common.egp")}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/booking?type=trip&id=${tr.id}`); }}
                          className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
                        >
                          {t("common.book")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TripCards;
