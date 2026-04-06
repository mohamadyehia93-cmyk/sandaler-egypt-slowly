import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useCities } from "@/hooks/useListings";

interface CityBadgeProps {
  cityId: string;
  variant?: "overlay" | "inline";
}

const CityBadge = ({ cityId, variant = "inline" }: CityBadgeProps) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { data: cities } = useCities();
  const city = cities?.find(c => c.id === cityId);
  if (!city) return null;

  const name = lang === "ar" ? city.name_ar : city.name_en;

  if (variant === "overlay") {
    return (
      <span
        onClick={(e) => { e.stopPropagation(); navigate(`/city/${cityId}`); }}
        className="inline-flex items-center gap-0.5 bg-background/80 backdrop-blur-sm text-foreground text-[9px] font-semibold px-1.5 py-0.5 rounded-full cursor-pointer hover:bg-background/95 transition-colors"
      >
        <MapPin className="w-2.5 h-2.5" />
        {name}
      </span>
    );
  }

  return (
    <span
      onClick={(e) => { e.stopPropagation(); navigate(`/city/${cityId}`); }}
      className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-primary cursor-pointer transition-colors"
    >
      <MapPin className="w-3 h-3" />
      {name}
    </span>
  );
};

export default CityBadge;
