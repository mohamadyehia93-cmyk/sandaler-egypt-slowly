import { HandHeart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProgramCauseCard from "@/components/ProgramCauseCard";
import { useI18n } from "@/lib/i18n";
import { mergeProgramsCauses } from "@/lib/programsCauses";

type Props = { programs: any[]; causes: any[] };

/**
 * The single "Programs & Causes" feed. Replaces the old split
 * "Community programs" + "Local causes" rows.
 */
const ProgramsCausesSection = ({ programs, causes }: Props) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const items = mergeProgramsCauses(programs, causes, lang);
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-4">
        <HandHeart className="h-4 w-4 text-primary" />
        <h2 className="text-base font-bold text-foreground">
          {lang === "ar" ? "البرامج والقضايا" : "Programs & Causes"}
        </h2>
        <span className="text-xs text-muted-foreground">({items.length})</span>
        <button
          onClick={() => navigate("/causes")}
          className="ms-auto text-xs font-semibold text-primary"
        >
          {lang === "ar" ? "عرض الكل" : "See all"}
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 hide-scrollbar">
        {items.map((item) => (
          <ProgramCauseCard
            key={`${item.kind}-${item.id}`}
            item={item}
            className="min-w-[240px] max-w-[240px] shrink-0"
          />
        ))}
      </div>
    </section>
  );
};

export default ProgramsCausesSection;
