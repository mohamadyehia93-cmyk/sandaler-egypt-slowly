import { Heart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { causes } from "@/lib/sampleData";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";

const HomeCausesSection = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  return (
    <SectionHeader titleKey="section.causes" onSeeAll={() => navigate("/causes")}>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {causes.slice(0, 4).map((cause) => {
          const progress = Math.round((cause.raised / cause.goal) * 100);
          return (
            <div
              key={cause.id}
              onClick={() => navigate(`/cause/${cause.id}`)}
              className="min-w-[220px] shrink-0 rounded-lg overflow-hidden shadow-card bg-card cursor-pointer"
            >
              <div className="relative h-28">
                <img src={cause.image} alt={cause.title[lang]} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {cause.category[lang]}
                </span>
                <button className="absolute top-2 right-2 p-1 rounded-full bg-background/80 backdrop-blur-sm">
                  <Heart className="w-3.5 h-3.5 text-foreground" />
                </button>
              </div>
              <div className="p-2.5">
                <h3 className="text-xs font-semibold text-foreground line-clamp-2 mb-1">{cause.title[lang]}</h3>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1.5">
                  <span>{cause.org.logo}</span>
                  <span className="font-medium truncate">{cause.org.name[lang]}</span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 mb-1">
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

export default HomeCausesSection;
