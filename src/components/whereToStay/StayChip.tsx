import { STAY_BADGES, type StayBadge } from "@/lib/whereToStay";

/** Comparison chip: stay type, name, "price · area", optional badge. */
const StayChip = ({ s, ar, href, onClick }: { s: any; ar: boolean; href?: string; onClick?: () => void }) => {
  const b = s.badge ? STAY_BADGES[s.badge as StayBadge] : null;
  const type = ((ar ? s.stay_type_ar || s.stay_type_en : s.stay_type_en) || "").split("·")[0].trim();
  const area = ar ? s.area_ar || s.area_en : s.area_en;
  const meta = [s.price_range, area].filter(Boolean).join(" · ");
  return (
    <a
      href={href || `#${s.slug}`}
      onClick={onClick ? (e) => { e.preventDefault(); onClick(); } : undefined}
      className="flex-shrink-0 w-[200px] rounded-xl border border-border bg-card px-3 py-2.5 text-start hover:border-primary/40 transition-colors focus-ring"
    >
      {type && <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{type}</p>}
      <p className="text-sm font-bold text-foreground line-clamp-1" dir="auto">{s.name}</p>
      {meta && <p className="text-[12px] text-muted-foreground line-clamp-2 leading-snug mt-0.5">{meta}</p>}
      {b && (
        <span className={`inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${b.caution ? "bg-ochre-soft text-ochre" : "bg-primary/10 text-primary-dark"}`}>
          {ar ? b.ar : b.en}
        </span>
      )}
    </a>
  );
};

export default StayChip;
