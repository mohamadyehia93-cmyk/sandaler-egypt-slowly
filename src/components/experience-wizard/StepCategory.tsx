import { useI18n } from "@/lib/i18n";
import { Tag } from "lucide-react";
import { ExperienceFormData, categories } from "./types";
import CategoryChips from "@/components/CategoryChips";

interface Props {
  form: ExperienceFormData;
  set: (key: string, value: string) => void;
}

const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

const StepCategory = ({ form, set }: Props) => {
  const { lang } = useI18n();

  return (
    <div>
      <label className={labelClass}>
        <Tag className="w-3.5 h-3.5 text-role-service-provider" />
        {lang === "ar" ? "اختر الفئة *" : "Choose a Category *"}
      </label>
      <CategoryChips
        variant="block"
        options={categories.map((c) => ({ value: c.en, label: lang === "ar" ? c.ar : c.en }))}
        value={form.category}
        onChange={(v) => set("category", v)}
        selectedClass="bg-role-service-provider text-white border-role-service-provider"
      />
    </div>
  );
};

export default StepCategory;
