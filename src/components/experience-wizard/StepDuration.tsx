import { useI18n } from "@/lib/i18n";
import { Clock, Users } from "lucide-react";
import { ExperienceFormData } from "./types";

interface Props {
  form: ExperienceFormData;
  set: (key: string, value: string) => void;
}

const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

const StepDuration = ({ form, set }: Props) => {
  const { lang } = useI18n();

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>
          <Clock className="w-3.5 h-3.5 text-role-service-provider" />
          {lang === "ar" ? "المدة *" : "Duration *"}
        </label>
        <div className="flex gap-2">
          <input type="number" className={`${inputClass} flex-1`} placeholder="3" value={form.duration} onChange={(e) => set("duration", e.target.value)} min="0.5" max="365" />
          <div className="flex gap-1">
            {(["hours", "days"] as const).map((u) => (
              <button
                key={u}
                onClick={() => set("durationUnit", u)}
                className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                  form.durationUnit === u ? "bg-role-service-provider text-white border-role-service-provider" : "bg-card text-foreground border-border"
                }`}
              >
                {u === "hours" ? (lang === "ar" ? "ساعات" : "Hours") : lang === "ar" ? "أيام" : "Days"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            <Users className="w-3.5 h-3.5 text-role-service-provider" />
            {lang === "ar" ? "الحد الأدنى" : "Min Group Size"}
          </label>
          <input type="number" className={inputClass} value={form.groupSizeMin} onChange={(e) => set("groupSizeMin", e.target.value)} min="1" max="100" />
        </div>
        <div>
          <label className={labelClass}>
            <Users className="w-3.5 h-3.5 text-role-service-provider" />
            {lang === "ar" ? "الحد الأقصى" : "Max Group Size"}
          </label>
          <input type="number" className={inputClass} value={form.groupSizeMax} onChange={(e) => set("groupSizeMax", e.target.value)} min="1" max="100" />
        </div>
      </div>
    </div>
  );
};

export default StepDuration;
