import { Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { experiences } from "@/lib/sampleData";
import SectionHeader from "./SectionHeader";
import { useNavigate } from "react-router-dom";

const ExperienceCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  return (
    <SectionHeader titleKey="section.experiences" onSeeAll={() => {}}>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {experiences.map((e) => (
          <button
            key={e.id}
            onClick={() => navigate(`/experience/${e.id}`)}
            className="min-w-[200px] rounded-lg overflow-hidden shadow-card bg-card text-start"
          >
            <div className="relative h-32">
              <img src={e.image} alt={e.title[lang]} className="w-full h-full object-cover" />
              <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                <Heart className="w-4 h-4 text-foreground" />
              </button>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">{e.title[lang]}</h3>
              <p className="text-xs text-muted-foreground mb-2">{e.region[lang]} · {e.date}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary-dark">
                  {e.price} {t("common.egp")}
                </span>
                <span className="text-xs text-muted-foreground">⭐ {e.rating}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </SectionHeader>
  );
};

export default ExperienceCards;
