import { useI18n } from "@/lib/i18n";
import { useTransport } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import CardCarousel from "./CardCarousel";
import ContentCard from "./ContentCard";
import { Skeleton } from "./ui/skeleton";

const TransportCards = () => {
  const { lang } = useI18n();
  const { data: transport, isLoading } = useTransport();

  return (
    <SectionHeader id="rides" titleKey="section.gettingAround">
      {isLoading ? (
        <div className="px-4">
          <Skeleton className="aspect-[3/2] w-full rounded-xl" />
        </div>
      ) : (
        <CardCarousel>
          {(transport ?? []).slice(0, 6).map((tr) => (
            <ContentCard
              key={tr.id}
              type="ride"
              title={(lang === "ar" ? tr.name_ar || tr.name_en : tr.name_en) || ""}
              image={tr.image}
              href={`/transport/${tr.slug || tr.id}`}
              price={tr.price}
              note={
                tr.listing_kind !== "hosted"
                  ? lang === "ar"
                    ? "معلومات صندل"
                    : "Sandal info"
                  : undefined
              }
            />
          ))}
        </CardCarousel>
      )}
    </SectionHeader>
  );
};

export default TransportCards;
