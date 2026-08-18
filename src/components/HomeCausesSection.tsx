import { useNavigate } from "react-router-dom";
import ProgramCauseCard from "@/components/ProgramCauseCard";
import { useI18n } from "@/lib/i18n";
import { useCauses, usePrograms } from "@/hooks/useListings";
import { mergeProgramsCauses } from "@/lib/programsCauses";
import SectionHeader from "./SectionHeader";
import { Skeleton } from "./ui/skeleton";

/** Home row: programs and causes in one feed, each card labelled. */
const HomeCausesSection = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { data: causes = [], isLoading } = useCauses();
  const { data: programs = [], isLoading: loadingPrograms } = usePrograms();

  const items = mergeProgramsCauses(programs as any[], causes as any[], lang).slice(0, 3);

  return (
    <SectionHeader titleKey="section.causes" onSeeAll={() => navigate("/causes")}>
      <div className="grid grid-cols-3 gap-3 px-4">
        {isLoading || loadingPrograms
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[200px] rounded-lg" />)
          : items.map((item) => <ProgramCauseCard key={`${item.kind}-${item.id}`} item={item} />)}
      </div>
    </SectionHeader>
  );
};

export default HomeCausesSection;
