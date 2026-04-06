import { useI18n } from "@/lib/i18n";
import { Tag } from "lucide-react";
import { ExperienceFormData, categories } from "./types";

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
      <div className="grid grid-cols-1 gap-2 mt-3">
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => set("category", cat.en)}
            className={`px-4 py-3 rounded-xl text-sm font-medium border transition-colors text-left ${
              form.category === cat.en
                ? "bg-role-service-provider text-white border-role-service-provider"
                : "bg-card text-foreground border-border hover:border-role-service-provider/40"
            }`}
          >
            {lang === "ar" ? cat.ar : cat.en}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StepCategory;
