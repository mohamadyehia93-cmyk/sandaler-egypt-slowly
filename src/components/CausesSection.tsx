import { Heart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useCauses } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";

type Props = {
  regionId: string;
  cityFilter?: string;
};

const CausesSection = ({ regionId, cityFilter = "all" }: Props) => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { data: causes = [] } = useCauses();

  const filtered = (causes as any[])
    .filter((c) => c.region_id === regionId)
    .filter((c) => cityFilter === "all" || c.city_id === cityFilter);

  if (filtered.length === 0) return null;

  return (
    <SectionHeader titleKey="section.causes" onSeeAll={() => navigate("/causes")}>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {filtered.map((cause: any) => {
          const goal = cause.goal || 1;
          const progress = Math.round(((cause.raised ?? 0) / goal) * 100);
          const title = lang === "ar" ? cause.title_ar : cause.title_en;
          const summary = lang === "ar" ? cause.summary_ar : cause.summary_en;
          const category = lang === "ar" ? cause.category_ar : cause.category_en;
          const orgName = lang === "ar" ? cause.org_name_ar : cause.org_name_en;
          return (
            <div
              key={cause.id}
              onClick={() => navigate(`/cause/${cause.slug || cause.id}`)}
              className="min-w-[240px] max-w-[240px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer"
            >
              <div className="relative h-32">
                <img src={cause.image} alt={title} className="w-full h-full object-cover" />
                {category && (
                  <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {category}
                  </span>
                )}
                <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                  <Heart className="w-3.5 h-3.5 text-foreground" />
                </button>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">{title}</h3>
                {cause.city_id && <div className="mb-1"><CityBadge cityId={cause.city_id} /></div>}
                {summary && <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{summary}</p>}
                {orgName && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                    {cause.org_logo && <span>{cause.org_logo}</span>}
                    <span className="font-medium">{orgName}</span>
                  </div>
                )}
                <div className="w-full bg-border rounded-full h-1.5 mb-1.5">
                  <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-primary font-semibold">{progress}%</span>
                  <span className="flex items-center gap-0.5 text-muted-foreground">
                    <Users className="w-3 h-3" /> {cause.supporters ?? 0}
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

export default CausesSection;
