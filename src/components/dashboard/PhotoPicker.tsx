import { useRef } from "react";
import { Upload, X } from "lucide-react";

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
  hint?: string;
};

/**
 * A functional photo picker that replaces the decorative upload placeholders
 * used across the dashboard creation forms. Holds File objects in parent state;
 * upload happens on submit via uploadImages().
 */
const PhotoPicker = ({ files, onChange, max = 5, hint }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, max);
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

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
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

      {files.length < max && (
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
