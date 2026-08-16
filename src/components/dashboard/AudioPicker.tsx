import { useRef, useState } from "react";
import { Mic, Trash2, Loader2, CheckCircle2, Upload } from "lucide-react";
import { AUDIO_ACCEPT, MAX_AUDIO_BYTES } from "@/lib/dashboardForms";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

type Props = {
  /** Newly picked file, not yet uploaded. */
  file: File | null;
  onChange: (f: File | null) => void;
  /** Already-uploaded public URL (edit mode). */
  existingUrl?: string | null;
  onRemoveExisting?: () => void;
  label?: string;
  compact?: boolean;
  /** True while the parent is uploading this file. */
  uploading?: boolean;
};

/**
 * Narration file picker with local preview. Validates format and size before the
 * parent form uploads it to the `audio-files` bucket.
 */
const AudioPicker = ({
  file,
  onChange,
  existingUrl,
  onRemoveExisting,
  label,
  compact,
  uploading,
}: Props) => {
  const { lang } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const pick = (f: File | null) => {
    if (!f) return;
    if (f.size > MAX_AUDIO_BYTES) {
      toast.error(
        lang === "ar"
          ? `الملف كبير جداً (${(f.size / 1024 / 1024).toFixed(1)} ميجابايت). الحد الأقصى 25 ميجابايت.`
          : `File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Maximum is 25 MB.`
      );
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
    onChange(f);
  };

  const clearPicked = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {label && (
        <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-role-culture-actor" />
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={AUDIO_ACCEPT}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
      />

      {file ? (
        <div className="bg-card border border-border rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            {uploading ? (
              <Loader2 className="w-4 h-4 text-role-culture-actor animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            )}
            <p className="text-[11px] font-semibold text-foreground truncate flex-1">{file.name}</p>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </span>
            {!uploading && (
              <button type="button" onClick={clearPicked} className="text-destructive p-1 shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            {uploading
              ? lang === "ar"
                ? "جارٍ رفع الملف الصوتي..."
                : "Uploading audio..."
              : lang === "ar"
              ? "سيتم الرفع عند الحفظ"
              : "Will upload when you save"}
          </p>
          {previewUrl && <audio controls src={previewUrl} className="w-full h-8" />}
        </div>
      ) : existingUrl ? (
        <div className="bg-card border border-border rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <p className="text-[11px] font-semibold text-foreground flex-1">
              {lang === "ar" ? "ملف صوتي مرفوع" : "Audio uploaded"}
            </p>
            <button type="button" onClick={() => inputRef.current?.click()} className="text-[10px] font-semibold text-role-culture-actor">
              {lang === "ar" ? "استبدال" : "Replace"}
            </button>
            {onRemoveExisting && (
              <button type="button" onClick={onRemoveExisting} className="text-destructive p-1 shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <audio controls src={existingUrl} className="w-full h-8" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 text-muted-foreground ${
            compact ? "py-3" : "py-6"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span className="text-[11px] font-medium">
            {lang === "ar" ? "اضغط لرفع ملف صوتي" : "Tap to upload an audio file"}
          </span>
          <span className="text-[9px]">
            {lang === "ar" ? "MP3 / M4A / WAV / OGG · حتى 25 ميجابايت" : "MP3 / M4A / WAV / OGG · up to 25 MB"}
          </span>
        </button>
      )}
    </div>
  );
};

export default AudioPicker;
