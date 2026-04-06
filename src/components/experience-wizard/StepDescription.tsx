import { useI18n } from "@/lib/i18n";
import { FileText } from "lucide-react";
import { ExperienceFormData } from "./types";

interface Props {
  form: ExperienceFormData;
  set: (key: string, value: string) => void;
}

const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

const StepDescription = ({ form, set }: Props) => {
  const { lang } = useI18n();

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>
          <FileText className="w-3.5 h-3.5 text-role-service-provider" />
          {lang === "ar" ? "الوصف بالإنجليزية *" : "Description (English) *"}
        </label>
        <textarea
          className={`${inputClass} min-h-[120px] resize-none`}
          placeholder="Describe your experience in detail..."
          value={form.description_en}
          onChange={(e) => set("description_en", e.target.value)}
          maxLength={1000}
        />
        <span className="text-[10px] text-muted-foreground mt-1 block text-right">{form.description_en.length}/1000</span>
      </div>
      <div>
        <label className={labelClass}>
          <FileText className="w-3.5 h-3.5 text-role-service-provider" />
          {lang === "ar" ? "الوصف بالعربية" : "Description (Arabic)"}
        </label>
        <textarea
          className={`${inputClass} min-h-[120px] resize-none`}
          dir="rtl"
          placeholder="اوصف تجربتك بالتفصيل..."
          value={form.description_ar}
          onChange={(e) => set("description_ar", e.target.value)}
          maxLength={1000}
        />
        <span className="text-[10px] text-muted-foreground mt-1 block text-right">{form.description_ar.length}/1000</span>
      </div>
    </div>
  );
};

export default StepDescription;
