import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useCities, useRegions } from "@/hooks/useListings";

interface LocationChipsProps {
  cityId?: string | null;
  regionId?: string | null;
  /** Free-text location stored on the row; rendered as plain text, never a link. */
  fallbackText?: string | null;
  className?: string;
}

/**
 * Renders links to CityDetail (/city/:cityId) and RegionDetail (/region/:regionId)
 * using the ids those routes actually resolve. When the row has no city/region id
 * the location is rendered as plain text instead of a dead link.
 */
const LocationChips = ({ cityId, regionId, fallbackText, className }: LocationChipsProps) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { data: cities } = useCities();
  const { data: regions } = useRegions();

  const city = cityId ? cities?.find((c: any) => c.id === cityId) : undefined;
  const region = regionId ? regions?.find((r: any) => r.id === regionId) : undefined;

  const chips: { key: string; label: string; href: string }[] = [];
  if (city) chips.push({ key: `c-${city.id}`, label: lang === "ar" ? (city.name_ar || city.name_en) : city.name_en, href: `/city/${city.id}` });
  if (region) chips.push({ key: `r-${region.id}`, label: lang === "ar" ? (region.name_ar || region.name_en) : region.name_en, href: `/region/${region.id}` });

  const text = (fallbackText || "").trim();
  if (chips.length === 0 && !text) return null;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className ?? ""}`}>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => navigate(chip.href)}
          className="inline-flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full hover:bg-primary/15 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-primary" />
          {chip.label}
        </button>
      ))}
      {text && (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          {chips.length === 0 && <MapPin className="w-3.5 h-3.5 text-primary" />}
          {text}
        </span>
      )}
    </div>
  );
};

export default LocationChips;
