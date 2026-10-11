import { BADGES, shortMode, type Badge } from "@/lib/gettingAround";

/** Comparison chip: mode, operator, "price · duration · frequency", optional badge. */
const ServiceChip = ({ s, ar, href, onClick }: { s: any; ar: boolean; href?: string; onClick?: () => void }) => {
  const b = s.badge ? BADGES[s.badge as Badge] : null;
  const meta = [s.price_range, s.duration_text, s.frequency].filter(Boolean).join(" · ");
  return (
    <a
      href={href || `#${s.slug}`}
      onClick={onClick ? (e) => { e.preventDefault(); onClick(); } : undefined}
      className="flex-shrink-0 w-[200px] rounded-xl border border-border bg-card px-3 py-2.5 text-start hover:border-primary/40 transition-colors focus-ring"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{shortMode(ar ? s.mode_label_ar || s.mode_label_en : s.mode_label_en)}</p>
      <p className="text-sm font-bold text-foreground line-clamp-1">{s.operator || (ar ? s.route_title_ar : s.route_title_en)}</p>
      {meta && <p className="text-[12px] text-muted-foreground line-clamp-2 leading-snug mt-0.5" dir="ltr">{meta}</p>}
      {b && (
        <span className={`inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${b.caution ? "bg-ochre-soft text-ochre" : "bg-primary/10 text-primary-dark"}`}>
          {ar ? b.ar : b.en}
        </span>
      )}
    </a>
  );
};

export default ServiceChip;
