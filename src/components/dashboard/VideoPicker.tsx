import { useRef, useState } from "react";
import { Video, Trash2, Loader2, Upload } from "lucide-react";
import { VIDEO_ACCEPT, MAX_VIDEO_BYTES } from "@/lib/dashboardForms";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

type Props = {
  /** Newly picked file, not yet uploaded. */
  file: File | null;
  onChange: (f: File | null) => void;
  /** Already-uploaded public URL (edit mode). */
  existingUrl?: string | null;
  onRemoveExisting?: () => void;
  /** True while the parent is uploading this file. */
  uploading?: boolean;
};

/**
 * Optional promo-video picker with local preview. Validates format and size
 * before the parent form uploads it.
 */
const VideoPicker = ({ file, onChange, existingUrl, onRemoveExisting, uploading }: Props) => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const pick = (f: File | null) => {
    if (!f) return;
    if (f.size > MAX_VIDEO_BYTES) {
      toast.error(
        ar
          ? `الملف كبير جداً (${(f.size / 1024 / 1024).toFixed(1)} ميجابايت). الحد الأقصى 50 ميجابايت.`
          : `File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Maximum is 50 MB.`
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
    <div className="space-y-2">
      {existingUrl && !file && (
        <div className="rounded-xl border border-border bg-card p-2 space-y-2">
          <video src={existingUrl} controls className="w-full rounded-lg max-h-56 bg-black" />
          {onRemoveExisting && (
            <button
              type="button"
              onClick={onRemoveExisting}
              className="flex items-center gap-1 text-xs font-medium text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" /> {ar ? "إزالة الفيديو" : "Remove video"}
            </button>
          )}
        </div>
      )}

      {file && (
        <div className="rounded-xl border border-border bg-card p-2 space-y-2">
          {previewUrl && <video src={previewUrl} controls className="w-full rounded-lg max-h-56 bg-black" />}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground truncate">
              {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
            </span>
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <button type="button" onClick={clearPicked} className="p-1 text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {!file && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border border-dashed border-border rounded-xl py-4 flex flex-col items-center gap-1 text-muted-foreground"
        >
          <span className="flex items-center gap-2 text-xs font-medium">
            {existingUrl ? <Upload className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            {existingUrl
              ? ar ? "استبدال الفيديو" : "Replace video"
              : ar ? "رفع فيديو ترويجي (اختياري)" : "Upload a promo video (optional)"}
          </span>
          <span className="text-[10px]">{ar ? "MP4 أو WebM · حتى 50 ميجابايت" : "MP4 or WebM · up to 50 MB"}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={VIDEO_ACCEPT}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
      />
    </div>
  );
};

export default VideoPicker;
