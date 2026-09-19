import { useState } from "react";
import { MapPin, ChevronDown, Users, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useTrips, useRegions } from "@/hooks/useListings";
import CardCarousel from "./CardCarousel";
import ContentCard from "./ContentCard";
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
          return r ? (lang === "ar" ? (r.name_ar || r.name_en) : r.name_en) : "";
        })();

  const chip =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-foreground";

  return (
    <section id="trips" className="mb-12 scroll-mt-28">
      <div className="px-4 mb-4 flex items-end justify-between">
        <h2 className={`text-[11px] font-semibold text-muted-foreground ${lang === "ar" ? "" : "uppercase tracking-[0.12em]"}`}>
          {t("section.trips")}
        </h2>
        <button
          onClick={() => navigate("/trips")}
          className="text-xs font-medium text-muted-foreground/80 hover:text-primary transition-colors"
        >
          {t("section.seeAll")}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 mb-4 overflow-x-auto hide-scrollbar">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={chip} aria-label={lang === "ar" ? "تصفية حسب المنطقة" : "Filter by region"}>
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
                  {r.emoji} {lang === "ar" ? (r.name_ar || r.name_en) : r.name_en}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={chip} aria-label={lang === "ar" ? "تصفية حسب نوع الرحلة" : "Filter by trip type"}>
              <Users className="w-3.5 h-3.5 text-primary" />
              {activeAccess === "all"
                ? lang === "ar" ? "نوع الرحلة" : "Trip Type"
                : activeAccess === "public"
                ? lang === "ar" ? "عامة" : "Public"
                : lang === "ar" ? "عند الطلب" : "On Request"}
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={chip} aria-label={lang === "ar" ? "تصفية حسب المدة" : "Filter by duration"}>
              <Clock className="w-3.5 h-3.5 text-primary" />
              {activeDuration === "all"
                ? lang === "ar" ? "المدة" : "Duration"
                : activeDuration === "one-day"
                ? lang === "ar" ? "يوم واحد" : "Day Trip"
                : lang === "ar" ? "متعدد الأيام" : "Multi-Day"}
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

      {isLoading ? (
        <div className="px-4">
          <Skeleton className="aspect-[3/2] w-full rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="px-4 text-sm text-muted-foreground text-center py-8">
          {lang === "ar" ? "لا توجد رحلات" : "No trips found"}
        </p>
      ) : (
        <CardCarousel>
          {filtered.slice(0, 8).map((tr) => (
            <ContentCard
              key={tr.id}
              type="trip"
              title={(lang === "ar" ? tr.title_ar || tr.title_en : tr.title_en) || ""}
              image={tr.image}
              href={`/trip/${tr.slug || tr.id}`}
              price={tr.price}
              wishlist={{ itemType: "trip", itemId: tr.id }}
            />
          ))}
        </CardCarousel>
      )}
    </section>
  );
};

export default TripCards;
