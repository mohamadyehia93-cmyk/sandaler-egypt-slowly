import { Clock, MapPin, Timer, Users, Calendar } from "lucide-react";
import { fmtNumber, listingLocale } from "./format";

const DAY = 86400000;

/** "Ended" / "Today" / "Tomorrow" / "In N days" for a local start date. */
export const countdownLabel = (start: Date, past: boolean, ar: boolean) => {
  if (past) return ar ? "انتهت" : "Ended";
  const today = new Date(new Date().toDateString()).getTime();
  const days = Math.round((start.getTime() - today) / DAY);
  if (days <= 0) return ar ? "اليوم" : "Today";
  if (days === 1) return ar ? "غدًا" : "Tomorrow";
  return ar ? `بعد ${fmtNumber(days, ar)} أيام` : `In ${days} days`;
};

/** Parses "2026-11-14", "June 8–9, 2026" or "Jan 10, 2025" into local dates; null if unparseable. */
export const parseLooseDateRange = (raw?: string | null): { start: Date; end: Date | null } | null => {
  const s = (raw || "").trim();
  if (!s) return null;
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return { start: new Date(iso[1] + "T00:00:00"), end: null };
  const m = s.match(/^([A-Za-z]+)\.?\s+(\d{1,2})(?:\s*[–-]\s*(\d{1,2}))?,?\s+(\d{4})$/);
  if (!m) return null;
  const start = new Date(`${m[1]} ${m[2]}, ${m[4]}`);
  if (Number.isNaN(start.getTime())) return null;
  const end = m[3] ? new Date(start.getFullYear(), start.getMonth(), Number(m[3])) : null;
  return { start, end };
};

interface Props {
  start: Date;
  end?: Date | null;
  ar: boolean;
  time?: string | null;
  where?: string | null;
  countdown?: string;
  past?: boolean;
  spotsLeft?: number | null;
  className?: string;
}

/** Poster-style date card: big day number, month and weekday, with time / place / countdown. */
const PosterDate = ({ start, end, ar, time, where, countdown, past, spotsLeft, className = "" }: Props) => {
  const loc = listingLocale(ar);
  const multi = !!end && end.toDateString() !== start.toDateString();
  const sameMonth = multi && end!.getMonth() === start.getMonth();
  const dayNum = multi && sameMonth
    ? `${fmtNumber(start.getDate(), ar)}–${fmtNumber(end!.getDate(), ar)}`
    : start.toLocaleDateString(loc, { day: "numeric" });
  const month = multi && !sameMonth
    ? `${start.toLocaleDateString(loc, { month: "short" })} – ${end!.toLocaleDateString(loc, { day: "numeric", month: "short" })}`
    : start.toLocaleDateString(loc, { month: "short" });
  const weekday = start.toLocaleDateString(loc, { weekday: "long" });

  return (
    <div className={`rounded-2xl border border-border bg-card shadow-card p-4 flex gap-4 items-center ${className}`}>
      <div className="flex flex-col items-center justify-center text-center min-w-[76px] pe-4 border-e border-border">
        <span className="text-[13px] font-semibold uppercase tracking-wide text-primary-dark">{month}</span>
        <span className="text-3xl font-bold leading-none text-foreground mt-0.5">{dayNum}</span>
        <span className="text-[13px] text-muted-foreground mt-1">{weekday}</span>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        {time !== undefined && (
          <p className="flex items-center gap-1.5 text-[15px] text-foreground">
            <Clock className="w-4 h-4 text-primary-dark flex-shrink-0" /> {time || (ar ? "الموعد سيُعلن لاحقًا" : "Time to be announced")}
          </p>
        )}
        {where && <p className="flex items-center gap-1.5 text-[15px] text-foreground"><MapPin className="w-4 h-4 text-primary-dark flex-shrink-0" /> <span className="truncate">{where}</span></p>}
        {spotsLeft != null && (
          <p className={`flex items-center gap-1.5 text-[15px] ${spotsLeft <= 3 ? "text-destructive font-semibold" : "text-foreground"}`}>
            <Users className="w-4 h-4 flex-shrink-0" /> {ar ? `${fmtNumber(spotsLeft, ar)} أماكن متبقية` : `${spotsLeft} spots left`}
          </p>
        )}
        {countdown && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${past ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary-dark"}`}>
            <Timer className="w-3.5 h-3.5" /> {countdown}
          </span>
        )}
      </div>
    </div>
  );
};

/** Fallback when a stored date can't be parsed: show the text as written. */
export const PosterDateText = ({ text, className = "" }: { text: string; className?: string }) => (
  <div className={`rounded-2xl border border-border bg-card shadow-card p-4 flex gap-3 items-center ${className}`}>
    <Calendar className="w-6 h-6 text-primary-dark flex-shrink-0" />
    <p className="text-[15px] font-semibold text-foreground">{text}</p>
  </div>
);

export default PosterDate;
