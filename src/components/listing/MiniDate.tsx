import { fmtNumber, listingLocale } from "./format";

/** Compact poster-style date (month over day) for card corners. */
const MiniDate = ({ d, ar }: { d: Date; ar: boolean }) => (
  <span className="flex flex-col items-center rounded-lg bg-background/95 px-2.5 py-1 shadow-card text-center">
    <span className="text-[11px] font-semibold uppercase text-primary-dark leading-tight">{d.toLocaleDateString(listingLocale(ar), { month: "short" })}</span>
    <span className="text-lg font-bold leading-none text-foreground">{fmtNumber(d.getDate(), ar)}</span>
  </span>
);

export default MiniDate;
