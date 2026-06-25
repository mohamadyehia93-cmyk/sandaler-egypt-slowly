import { useRef } from "react";
import { Upload, X } from "lucide-react";

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
  hint?: string;
  /** Previously uploaded image URLs (edit mode). */
  existing?: string[];
  /** Remove a previously uploaded image by URL (edit mode). */
  onRemoveExisting?: (url: string) => void;
};

/**
 * A functional photo picker that replaces the decorative upload placeholders
 * used across the dashboard creation forms. Holds File objects in parent state;
 * upload happens on submit via uploadImages(). In edit mode it can also show
 * already-uploaded images (URLs) and let the user remove them.
 */
const PhotoPicker = ({ files, onChange, max = 5, hint, existing = [], onRemoveExisting }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const total = existing.length + files.length;

  const add = (list: FileList | null) => {
    if (!list) return;
    const room = Math.max(0, max - total);
    const next = [...files, ...Array.from(list).slice(0, room)];
    onChange(next);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={max > 1}
        className="hidden"
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />

      {(existing.length > 0 || files.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-2">
          {existing.map((url) => (
            <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
              <img src={url} alt="" className="w-full h-full object-cover" />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute top-0.5 right-0.5 bg-foreground/60 rounded-full p-0.5"
                  aria-label="Remove"
                >
                  <X className="w-3 h-3 text-background" />
                </button>
              )}
            </div>
          ))}
          {files.map((f, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
              <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 bg-foreground/60 rounded-full p-0.5"
                aria-label="Remove"
              >
                <X className="w-3 h-3 text-background" />
              </button>
            </div>
          ))}
        </div>
      )}

      {total < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 bg-card hover:border-primary/40 transition-colors"
        >
          <Upload className="w-7 h-7 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{hint || "Tap to upload"}</span>
        </button>
      )}
    </div>
  );
};

export default PhotoPicker;
