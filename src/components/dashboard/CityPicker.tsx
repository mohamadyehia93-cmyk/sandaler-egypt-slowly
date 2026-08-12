import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCities, useRegions } from "@/hooks/useListings";

type Props = {
  cityId: string;
  /** receives the chosen city id and the region id derived from the cities table */
  onChange: (cityId: string, regionId: string) => void;
  labelEn?: string;
  labelAr?: string;
  hintEn?: string;
  hintAr?: string;
  required?: boolean;
  iconClass?: string;
  inputClass?: string;
  labelClass?: string;
};

/**
 * Single source of truth for choosing a listing's city from the real `cities`
 * taxonomy, grouped by region. Always reports the region id alongside the city
 * id so callers never have to derive (or invent) it.
 */
const CityPicker = ({
  cityId,
  onChange,
  labelEn = "General Location (City)",
  labelAr = "الموقع العام (المدينة)",
  hintEn = "Choosing a city makes your listing appear on that city's and region's pages.",
  hintAr = "اختيار المدينة يجعل إعلانك يظهر في صفحات المدينة والمنطقة.",
  required,
  iconClass = "w-3.5 h-3.5 text-primary",
  inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40",
  labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5",
}: Props) => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const { data: cities } = useCities();
  const { data: regions } = useRegions();

  const grouped = useMemo(() => {
    const byRegion: Record<string, { id: string; name: string }[]> = {};
    (cities ?? []).forEach((c: any) => {
      (byRegion[c.region_id] ||= []).push({ id: c.id, name: ar ? c.name_ar : c.name_en });
    });
    Object.values(byRegion).forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));
    return byRegion;
  }, [cities, ar]);

  const regionName = (id: string) => {
    const r = (regions ?? []).find((x: any) => x.id === id) as any;
    return r ? (ar ? r.name_ar : r.name_en) : id;
  };

  const handle = (next: string) => {
    const city = (cities ?? []).find((c: any) => c.id === next) as any;
    onChange(next, city?.region_id ?? "");
  };

  return (
    <div>
      <label className={labelClass}>
        <MapPin className={iconClass} />
        {ar ? labelAr : labelEn}
        {required ? " *" : ""}
      </label>
      <select className={inputClass} value={cityId} onChange={(e) => handle(e.target.value)}>
        <option value="">{ar ? "اختر المدينة..." : "Select a city..."}</option>
        {Object.keys(grouped).map((rid) => (
          <optgroup key={rid} label={regionName(rid)}>
            {grouped[rid].map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <p className="text-[11px] text-muted-foreground mt-1.5">{ar ? hintAr : hintEn}</p>
    </div>
  );
};

export default CityPicker;
