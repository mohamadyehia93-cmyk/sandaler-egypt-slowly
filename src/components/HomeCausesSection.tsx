import { Heart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useCauses } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import { Skeleton } from "./ui/skeleton";

const HomeCausesSection = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { data: causes, isLoading } = useCauses();

  return (
    <SectionHeader titleKey="section.causes" onSeeAll={() => navigate("/causes")}>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="min-w-[220px] h-[200px] rounded-lg" />
            ))
          : (causes ?? []).map((cause: any) => {
              const goal = cause.goal || 1;
              const progress = Math.round((cause.raised / goal) * 100);
              return (
                <div
                  key={cause.id}
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
            })}
      </div>
    </SectionHeader>
  );
};

export default HomeCausesSection;
