import { useI18n } from "@/lib/i18n";
import { Shield, Plus, Trash2 } from "lucide-react";
import { ExperienceFormData } from "./types";

interface Props {
  form: ExperienceFormData;
  set: (key: string, value: string) => void;
  updateForm: (updates: Partial<ExperienceFormData>) => void;
}

const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

const cancellationOptions = [
  { value: "flexible", en: "Flexible — Free cancellation 24h before", ar: "مرن — إلغاء مجاني قبل ٢٤ ساعة" },
  { value: "moderate", en: "Moderate — Free cancellation 3 days before", ar: "معتدل — إلغاء مجاني قبل ٣ أيام" },
  { value: "strict", en: "Strict — No refunds", ar: "صارم — لا استرداد" },
];

const fitnessOptions = [
  { value: "easy", en: "Easy — Suitable for everyone", ar: "سهل — مناسب للجميع" },
  { value: "moderate", en: "Moderate — Some walking", ar: "معتدل — مشي بسيط" },
  { value: "challenging", en: "Challenging — Good fitness required", ar: "صعب — يتطلب لياقة" },
];

const StepPolicies = ({ form, set, updateForm }: Props) => {
  const { lang } = useI18n();

  const updateWhatToBring = (idx: number, value: string) => {
    const arr = [...form.whatToBring];
    arr[idx] = value;
    updateForm({ whatToBring: arr });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>
          <Shield className="w-3.5 h-3.5 text-role-service-provider" />
          {lang === "ar" ? "سياسة الإلغاء" : "Cancellation Policy"}
        </label>
        <div className="space-y-2">
          {cancellationOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => set("cancellationPolicy", opt.value)}
              className={`w-full px-4 py-3 rounded-xl text-xs font-medium border text-left transition-colors ${
                form.cancellationPolicy === opt.value
                  ? "bg-role-service-provider text-white border-role-service-provider"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {lang === "ar" ? opt.ar : opt.en}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>{lang === "ar" ? "قيود العمر" : "Age Restriction"}</label>
        <div className="flex gap-2">
          {[
            { value: "none", en: "All ages", ar: "كل الأعمار" },
            { value: "12+", en: "12+", ar: "+١٢" },
            { value: "18+", en: "18+", ar: "+١٨" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => set("ageRestriction", opt.value)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                form.ageRestriction === opt.value
                  ? "bg-role-service-provider text-white border-role-service-provider"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {lang === "ar" ? opt.ar : opt.en}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>{lang === "ar" ? "مستوى اللياقة" : "Fitness Level"}</label>
        <div className="space-y-2">
          {fitnessOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => set("fitnessLevel", opt.value)}
              className={`w-full px-4 py-3 rounded-xl text-xs font-medium border text-left transition-colors ${
                form.fitnessLevel === opt.value
                  ? "bg-role-service-provider text-white border-role-service-provider"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {lang === "ar" ? opt.ar : opt.en}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>{lang === "ar" ? "ماذا يحضر الضيف" : "What to Bring"}</label>
        <div className="space-y-2">
          {form.whatToBring.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "مثال: واقي شمس" : "e.g. Sunscreen"} value={item} onChange={(e) => updateWhatToBring(i, e.target.value)} maxLength={100} />
              {form.whatToBring.length > 1 && (
                <button onClick={() => updateForm({ whatToBring: form.whatToBring.filter((_, j) => j !== i) })} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
          <button onClick={() => updateForm({ whatToBring: [...form.whatToBring, ""] })} className="flex items-center gap-1 text-xs font-medium text-role-service-provider">
            <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة" : "Add item"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepPolicies;
