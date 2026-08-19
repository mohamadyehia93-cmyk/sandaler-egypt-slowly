import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export interface CategoryOption {
  /** The value stored in the database. */
  value: string;
  /** Display label (already localised by the caller). */
  label: string;
}

interface Props {
  options: CategoryOption[];
  /** Current stored value — either one of the options or free text. */
  value: string;
  onChange: (value: string) => void;
  /** Tailwind classes applied to the selected chip. */
  selectedClass?: string;
  /** "chip" (pills, default) or "block" (full-width stacked buttons). */
  variant?: "chip" | "block";
}

/**
 * Category / theme selector with a permanent "Other (specify)" escape hatch.
 * When "Other" is active the typed text IS the stored value — no placeholder
 * sentinel is ever written to the database.
 */
const CategoryChips = ({
  options,
  value,
  onChange,
  selectedClass = "bg-primary text-primary-foreground border-primary",
  variant = "chip",
}: Props) => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const isKnown = options.some((o) => o.value === value);
  const [otherOpen, setOtherOpen] = useState(!!value && !isKnown);
  /**
   * The "Other" input owns its own text. It must NOT derive from `isKnown`,
   * otherwise typing a string that happens to equal a known option value would
   * wipe the field mid-typing.
   */
  const [otherText, setOtherText] = useState(isKnown ? "" : value || "");

  const base =
    variant === "block"
      ? "px-4 py-3 rounded-xl text-sm font-medium border transition-colors text-left w-full"
      : "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors";
  const idle = "bg-card text-foreground border-border";

  const pick = (v: string) => {
    setOtherOpen(false);
    onChange(v);
  };

  const openOther = () => {
    setOtherOpen(true);
    // Restore whatever was typed before (may be empty); never write a sentinel.
    onChange(otherText);
  };

  return (
    <div>
      <div className={variant === "block" ? "grid grid-cols-1 gap-2 mt-3" : "flex flex-wrap gap-2"}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => pick(o.value)}
            className={`${base} ${!otherOpen && value === o.value ? selectedClass : idle}`}
          >
            {o.label}
          </button>
        ))}
        <button
          type="button"
          onClick={openOther}
          className={`${base} ${otherOpen ? selectedClass : idle}`}
        >
          {ar ? "أخرى (حدّد)" : "Other (specify)"}
        </button>
      </div>

      {otherOpen && (
        <input
          autoFocus
          type="text"
          value={otherText}
          onChange={(e) => {
            setOtherText(e.target.value);
            onChange(e.target.value);
          }}
          maxLength={60}
          dir={ar ? "rtl" : "ltr"}
          placeholder={ar ? "اكتب الفئة…" : "Type the category…"}
          className="mt-2 w-full px-3 py-2 rounded-xl bg-muted/40 border border-border text-sm text-foreground focus:outline-none focus:border-primary"
        />
      )}
    </div>
  );
};

export default CategoryChips;
