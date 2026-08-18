import { CalendarDays, Target, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

type Props = { programs: any[]; title?: string };

const ProgramsSection = ({ programs, title }: Props) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  if (programs.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-4">
        <Target className="h-4 w-4 text-primary" />
        <h2 className="text-base font-bold text-foreground">{title || (lang === "ar" ? "البرامج المجتمعية" : "Community programs")}</h2>
        <span className="text-xs text-muted-foreground">({programs.length})</span>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 hide-scrollbar">
        {programs.map((program) => {
          const name = lang === "ar" ? (program.title_ar || program.title_en) : program.title_en;
          const description = lang === "ar" ? (program.description_ar || program.description_en) : program.description_en;
          return (
            <button key={program.id} type="button" onClick={() => navigate(`/program/${program.slug || program.id}`)} className="min-w-[240px] max-w-[240px] overflow-hidden rounded-lg bg-card text-start shadow-card">
              <div className="h-32 bg-secondary">{program.image ? <img src={program.image} alt={name} className="h-full w-full object-cover" /> : <Target className="m-auto h-full w-8 text-muted-foreground" />}</div>
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{name}</h3>
                {description && <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{description}</p>}
                <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                  {program.start_date && <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{program.start_date}</span>}
                  {program.volunteers_needed != null && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{program.volunteers_needed}</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ProgramsSection;