import { useI18n } from "@/lib/i18n";
import { ExperienceFormData } from "./types";
import { Check, X } from "lucide-react";

interface Props {
  form: ExperienceFormData;
}

const StepReview = ({ form }: Props) => {
  const { lang } = useI18n();

  const sections = [
    { label: lang === "ar" ? "العنوان (EN)" : "Title (EN)", value: form.title_en, required: true },
    { label: lang === "ar" ? "العنوان (AR)" : "Title (AR)", value: form.title_ar, required: true },
    { label: lang === "ar" ? "الوصف" : "Description", value: form.description_en ? `${form.description_en.slice(0, 80)}...` : "", required: true },
    { label: lang === "ar" ? "الفئة" : "Category", value: form.category, required: true },
    { label: lang === "ar" ? "الصور" : "Photos", value: form.photos.length > 0 ? `${form.photos.length} photo(s)` : "", required: false },
    { label: lang === "ar" ? "السعر" : "Price", value: form.price ? `${form.price} EGP ${form.priceType}` : "", required: true },
    { label: lang === "ar" ? "المدة" : "Duration", value: form.duration ? `${form.duration} ${form.durationUnit}` : "", required: false },
    { label: lang === "ar" ? "حجم المجموعة" : "Group Size", value: `${form.groupSizeMin}–${form.groupSizeMax}`, required: false },
    { label: lang === "ar" ? "الأيام" : "Days", value: form.availableDays.join(", "), required: false },
    { label: lang === "ar" ? "سياسة الإلغاء" : "Cancellation", value: form.cancellationPolicy, required: false },
    { label: lang === "ar" ? "الموقع" : "Location", value: form.location, required: false },
    { label: lang === "ar" ? "نقطة الالتقاء" : "Meeting Point", value: form.meetingPointName, required: false },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground mb-4">
        {lang === "ar" ? "راجع التفاصيل قبل النشر" : "Review your experience details before publishing"}
      </p>

      {form.photoPreviewUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {form.photoPreviewUrls.map((url, i) => (
            <img key={i} src={url} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0 border border-border" />
          ))}
        </div>
      )}

      <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
        {sections.map((s, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-foreground max-w-[180px] truncate">{s.value || "—"}</span>
              {s.value ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : s.required ? (
                <X className="w-3.5 h-3.5 text-destructive" />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepReview;
