import { useI18n } from "@/lib/i18n";
import { Calendar, Clock } from "lucide-react";
import { ExperienceFormData, daysOfWeek } from "./types";

interface Props {
  form: ExperienceFormData;
  set: (key: string, value: string) => void;
  updateForm: (updates: Partial<ExperienceFormData>) => void;
}

const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

const StepAvailability = ({ form, set, updateForm }: Props) => {
  const { lang } = useI18n();

  const toggleDay = (day: string) => {
    const days = form.availableDays.includes(day)
      ? form.availableDays.filter((d) => d !== day)
      : [...form.availableDays, day];
    updateForm({ availableDays: days });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>
          <Calendar className="w-3.5 h-3.5 text-role-service-provider" />
          {lang === "ar" ? "الأيام المتاحة" : "Available Days"}
        </label>
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <button
              key={day.en}
              onClick={() => toggleDay(day.en)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                form.availableDays.includes(day.en)
                  ? "bg-role-service-provider text-white border-role-service-provider"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {lang === "ar" ? day.ar : day.en}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            <Clock className="w-3.5 h-3.5 text-role-service-provider" />
            {lang === "ar" ? "وقت البداية" : "Start Time"}
          </label>
          <input type="time" className={inputClass} value={form.startTime} onChange={(e) => set("startTime", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>
            <Clock className="w-3.5 h-3.5 text-role-service-provider" />
            {lang === "ar" ? "وقت النهاية" : "End Time"}
          </label>
          <input type="time" className={inputClass} value={form.endTime} onChange={(e) => set("endTime", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{lang === "ar" ? "بداية الموسم" : "Season Start"}</label>
          <input type="date" className={inputClass} value={form.seasonStart} onChange={(e) => set("seasonStart", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>{lang === "ar" ? "نهاية الموسم" : "Season End"}</label>
          <input type="date" className={inputClass} value={form.seasonEnd} onChange={(e) => set("seasonEnd", e.target.value)} />
        </div>
      </div>
    </div>
  );
};

export default StepAvailability;
