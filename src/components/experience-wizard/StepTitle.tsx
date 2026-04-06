import { useI18n } from "@/lib/i18n";
import { FileText } from "lucide-react";
import { ExperienceFormData } from "./types";

interface Props {
  form: ExperienceFormData;
  set: (key: string, value: string) => void;
}

const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

const StepTitle = ({ form, set }: Props) => {
  const { lang } = useI18n();

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>
          <FileText className="w-3.5 h-3.5 text-role-service-provider" />
          {lang === "ar" ? "العنوان بالإنجليزية *" : "Title (English) *"}
        </label>
        <input
          className={inputClass}
          placeholder="e.g. Bird Watching in Manzala Lake"
          value={form.title_en}
          onChange={(e) => set("title_en", e.target.value)}
          maxLength={100}
        />
      </div>
      <div>
        <label className={labelClass}>
          <FileText className="w-3.5 h-3.5 text-role-service-provider" />
          {lang === "ar" ? "العنوان بالعربية *" : "Title (Arabic) *"}
        </label>
        <input
          className={inputClass}
          dir="rtl"
          placeholder="مثال: مراقبة الطيور في بحيرة المنزلة"
          value={form.title_ar}
          onChange={(e) => set("title_ar", e.target.value)}
          maxLength={100}
        />
      </div>
    </div>
  );
};

export default StepTitle;
