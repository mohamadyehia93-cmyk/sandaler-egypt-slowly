import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { MapPin, Plus, Trash2, NotebookPen } from "lucide-react";
import { ExperienceFormData } from "./types";
import { useCities, useRegions } from "@/hooks/useListings";
import { getCityCoords } from "@/lib/cityCoords";
import LocationPicker from "@/components/dashboard/LocationPicker";

interface Props {
  form: ExperienceFormData;
  set: (key: string, value: string) => void;
  updateForm: (updates: Partial<ExperienceFormData>) => void;
}

const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

const StepLocation = ({ form, set, updateForm }: Props) => {
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

  const updateStep = (idx: number, value: string) => {
    const arr = [...form.itinerary];
    arr[idx] = { step: value };
    updateForm({ itinerary: arr });
  };

  return (
    <div className="space-y-5">
      {/* General location — real city taxonomy */}
      <CityPicker
        cityId={form.cityId}
        onChange={(cityId, regionId) => updateForm({ cityId, regionId })}
        iconClass="w-3.5 h-3.5 text-role-service-provider"
        inputClass={inputClass}
        labelClass={labelClass}
        hintEn="Choosing a city makes your listing appear on that city's and region's pages."
        hintAr="اختيار المدينة يجعل تجربتك تظهر في صفحات المدينة والمنطقة."
      />


      {/* Secondary free-text fallback */}
      <div>
        <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">
          {ar ? "منطقة/قرية أدق (اختياري)" : "More precise area / village (optional)"}
        </label>
        <input
          className={`${inputClass} py-2.5`}
          placeholder={ar ? "مثال: قرية أبو صير، إذا لم تكن مدرجة" : "e.g. Abu Sir village, if not in the list"}
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          maxLength={100}
        />
      </div>

      {/* Specific location — map picker */}
      <div>
        <label className={labelClass}>
          <MapPin className="w-3.5 h-3.5 text-role-service-provider" />
          {ar ? "نقطة الالتقاء على الخريطة" : "Meeting Point on the Map"}
        </label>
        <LocationPicker
          lat={form.meetingPointLat}
          lng={form.meetingPointLng}
          fallbackCenter={getCityCoords(form.cityId)}
          onChange={(la, lo) =>
            updateForm({ meetingPointLat: String(la.toFixed(6)), meetingPointLng: String(lo.toFixed(6)) })
          }
        />
      </div>

      <div>
        <label className={labelClass}>
          <MapPin className="w-3.5 h-3.5 text-role-service-provider" />
          {ar ? "اسم نقطة الالتقاء" : "Meeting Point Name"}
        </label>
        <input className={inputClass} placeholder={ar ? "مثال: أمام مسجد أبو مندور" : "e.g. In front of Abu Mandour Mosque"} value={form.meetingPointName} onChange={(e) => set("meetingPointName", e.target.value)} maxLength={200} />
      </div>

      {/* Remarks */}
      <div>
        <label className={labelClass}>
          <NotebookPen className="w-3.5 h-3.5 text-role-service-provider" />
          {ar ? "ملاحظات مهمة" : "Main Remarks"}
        </label>
        <textarea
          className={`${inputClass} min-h-[90px] resize-y`}
          placeholder={ar ? "ما يجب أن يعرفه الضيف: ما يحمله، إمكانية الوصول، ملاحظات التوقيت..." : "What a guest must know: what to bring, accessibility, timing caveats..."}
          value={ar ? form.remarks_ar : form.remarks_en}
          onChange={(e) => set(ar ? "remarks_ar" : "remarks_en", e.target.value)}
          maxLength={600}
        />
        <input
          className={`${inputClass} py-2.5 mt-2`}
          placeholder={ar ? "Remarks in English (optional)" : "ملاحظات بالعربية (اختياري)"}
          value={ar ? form.remarks_en : form.remarks_ar}
          onChange={(e) => set(ar ? "remarks_en" : "remarks_ar", e.target.value)}
          maxLength={600}
        />
      </div>

      {/* Itinerary */}
      <div>
        <label className={labelClass}>{ar ? "خطة الرحلة" : "Itinerary Steps"}</label>
        <div className="space-y-2">
          {form.itinerary.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="w-6 h-6 rounded-full bg-role-service-provider text-white flex items-center justify-center text-[10px] font-bold mt-2.5 shrink-0">{i + 1}</span>
              <input className={`${inputClass} flex-1`} placeholder={ar ? "وصف الخطوة..." : "Describe this step..."} value={item.step} onChange={(e) => updateStep(i, e.target.value)} maxLength={200} />
              {form.itinerary.length > 1 && (
                <button onClick={() => updateForm({ itinerary: form.itinerary.filter((_, j) => j !== i) })} className="p-2 text-destructive mt-1"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
          <button onClick={() => updateForm({ itinerary: [...form.itinerary, { step: "" }] })} className="flex items-center gap-1 text-xs font-medium text-role-service-provider ms-8">
            <Plus className="w-3.5 h-3.5" /> {ar ? "إضافة خطوة" : "Add step"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepLocation;
