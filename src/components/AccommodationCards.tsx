import { Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { accommodation } from "@/lib/sampleData";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";

const AccommodationCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  return (
    <SectionHeader titleKey="section.placesToStay" onSeeAll={() => {}}>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {accommodation.map((a) => (
          <div key={a.id} className="min-w-[200px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer" onClick={() => navigate(`/stay/${a.id}`)}>
            <div className="relative h-32">
              <img src={a.image} alt={a.title[lang]} className="w-full h-full object-cover" />
              <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                <Heart className="w-4 h-4 text-foreground" />
              </button>
              <span className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                {a.type[lang]}
              </span>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-0.5">{a.title[lang]}</h3>
              <p className="text-xs text-muted-foreground mb-2">{a.location[lang]}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary-dark">
                  {a.price} {t("common.egp")}<span className="text-xs font-normal text-muted-foreground">{t("common.perNight")}</span>
                </span>
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {a.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default AccommodationCards;
