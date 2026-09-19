import { Headphones, Play, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAudioTours } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";
import PriceBadge from "./PriceBadge";

import { Skeleton } from "./ui/skeleton";

const AudioTourCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { data: audioTours, isLoading } = useAudioTours();

  return (
    <SectionHeader titleKey="section.audioTours" onSeeAll={() => navigate("/audio-tours")}>
      <div className="grid grid-cols-3 gap-3 px-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))
        ) : (audioTours ?? []).slice(0, 3).map((a: any) => {
          const open = () => navigate(`/audio-tour/${a.slug || a.id}`);
          return (
          <div
            key={a.id}
            onClick={open}
            className="rounded-lg overflow-hidden shadow-card bg-card cursor-pointer"
          >
            <div className="relative h-36">
              <img src={a.image ?? ""} alt={lang === "ar" ? (a.title_ar || a.title_en) : a.title_en} className="w-full h-full object-cover" />
              <div className="absolute inset-0 gradient-overlay" />
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full text-xs font-medium">
                <Headphones className="w-3 h-3" />
                {a.duration_minutes} {t("common.min")} · {a.stops_count} {t("common.stops")}
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-sm font-bold text-primary-foreground line-clamp-2">
                  {lang === "ar" ? (a.title_ar || a.title_en) : a.title_en}
                </h3>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                {a.city_id && <CityBadge cityId={a.city_id} />}
                <PriceBadge price={a.price} />
              </div>
              <div className="flex gap-2">
                <button
                  className="p-1.5 rounded-full bg-secondary text-secondary-foreground"
                  aria-label={lang === "ar" ? "تفاصيل الجولة" : "Tour details"}
                  onClick={(e) => { e.stopPropagation(); open(); }}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 rounded-full bg-primary text-primary-foreground"
                  aria-label={lang === "ar" ? "تشغيل الجولة" : "Play tour"}
                  onClick={(e) => { e.stopPropagation(); open(); }}
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          );
        })}

      </div>
    </SectionHeader>
  );
};

export default AudioTourCards;
