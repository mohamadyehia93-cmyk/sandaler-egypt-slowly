import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useCauses, usePrograms } from "@/hooks/useListings";
import { mergeProgramsCauses } from "@/lib/programsCauses";
import SectionHeader from "./SectionHeader";
import CardCarousel from "./CardCarousel";
import ContentCard from "./ContentCard";
import { Skeleton } from "./ui/skeleton";

/** Home row: programs and causes in one feed, each card labelled. */
const HomeCausesSection = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { data: causes = [], isLoading } = useCauses();
  const { data: programs = [], isLoading: loadingPrograms } = usePrograms();

  const items = mergeProgramsCauses(programs as any[], causes as any[], lang).slice(0, 6);

  return (
    <SectionHeader id="causes" titleKey="section.causes" onSeeAll={() => navigate("/causes")}>
      {isLoading || loadingPrograms ? (
        <div className="px-4">
          <Skeleton className="aspect-[3/2] w-full rounded-xl" />
        </div>
      ) : (
        <CardCarousel>
          {items.map((item) => (
            <ContentCard
              key={`${item.kind}-${item.id}`}
              type={item.kind === "program" ? "program" : "cause"}
              title={item.title}
              image={item.image}
              href={item.href}
              showPrice={false}
              wishlist={item.kind === "cause" ? { itemType: "cause", itemId: item.id } : undefined}
            />
          ))}
        </CardCarousel>
      )}
    </SectionHeader>
  );
};

export default HomeCausesSection;
