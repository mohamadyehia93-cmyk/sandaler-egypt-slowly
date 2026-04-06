import { useI18n } from "@/lib/i18n";
import { Image, Upload, X } from "lucide-react";
import { ExperienceFormData } from "./types";

interface Props {
  form: ExperienceFormData;
  updateForm: (updates: Partial<ExperienceFormData>) => void;
}

const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

const StepPhotos = ({ form, updateForm }: Props) => {
  const { lang } = useI18n();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - form.photos.length;
    const newFiles = files.slice(0, remaining);
    const newUrls = newFiles.map((f) => URL.createObjectURL(f));
    updateForm({
      photos: [...form.photos, ...newFiles],
      photoPreviewUrls: [...form.photoPreviewUrls, ...newUrls],
    });
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(form.photoPreviewUrls[idx]);
    updateForm({
      photos: form.photos.filter((_, i) => i !== idx),
      photoPreviewUrls: form.photoPreviewUrls.filter((_, i) => i !== idx),
    });
  };

  return (
    <div>
      <label className={labelClass}>
        <Image className="w-3.5 h-3.5 text-role-service-provider" />
        {lang === "ar" ? "صور التجربة (حتى ٥)" : "Experience Photos (up to 5)"}
      </label>

      {form.photoPreviewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {form.photoPreviewUrls.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-role-service-provider text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {lang === "ar" ? "غلاف" : "Cover"}
                </span>
              )}
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {form.photos.length < 5 && (
        <label className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 bg-card cursor-pointer hover:border-role-service-provider/40 transition-colors">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {lang === "ar" ? "اضغط لاختيار صور" : "Tap to select photos"}
          </span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        </label>
      )}
    </div>
  );
};

export default StepPhotos;
