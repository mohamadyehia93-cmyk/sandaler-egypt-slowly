import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fmtNumber, listingLocale } from "./format";

interface Props {
  checkIn: string | null;
  checkOut: string | null;
  onChange: (checkIn: string | null, checkOut: string | null) => void;
  ar: boolean;
  /** Only pass when availability is actually stored; otherwise every future day is open. */
  isUnavailable?: (iso: string) => boolean;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Check-in / check-out range in the same visual style as MonthDatePicker. */
const RangeDatePicker = ({ checkIn, checkOut, onChange, ar, isUnavailable }: Props) => {
  const loc = listingLocale(ar);
  const today = iso(new Date());
  const [cursor, setCursor] = useState(() => {
    const d = checkIn ? new Date(checkIn + "T00:00:00") : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const weekStart = ar ? 6 : 1;
  const y = cursor.getFullYear(), mo = cursor.getMonth();
  const daysInMonth = new Date(y, mo + 1, 0).getDate();
  const lead = (cursor.getDay() - weekStart + 7) % 7;
  const weekdayNames = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 7 + ((weekStart + i) % 7)).toLocaleDateString(loc, { weekday: "narrow" }));
  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const canPrev = cursor > thisMonth;

  const pick = (d: string) => {
    if (!checkIn || (checkIn && checkOut) || d <= checkIn) onChange(d, null);
    else onChange(checkIn, d);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button type="button" disabled={!canPrev} onClick={() => setCursor(new Date(y, mo - 1, 1))} aria-label={ar ? "الشهر السابق" : "Previous month"}
          className="tap-target rounded-full border border-border disabled:opacity-40">
          {ar ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <p className="text-[15px] font-semibold text-foreground">{cursor.toLocaleDateString(loc, { month: "long", year: "numeric" })}</p>
        <button type="button" onClick={() => setCursor(new Date(y, mo + 1, 1))} aria-label={ar ? "الشهر التالي" : "Next month"}
          className="tap-target rounded-full border border-border">
          {ar ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdayNames.map((w, i) => <span key={i} className="text-[13px] text-muted-foreground py-1">{w}</span>)}
        {Array.from({ length: lead }).map((_, i) => <span key={`l${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = iso(new Date(y, mo, i + 1));
          const disabled = d < today || !!isUnavailable?.(d);
          const isEnd = d === checkIn || d === checkOut;
          const inRange = !!checkIn && !!checkOut && d > checkIn && d < checkOut;
          return (
            <button key={d} type="button" disabled={disabled} onClick={() => pick(d)} aria-pressed={isEnd}
              className={`h-11 rounded-lg text-[15px] ${disabled ? "text-muted-foreground/50" : "text-foreground"} ${isEnd ? "bg-primary text-primary-foreground font-bold" : inRange ? "bg-primary/15" : disabled ? "" : "hover:bg-muted"}`}>
              {fmtNumber(i + 1, ar)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RangeDatePicker;
