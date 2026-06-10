import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useTransport } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";
import { Skeleton } from "./ui/skeleton";

const TransportCards = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { data: transport, isLoading } = useTransport();

  return (
    <SectionHeader titleKey="section.gettingAround">
      <div className="grid grid-cols-3 gap-3 px-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[130px] rounded-lg" />
          ))
        ) : (transport ?? []).slice(0, 3).map((tr) => (
          <div key={tr.id} onClick={() => navigate(`/transport/${tr.slug || tr.id}`)} className="rounded-lg shadow-card bg-card p-4 flex flex-col items-center gap-2 cursor-pointer">
            {tr.image && <img src={tr.image} alt="" className="w-10 h-10 rounded-full object-cover" />}
            <h3 className="text-xs font-semibold text-foreground text-center line-clamp-2">
              {lang === "ar" ? tr.name_ar : tr.name_en}
            </h3>
            {tr.provider_name_en && (
              <div className="flex items-center gap-1 mt-0.5">
                {tr.provider_image && <img src={tr.provider_image} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />}
                <span className="text-[9px] text-primary font-medium">
                  {lang === "ar" ? tr.provider_name_ar : tr.provider_name_en}
                </span>
              </div>
            )}
            {tr.city_id && <CityBadge cityId={tr.city_id} />}
            <span className="text-sm font-bold text-primary-dark">{tr.price} {t("common.egp")}</span>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default TransportCards;
