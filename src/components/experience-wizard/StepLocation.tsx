import { useI18n } from "@/lib/i18n";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { ExperienceFormData } from "./types";

interface Props {
  form: ExperienceFormData;
  set: (key: string, value: string) => void;
  updateForm: (updates: Partial<ExperienceFormData>) => void;
}

const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

const StepLocation = ({ form, set, updateForm }: Props) => {
  const { lang } = useI18n();

  const updateStep = (idx: number, value: string) => {
    const arr = [...form.itinerary];
    arr[idx] = { step: value };
    updateForm({ itinerary: arr });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>
          <MapPin className="w-3.5 h-3.5 text-role-service-provider" />
          {lang === "ar" ? "الموقع العام" : "General Location"}
        </label>
        <input className={inputClass} placeholder={lang === "ar" ? "مثال: رشيد، البحيرة" : "e.g. Rosetta, Beheira"} value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={100} />
      </div>

      <div>
        <label className={labelClass}>
          <MapPin className="w-3.5 h-3.5 text-role-service-provider" />
          {lang === "ar" ? "نقطة الالتقاء" : "Meeting Point Name"}
        </label>
        <input className={inputClass} placeholder={lang === "ar" ? "مثال: أمام مسجد أبو مندور" : "e.g. In front of Abu Mandour Mosque"} value={form.meetingPointName} onChange={(e) => set("meetingPointName", e.target.value)} maxLength={200} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{lang === "ar" ? "خط العرض" : "Latitude"}</label>
          <input type="number" step="any" className={inputClass} placeholder="31.4015" value={form.meetingPointLat} onChange={(e) => set("meetingPointLat", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>{lang === "ar" ? "خط الطول" : "Longitude"}</label>
          <input type="number" step="any" className={inputClass} placeholder="30.4164" value={form.meetingPointLng} onChange={(e) => set("meetingPointLng", e.target.value)} />
        </div>
      </div>

      {/* Itinerary */}
      <div>
        <label className={labelClass}>{lang === "ar" ? "خطة الرحلة" : "Itinerary Steps"}</label>
        <div className="space-y-2">
          {form.itinerary.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="w-6 h-6 rounded-full bg-role-service-provider text-white flex items-center justify-center text-[10px] font-bold mt-2.5 shrink-0">{i + 1}</span>
              <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "وصف الخطوة..." : "Describe this step..."} value={item.step} onChange={(e) => updateStep(i, e.target.value)} maxLength={200} />
              {form.itinerary.length > 1 && (
                <button onClick={() => updateForm({ itinerary: form.itinerary.filter((_, j) => j !== i) })} className="p-2 text-destructive mt-1"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
          <button onClick={() => updateForm({ itinerary: [...form.itinerary, { step: "" }] })} className="flex items-center gap-1 text-xs font-medium text-role-service-provider ml-8">
            <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة خطوة" : "Add step"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepLocation;
