import { useI18n } from "@/lib/i18n";
import { DollarSign, Plus, Trash2, ListChecks } from "lucide-react";
import { ExperienceFormData } from "./types";

interface Props {
  form: ExperienceFormData;
  set: (key: string, value: string) => void;
  updateForm: (updates: Partial<ExperienceFormData>) => void;
}

const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

const StepPricing = ({ form, set, updateForm }: Props) => {
  const { lang } = useI18n();

  const updateListItem = (key: "includes" | "excludes", idx: number, value: string) => {
    const arr = [...form[key]];
    arr[idx] = value;
    updateForm({ [key]: arr });
  };

  const addListItem = (key: "includes" | "excludes") => {
    updateForm({ [key]: [...form[key], ""] });
  };

  const removeListItem = (key: "includes" | "excludes", idx: number) => {
    updateForm({ [key]: form[key].filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>
          <DollarSign className="w-3.5 h-3.5 text-role-service-provider" />
          {lang === "ar" ? "السعر (ج.م) *" : "Price (EGP) *"}
        </label>
        <input type="number" className={inputClass} placeholder="350" value={form.price} onChange={(e) => set("price", e.target.value)} min="0" />
      </div>

      <div>
        <label className={labelClass}>{lang === "ar" ? "نوع التسعير" : "Pricing Type"}</label>
        <div className="flex gap-2">
          {(["per-person", "per-group"] as const).map((t) => (
            <button
              key={t}
              onClick={() => set("priceType", t)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                form.priceType === t ? "bg-role-service-provider text-white border-role-service-provider" : "bg-card text-foreground border-border"
              }`}
            >
              {t === "per-person" ? (lang === "ar" ? "للفرد" : "Per Person") : lang === "ar" ? "للمجموعة" : "Per Group"}
            </button>
          ))}
        </div>
      </div>

      {/* Includes */}
      <div>
        <label className={labelClass}>
          <ListChecks className="w-3.5 h-3.5 text-role-service-provider" />
          {lang === "ar" ? "ما يشمله السعر" : "What's Included"}
        </label>
        <div className="space-y-2">
          {form.includes.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "مثال: غداء تقليدي" : "e.g. Traditional lunch"} value={item} onChange={(e) => updateListItem("includes", i, e.target.value)} maxLength={100} />
              {form.includes.length > 1 && (
                <button onClick={() => removeListItem("includes", i)} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
          <button onClick={() => addListItem("includes")} className="flex items-center gap-1 text-xs font-medium text-role-service-provider">
            <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة" : "Add item"}
          </button>
        </div>
      </div>

      {/* Excludes */}
      <div>
        <label className={labelClass}>
          <ListChecks className="w-3.5 h-3.5 text-muted-foreground" />
          {lang === "ar" ? "غير مشمول" : "What's Not Included"}
        </label>
        <div className="space-y-2">
          {form.excludes.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "مثال: المواصلات" : "e.g. Transportation"} value={item} onChange={(e) => updateListItem("excludes", i, e.target.value)} maxLength={100} />
              {form.excludes.length > 1 && (
                <button onClick={() => removeListItem("excludes", i)} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>
              )}
            </div>
          ))}
          <button onClick={() => addListItem("excludes")} className="flex items-center gap-1 text-xs font-medium text-role-service-provider">
            <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة" : "Add item"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepPricing;
