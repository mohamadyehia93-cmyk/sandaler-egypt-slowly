import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Image, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImages } from "@/lib/dashboardForms";
import { ExperienceFormData } from "./types";

interface Props {
  form: ExperienceFormData;
  updateForm: (updates: Partial<ExperienceFormData>) => void;
  /** Needed because storage paths are scoped under the owner's user id. */
  userId: string | null;
}

const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

/**
 * Photos are uploaded to storage AS THEY ARE CHOSEN, not held as File objects
 * until publish. Files cannot be saved in a resumable draft, so a mid-wizard
 * interruption used to cost the provider their photos — and the mobile data
 * spent on them. Storing the public URL means the draft survives a reload.
 */
const StepPhotos = ({ form, updateForm, userId }: Props) => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [busy, setBusy] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    if (!userId) {
      toast.error(ar ? "يرجى تسجيل الدخول لرفع الصور" : "Please sign in to upload photos");
      return;
    }
    const remaining = 5 - form.photoPreviewUrls.length;
    const newFiles = files.slice(0, Math.max(0, remaining));
    if (!newFiles.length) return;
    setBusy(true);
    try {
      const urls = await uploadImages(newFiles, userId);
      updateForm({ photoPreviewUrls: [...form.photoPreviewUrls, ...urls] });
    } catch {
      toast.error(ar ? "تعذّر رفع الصورة. حاول مرة أخرى." : "Could not upload the photo. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = (idx: number) => {
    updateForm({ photoPreviewUrls: form.photoPreviewUrls.filter((_, i) => i !== idx) });
  };

  return (
    <div>
      <label className={labelClass}>
        <Image className="w-3.5 h-3.5 text-role-service-provider" />
        {ar ? "صور التجربة (حتى ٥)" : "Experience Photos (up to 5)"}
      </label>

      {form.photoPreviewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {form.photoPreviewUrls.map((url, i) => (
            <div key={url + i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-role-service-provider text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {ar ? "غلاف" : "Cover"}
                </span>
              )}
              <button
                onClick={() => removePhoto(i)}
                aria-label={ar ? "إزالة الصورة" : "Remove photo"}
                className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {form.photoPreviewUrls.length < 5 && (
        <label className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 bg-card cursor-pointer hover:border-role-service-provider/40 transition-colors">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {busy
              ? ar ? "جاري الرفع..." : "Uploading..."
              : ar ? "اضغط لاختيار صور" : "Tap to select photos"}
          </span>
          <input type="file" accept="image/*" multiple className="hidden" disabled={busy} onChange={handleFileSelect} />
        </label>
      )}
      <p className="text-[11px] text-muted-foreground mt-2">
        {ar
          ? "تُحفظ الصور فورًا، فلن تفقدها إذا انقطع العمل."
          : "Photos are saved as soon as you add them, so an interruption won't lose them."}
      </p>
    </div>
  );
};

export default StepPhotos;
