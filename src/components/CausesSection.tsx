import { Heart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { causes } from "@/lib/sampleData";
import SectionHeader from "./SectionHeader";

type Props = {
  regionId: string;
  cityFilter?: string;
};

const CausesSection = ({ regionId, cityFilter = "all" }: Props) => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const filtered = causes
    .filter((c) => c.regionId === regionId)
    .filter((c) => cityFilter === "all" || c.cityId === cityFilter);

  if (filtered.length === 0) return null;

  return (
    <SectionHeader titleKey="section.causes" onSeeAll={() => {}}>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {filtered.map((cause) => {
          const progress = Math.round((cause.raised / cause.goal) * 100);
          return (
            <div
              key={cause.id}
              onClick={() => navigate(`/cause/${cause.id}`)}
              className="min-w-[240px] max-w-[240px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer"
            >
              <div className="relative h-32">
                <img src={cause.image} alt={cause.title[lang]} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {cause.category[lang]}
                </span>
                <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                  <Heart className="w-3.5 h-3.5 text-foreground" />
                </button>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">{cause.title[lang]}</h3>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{cause.summary[lang]}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                  <span>{cause.org.logo}</span>
                  <span className="font-medium">{cause.org.name[lang]}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-border rounded-full h-1.5 mb-1.5">
                  <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
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

export default CausesSection;
