import { useI18n } from "@/lib/i18n";
import { useAccommodations } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import CardCarousel from "./CardCarousel";
import ContentCard from "./ContentCard";
import { Skeleton } from "./ui/skeleton";

const AccommodationCards = () => {
  const { lang } = useI18n();
  const { data: accommodation, isLoading } = useAccommodations();

  return (
    <SectionHeader id="stays" titleKey="section.placesToStay">
      {isLoading ? (
        <div className="px-4">
          <Skeleton className="aspect-[3/2] w-full rounded-xl" />
        </div>
      ) : (
        <CardCarousel>
          {(accommodation ?? []).slice(0, 6).map((a) => (
            <ContentCard
              key={a.id}
              type="stay"
              title={(lang === "ar" ? a.name_ar || a.name_en : a.name_en) || ""}
              image={a.image}
              href={`/stay/${a.slug || a.id}`}
              price={a.price_per_night}
              note={a.price_per_night ? (lang === "ar" ? "لكل ليلة" : "per night") : undefined}
              wishlist={{ itemType: "accommodation", itemId: a.id }}
            />
          ))}
        </CardCarousel>
      )}
    </SectionHeader>
  );
};

export default AccommodationCards;
