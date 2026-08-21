import { Clock, Plus, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { WEEK_ORDER, dayName, type AvailabilitySlot } from "@/lib/availability";

type Props = {
  slots: AvailabilitySlot[];
  onChange: (slots: AvailabilitySlot[]) => void;
};

const inputClass =
  "bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

/**
 * Day + from/to hour editor. Stores real data (see src/lib/availability.ts) so
 * the public profile renders the same hours in both languages.
 */
const AvailabilityEditor = ({ slots, onChange }: Props) => {
  const { lang } = useI18n();
  const ar = lang === "ar";

  const update = (i: number, patch: Partial<AvailabilitySlot>) =>
    onChange(slots.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const add = () => onChange([...slots, { day: 6, from: "10:00", to: "12:00" }]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-primary" />
        {ar ? "أوقات اللقاء" : "Best times to meet"}
      </label>

      {slots.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          {ar ? "أضف يوماً وساعات محددة." : "Add a day and specific hours."}
        </p>
      )}

      <div className="space-y-2">
        {slots.map((s, i) => {
          const invalid = s.to <= s.from;
          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2">
                <select
                  className={`${inputClass} flex-1 min-w-0`}
                  value={s.day}
                  onChange={(e) => update(i, { day: Number(e.target.value) })}
                  aria-label={ar ? "اليوم" : "Day"}
                >
                  {WEEK_ORDER.map((d) => (
                    <option key={d} value={d}>
                      {dayName(d, ar)}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  className={`${inputClass} w-[102px]`}
                  value={s.from}
                  onChange={(e) => update(i, { from: e.target.value })}
                  aria-label={ar ? "من" : "From"}
                  dir="ltr"
                />
                <input
                  type="time"
                  className={`${inputClass} w-[102px]`}
                  value={s.to}
                  onChange={(e) => update(i, { to: e.target.value })}
                  aria-label={ar ? "إلى" : "To"}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => onChange(slots.filter((_, idx) => idx !== i))}
                  aria-label={ar ? "إزالة" : "Remove"}
                  className="p-1.5 rounded-lg hover:bg-secondary shrink-0"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              {invalid && (
                <p className="text-[11px] text-destructive">
                  {ar ? "وقت النهاية يجب أن يكون بعد البداية." : "End time must be after the start time."}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="w-4 h-4 me-1" />
        {ar ? "إضافة وقت" : "Add a time"}
      </Button>
    </div>
  );
};

export default AvailabilityEditor;
