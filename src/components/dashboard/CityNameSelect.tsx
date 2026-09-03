import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCities, useRegions } from "@/hooks/useListings";

type Props = {
  /** The stored localized city name (these rows only have a free-text column). */
  value: string;
  onChange: (cityName: string, cityId: string, regionId: string) => void;
  label?: string;
  placeholder?: string;
  hint?: string;
  className?: string;
  labelClass?: string;
  iconClass?: string;
  compact?: boolean;
};

/**
 * City chooser for rows that only store a text location. It never lets the user
 * type free text — the value always comes from the real `cities` taxonomy — but
 * it reports the localized city name so legacy text columns keep working.
 */
const CityNameSelect = ({
  value,
  onChange,
  label,
  placeholder,
  hint,
  className = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40",
  labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5",
  iconClass = "w-3.5 h-3.5 text-primary",
  compact,
}: Props) => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const { data: cities } = useCities();
  const { data: regions } = useRegions();

  const name = (c: any) => (ar ? c.name_ar || c.name_en : c.name_en);

  const grouped = useMemo(() => {
    const byRegion: Record<string, { id: string; name: string }[]> = {};
    (cities ?? []).forEach((c: any) => {
      (byRegion[c.region_id] ||= []).push({ id: c.id, name: name(c) });
    });
    Object.values(byRegion).forEach((l) => l.sort((a, b) => a.name.localeCompare(b.name)));
    return byRegion;
  }, [cities, ar]);

  const regionName = (id: string) => {
    const r = (regions ?? []).find((x: any) => x.id === id) as any;
    return r ? (ar ? r.name_ar || r.name_en : r.name_en) : id;
  };

  // Match the stored text back onto a city id so editing keeps the selection.
  const selected =
    (cities ?? []).find((c: any) => name(c) === value || c.name_en === value || c.name_ar === value) as any;

  const handle = (cityId: string) => {
    const city = (cities ?? []).find((c: any) => c.id === cityId) as any;
    onChange(city ? name(city) : "", city?.id ?? "", city?.region_id ?? "");
  };

  return (
    <div>
      {label && !compact && (
        <label className={labelClass}>
          <MapPin className={iconClass} />
          {label}
        </label>
      )}
      <select className={className} value={selected?.id ?? ""} onChange={(e) => handle(e.target.value)}>
        <option value="">{placeholder ?? (ar ? "اختر المدينة..." : "Select a city...")}</option>
        {Object.keys(grouped).map((rid) => (
          <optgroup key={rid} label={regionName(rid)}>
            {grouped[rid].map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {hint && <p className="text-[11px] text-muted-foreground mt-1.5">{hint}</p>}
    </div>
  );
};

export default CityNameSelect;
