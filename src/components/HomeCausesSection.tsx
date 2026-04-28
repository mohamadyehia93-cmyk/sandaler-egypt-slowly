import { Heart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useCauses } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import { Skeleton } from "./ui/skeleton";
import { REGION_LABEL, groupByRegion } from "@/lib/regionThemes";

const CauseCard = ({ cause, lang, navigate }: any) => {
  const goal = cause.goal || 1;
  const progress = Math.round((cause.raised / goal) * 100);
  return (
    <div
      onClick={() => navigate(`/cause/${cause.slug || cause.id}`)}
      className="min-w-[220px] shrink-0 rounded-lg overflow-hidden shadow-card bg-card cursor-pointer"
    >
      <div className="relative h-28">
        <img
          src={cause.image || "/placeholder.svg"}
          alt={lang === "ar" ? cause.title_ar : cause.title_en}
          className="w-full h-full object-cover"
        />
        {(lang === "ar" ? cause.category_ar : cause.category_en) && (
          <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
            {lang === "ar" ? cause.category_ar : cause.category_en}
          </span>
        )}
        <button className="absolute top-2 right-2 p-1 rounded-full bg-background/80 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
          <Heart className="w-3.5 h-3.5 text-foreground" />
        </button>
      </div>
      <div className="p-2.5">
        <h3 className="text-xs font-semibold text-foreground line-clamp-2 mb-1">
          {lang === "ar" ? cause.title_ar : cause.title_en}
        </h3>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1.5">
          <span>{cause.org_logo}</span>
          <span className="font-medium truncate">
            {lang === "ar" ? cause.org_name_ar : cause.org_name_en}
          </span>
        </div>
        <div className="w-full bg-border rounded-full h-1.5 mb-1">
          <div
            className="bg-primary h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-primary font-semibold">{progress}%</span>
          <span className="flex items-center gap-0.5 text-muted-foreground">
            <Users className="w-3 h-3" /> {cause.supporters}
          </span>
        </div>
      </div>
    </div>
  );
};

const HomeCausesSection = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { data: causes, isLoading } = useCauses();

  if (isLoading) {
    return (
      <SectionHeader titleKey="section.causes" onSeeAll={() => navigate("/causes")}>
        <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="min-w-[220px] h-[200px] rounded-lg" />
          ))}
        </div>
      </SectionHeader>
    );
  }

  const { grouped, themes } = groupByRegion((causes ?? []) as any[]);

  return (
    <SectionHeader titleKey="section.causes" onSeeAll={() => navigate("/causes")}>
      <div className="space-y-5">
        {themes.map((region) => (
          <div key={region}>
            <h3 className="px-4 mb-2 text-[13px] font-bold text-foreground">
              {REGION_LABEL[region][lang]}
            </h3>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {grouped[region].map((cause: any) => (
                <CauseCard key={cause.id} cause={cause} lang={lang} navigate={navigate} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default HomeCausesSection;
