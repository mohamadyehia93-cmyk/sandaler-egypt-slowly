import { useI18n } from "@/lib/i18n";

type PriceBadgeProps = {
  /** Price in EGP. 0 (or null) renders as Free / مجاني. */
  price?: number | null;
  /** e.g. "/night" suffix key already translated by the caller. */
  suffix?: string;
  /** "overlay" renders a pill for use on top of an image. */
  variant?: "inline" | "overlay";
  className?: string;
};

/**
 * Single source of truth for showing whether something is free or paid, so the
 * user knows the cost BEFORE tapping into a listing.
 */
const PriceBadge = ({ price, suffix, variant = "inline", className = "" }: PriceBadgeProps) => {
  const { lang, t } = useI18n();
  const isFree = price === 0 || price === null || price === undefined;
  const label = isFree
    ? lang === "ar"
      ? "مجاني"
      : t("common.free")
    : `${price} ${t("common.egp")}`;

  if (variant === "overlay") {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm ${
          isFree ? "bg-success/90 text-primary-foreground" : "bg-background/90 text-primary-dark"
        } ${className}`}
      >
        {label}
      </span>
    );
  }

  return (
    <span className={`text-sm font-bold text-primary-dark ${className}`}>
      {label}
      {!isFree && suffix && (
        <span className="text-xs font-normal text-muted-foreground">{suffix}</span>
      )}
    </span>
  );
};

export default PriceBadge;
