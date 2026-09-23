import { useI18n } from "@/lib/i18n";
import { useRegions } from "@/hooks/useListings";
import { getRegionImage } from "@/lib/regionImageMap";
import SectionHeader from "./SectionHeader";
import CardCarousel from "./CardCarousel";
import ContentCard from "./ContentCard";
import { Skeleton } from "./ui/skeleton";

type RegionRow = { id: string; name_en?: string | null; name_ar?: string | null; image?: string | null };

/** Regions as the same large landscape cards as the rest of the homepage. */
const RegionScroll = () => {
  const { lang } = useI18n();
  const { data: regions, isLoading } = useRegions();

  return (
    <SectionHeader titleKey="section.regions">
      {isLoading ? (
        <div className="px-4">
          <Skeleton className="aspect-[3/2] w-full rounded-xl" />
        </div>
      ) : (
        <CardCarousel>
          {((regions ?? []) as RegionRow[]).map((r) => (
            <ContentCard
              key={r.id}
              type="region"
              title={(lang === "ar" ? r.name_ar || r.name_en : r.name_en) || ""}
              image={getRegionImage(r.id) ?? r.image ?? null}
              href={`/region/${r.id}`}
              showPrice={false}
            />
          ))}
        </CardCarousel>
      )}
    </SectionHeader>
  );
};

export default RegionScroll;
