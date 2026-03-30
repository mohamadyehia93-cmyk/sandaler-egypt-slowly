import { Headphones, Play, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { audioTours } from "@/lib/sampleData";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";

const AudioTourCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  return (
    <SectionHeader titleKey="section.audioTours" onSeeAll={() => {}}>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {audioTours.map((a) => (
          <div
            key={a.id}
            onClick={() => navigate(`/audio-tour/${a.id}`)}
            className="min-w-[260px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer"
          >
            <div className="relative h-36">
              <img src={a.image} alt={a.title[lang]} className="w-full h-full object-cover" />
              <div className="absolute inset-0 gradient-overlay" />
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full text-xs font-medium">
                <Headphones className="w-3 h-3" />
                {a.duration} {t("common.min")} · {a.stops} {t("common.stops")}
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-sm font-bold text-primary-foreground line-clamp-2">{a.title[lang]}</h3>
                <p className="text-xs text-primary-foreground/70 mt-0.5">{a.region[lang]}</p>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-bold text-primary-dark">
                {a.price === 0 ? t("common.free") : `${a.price} ${t("common.egp")}`}
              </span>
              <div className="flex gap-2">
                <button className="p-1.5 rounded-full bg-secondary text-secondary-foreground">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-full bg-primary text-primary-foreground">
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default AudioTourCards;
