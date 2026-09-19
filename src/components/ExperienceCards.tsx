import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useExperiences, useRegions } from "@/hooks/useListings";
import CardCarousel from "./CardCarousel";
import ContentCard from "./ContentCard";
import { Skeleton } from "./ui/skeleton";

const ExperienceCards = () => {
  const { lang, t } = useI18n();
  const { data: experiences, isLoading } = useExperiences();
  const { data: dbRegions } = useRegions();
  const [activeRegion, setActiveRegion] = useState("all");

  const regionsList = dbRegions ?? [];

  const filtered = (experiences ?? []).filter(
    (e) => activeRegion === "all" || e.region_id === activeRegion
  );

  return (
    <section id="experiences" className="mb-12 scroll-mt-28">
      <div className="px-4 mb-4 flex items-center justify-between gap-3">
        <h2 className={`text-[11px] font-semibold text-muted-foreground ${lang === "ar" ? "" : "uppercase tracking-[0.12em]"}`}>
          {t("section.experiences")}
        </h2>
        <select
          value={activeRegion}
          onChange={(e) => setActiveRegion(e.target.value)}
          aria-label={lang === "ar" ? "تصفية حسب المنطقة" : "Filter by region"}
          className="px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-semibold border border-border outline-none cursor-pointer"
        >
          <option value="all">{lang === "ar" ? "كل المناطق" : "All Regions"}</option>
          {regionsList.map((r) => (
            <option key={r.id} value={r.id}>
              {lang === "ar" ? r.name_ar || r.name_en : r.name_en}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="px-4">
          <Skeleton className="aspect-[3/2] w-full rounded-xl" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="px-4 text-sm text-muted-foreground text-center py-8">
          {lang === "ar" ? "لا توجد تجارب" : "No experiences found"}
        </p>
      ) : (
        <CardCarousel>
          {filtered.slice(0, 8).map((e) => (
            <ContentCard
              key={e.id}
              type="experience"
              title={(lang === "ar" ? e.title_ar || e.title_en : e.title_en) || ""}
              image={e.image}
              href={`/experience/${e.slug || e.id}`}
              price={e.price}
              wishlist={{ itemType: "experience", itemId: e.id }}
            />
          ))}
        </CardCarousel>
      )}
    </section>
  );
};

export default ExperienceCards;
