import { useI18n } from "@/lib/i18n";
import { Check } from "lucide-react";

const steps = [
  { en: "Title", ar: "العنوان" },
  { en: "Description", ar: "الوصف" },
  { en: "Category", ar: "الفئة" },
  { en: "Photos", ar: "الصور" },
  { en: "Pricing", ar: "التسعير" },
  { en: "Duration", ar: "المدة" },
  { en: "Availability", ar: "التوفر" },
  { en: "Policies", ar: "السياسات" },
  { en: "Location", ar: "الموقع" },
  { en: "Review", ar: "مراجعة" },
];

interface WizardProgressProps {
  currentStep: number;
}

const WizardProgress = ({ currentStep }: WizardProgressProps) => {
  const { lang } = useI18n();

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground">
          {lang === "ar" ? `الخطوة ${currentStep + 1} من ${steps.length}` : `Step ${currentStep + 1} of ${steps.length}`}
        </span>
        <span className="text-xs font-semibold text-foreground">
          {lang === "ar" ? steps[currentStep].ar : steps[currentStep].en}
        </span>
      </div>
      <div className="flex gap-1">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < currentStep
                ? "bg-role-service-provider"
                : i === currentStep
                ? "bg-role-service-provider/60"
                : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default WizardProgress;
export { steps };
