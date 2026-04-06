import { Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAccommodations } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";
import { Skeleton } from "./ui/skeleton";

const AccommodationCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { data: accommodation, isLoading } = useAccommodations();

  return (
    <SectionHeader titleKey="section.placesToStay" onSeeAll={() => {}}>
      <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="min-w-[200px] h-[220px] rounded-lg" />
          ))
        ) : (accommodation ?? []).map((a) => (
          <div key={a.id} className="min-w-[200px] rounded-lg overflow-hidden shadow-card bg-card cursor-pointer" onClick={() => navigate(`/stay/${a.id}`)}>
            <div className="relative h-32">
              <img src={a.image ?? ""} alt={lang === "ar" ? a.name_ar : a.name_en} className="w-full h-full object-cover" />
              <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                <Heart className="w-4 h-4 text-foreground" />
              </button>
              {a.accommodation_type && (
                <span className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {a.accommodation_type}
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-0.5">
                {lang === "ar" ? a.name_ar : a.name_en}
              </h3>
              {a.host_name_en && (
                <div className="flex items-center gap-1.5 mb-1">
                  {a.host_image && <img src={a.host_image} alt="" className="w-4 h-4 rounded-full object-cover" />}
                  <span className="text-[10px] text-primary font-medium truncate">
                    {lang === "ar" ? a.host_name_ar : a.host_name_en}
                  </span>
                </div>
              )}
              {a.city_id && <div className="mb-2"><CityBadge cityId={a.city_id} /></div>}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-primary-dark">
                  {a.price_per_night} {t("common.egp")}<span className="text-xs font-normal text-muted-foreground">{t("common.perNight")}</span>
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
