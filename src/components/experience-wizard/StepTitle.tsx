import { useI18n } from "@/lib/i18n";
import { FileText } from "lucide-react";
import { ExperienceFormData } from "./types";

interface Props {
  form: ExperienceFormData;
  set: (key: string, value: string) => void;
}

const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

/**
 * ONE LANGUAGE IS MANDATORY, not both.
 * The author writes in the language the app is currently set to; the other
 * language is explicitly optional so an Arabic-first host is never blocked by
 * an English field.
 */
const StepTitle = ({ form, set }: Props) => {
  const { lang } = useI18n();
  const ar = lang === "ar";

  const arField = (
    <div key="ar">
      <label className={labelClass}>
        <FileText className="w-3.5 h-3.5 text-role-service-provider" />
        {ar ? "العنوان بالعربية *" : `Title (Arabic)${ar ? " *" : " (optional)"}`}
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
  );

  const enField = (
    <div key="en">
      <label className={labelClass}>
        <FileText className="w-3.5 h-3.5 text-role-service-provider" />
        {ar ? "العنوان بالإنجليزية (اختياري)" : "Title (English) *"}
      </label>
      <input
        className={inputClass}
        placeholder="e.g. Bird Watching in Manzala Lake"
        value={form.title_en}
        onChange={(e) => set("title_en", e.target.value)}
        maxLength={100}
      />
    </div>
  );

  return <div className="space-y-5">{ar ? [arField, enField] : [enField, arField]}</div>;
};

export default StepTitle;
