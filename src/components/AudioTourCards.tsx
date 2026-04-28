import { Headphones, Play, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAudioTours } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";
import { Skeleton } from "./ui/skeleton";
import { REGION_LABEL, groupByRegion } from "@/lib/regionThemes";

const TourCard = ({ a, lang, t, navigate }: any) => (
  <div
    onClick={() => navigate(`/audio-tour/${a.slug || a.id}`)}
    className="min-w-[260px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer"
  >
    <div className="relative h-36">
      <img src={a.image ?? ""} alt={lang === "ar" ? a.title_ar : a.title_en} className="w-full h-full object-cover" />
      <div className="absolute inset-0 gradient-overlay" />
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full text-xs font-medium">
        <Headphones className="w-3 h-3" />
        {a.duration_minutes} {t("common.min")} · {a.stops_count} {t("common.stops")}
      </div>
      <div className="absolute bottom-3 left-3 right-3">
        <h3 className="text-sm font-bold text-primary-foreground line-clamp-2">
          {lang === "ar" ? a.title_ar : a.title_en}
        </h3>
      </div>
    </div>
    <div className="p-3 flex items-center justify-between">
      <div className="flex flex-col gap-1">
        {a.city_id && <CityBadge cityId={a.city_id} />}
        <span className="text-sm font-bold text-primary-dark">
          {a.price === 0 ? t("common.free") : `${a.price} ${t("common.egp")}`}
        </span>
      </div>
      <div className="flex gap-2">
        <button className="p-1.5 rounded-full bg-secondary text-secondary-foreground" onClick={(e) => e.stopPropagation()}>
          <Download className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded-full bg-primary text-primary-foreground" onClick={(e) => e.stopPropagation()}>
          <Play className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const AudioTourCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { data: audioTours, isLoading } = useAudioTours();

  if (isLoading) {
    return (
      <SectionHeader titleKey="section.audioTours" onSeeAll={() => navigate("/audio-tours")}>
        <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="min-w-[260px] h-[200px] rounded-lg" />
          ))}
        </div>
      </SectionHeader>
    );
  }

  const { grouped, themes } = groupByRegion((audioTours ?? []) as any[]);

  return (
    <SectionHeader titleKey="section.audioTours" onSeeAll={() => navigate("/audio-tours")}>
      <div className="space-y-5">
        {themes.map((region) => (
          <div key={region}>
            <h3 className="px-4 mb-2 text-[13px] font-bold text-foreground">
              {REGION_LABEL[region][lang]}
            </h3>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {grouped[region].map((a: any) => (
                <TourCard key={a.id} a={a} lang={lang} t={t} navigate={navigate} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default AudioTourCards;
