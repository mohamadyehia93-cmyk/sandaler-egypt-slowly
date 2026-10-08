import { useMemo, useState, useEffect } from "react";
import { formatClock, fmtNumber, listingLocale } from "./format";

export interface PickerSlot {
  id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  price: number;
  spots_available: number;
}

interface Props {
  slots: PickerSlot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  ar: boolean;
  currency: string;
}

const monthKey = (iso: string) => iso.slice(0, 7);

/** Month tabs → day grid (only slot days tappable) → time rows for the chosen day. */
const MonthDatePicker = ({ slots, selectedId, onSelect, ar, currency }: Props) => {
  const loc = listingLocale(ar);
  const months = useMemo(() => Array.from(new Set(slots.map((s) => monthKey(s.slot_date)))), [slots]);
  const selected = slots.find((s) => s.id === selectedId) ?? null;
  const [month, setMonth] = useState<string>(selected ? monthKey(selected.slot_date) : months[0]);
  const [day, setDay] = useState<string | null>(selected?.slot_date ?? null);

  useEffect(() => {
    if (selected) {
      setMonth(monthKey(selected.slot_date));
      setDay(selected.slot_date);
    }
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const byDay = useMemo(() => {
    const m = new Map<string, PickerSlot[]>();
    slots.forEach((s) => m.set(s.slot_date, [...(m.get(s.slot_date) ?? []), s]));
    return m;
  }, [slots]);

  // Week starts Saturday in Arabic (Egypt), Monday in English (UK).
  const weekStart = ar ? 6 : 1;
  const [y, mo] = (month || "2000-01").split("-").map(Number);
  const first = new Date(y, mo - 1, 1);
  const daysInMonth = new Date(y, mo, 0).getDate();
  const lead = (first.getDay() - weekStart + 7) % 7;
  const weekdayNames = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 7 + ((weekStart + i) % 7)).toLocaleDateString(loc, { weekday: "narrow" })
  );
  const iso = (d: number) => `${month}-${String(d).padStart(2, "0")}`;

  const daySlots = day ? byDay.get(day) ?? [] : [];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3" role="tablist">
        {months.map((m) => {
          const [my, mm] = m.split("-").map(Number);
          const label = new Date(my, mm - 1, 1).toLocaleDateString(loc, { month: "long", year: "numeric" });
          const active = m === month;
          return (
            <button key={m} type="button" role="tab" aria-selected={active} onClick={() => { setMonth(m); setDay(null); }}
              className={`flex-shrink-0 h-10 px-4 rounded-full border text-sm font-semibold ${active ? "bg-foreground text-background border-foreground" : "border-border text-foreground"}`}>
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdayNames.map((w, i) => (
          <span key={i} className="text-xs text-muted-foreground py-1">{w}</span>
        ))}
        {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const has = byDay.has(iso(d));
          const active = day === iso(d);
          return (
            <button key={d} type="button" disabled={!has} onClick={() => setDay(iso(d))}
              aria-pressed={active}
              aria-label={new Date(y, mo - 1, d).toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long" })}
              className={`h-11 rounded-full text-sm ${active ? "bg-primary text-primary-foreground font-bold" : has ? "font-semibold text-foreground bg-accent" : "text-muted-foreground/50"}`}>
              {fmtNumber(d, ar)}
            </button>
          );
        })}
      </div>

      {daySlots.length > 0 && (
        <div className="mt-4 space-y-2">
          {daySlots.map((s) => {
            const active = s.id === selectedId;
            return (
              <button key={s.id} type="button" onClick={() => onSelect(s.id)} aria-pressed={active}
                className={`w-full min-h-[52px] rounded-xl border px-4 py-2.5 flex items-center justify-between gap-3 text-start ${active ? "border-primary bg-accent" : "border-border bg-card"}`}>
                <span className="text-[15px] font-semibold text-foreground">
                  {formatClock(s.start_time, ar)} – {formatClock(s.end_time, ar)}
                </span>
                <span className="text-end">
                  <span className="block text-sm font-semibold text-foreground">{fmtNumber(s.price, ar)} {currency}</span>
                  <span className={`block text-[13px] ${s.spots_available <= 3 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                    {s.spots_available <= 3
                      ? ar ? `متبقي ${fmtNumber(s.spots_available, ar)} فقط` : `only ${s.spots_available} left`
                      : ar ? `${fmtNumber(s.spots_available, ar)} أماكن` : `${s.spots_available} spots`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MonthDatePicker;
