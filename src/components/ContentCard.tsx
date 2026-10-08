import type React from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { contentTypeLabel, type ContentType } from "@/lib/contentTypes";
import type { WishlistItemType } from "@/hooks/useWishlist";
import { useCardSize } from "./cardSize";
import PriceBadge from "./PriceBadge";
import WishlistButton from "./WishlistButton";

export type ContentCardProps = {
  /** What the item is — drives the quiet label above the title. */
  type: ContentType;
  title: string;
  image?: string | null;
  /** Route to open when the card is tapped. */
  href: string;
  /** Price in EGP. 0/null renders the green Free / مجاني badge. */
  price?: number | null;
  /** Hide the price badge for items that are not purchasable (stories, causes). */
  showPrice?: boolean;
  /** Optional save-to-wishlist overlay. */
  wishlist?: { itemType: WishlistItemType; itemId?: string | null; variant?: "heart" | "bookmark" };
  /** Small line under the title, e.g. a date. Use sparingly. */
  note?: string;
  /** Optional one-line description under the title, clamped to 2 lines. */
  subtitle?: string | null;
  className?: string;
  /** Optional corner badge on the image (e.g. a mini poster date). */
  badge?: React.ReactNode;
};

/**
 * THE card of the app. One template for every content type: 3:2 landscape
 * image, gradient scrim, quiet type label, bold title, free/paid badge.
 * Nothing else goes on the card face.
 */
const ContentCard = ({
  type,
  title,
  image,
  href,
  price,
  showPrice = true,
  wishlist,
  note,
  subtitle,
  className = "",
  badge,
}: ContentCardProps) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const lg = useCardSize() === "lg";

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={title}
      onClick={() => navigate(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(href);
        }
      }}
      className={`group relative w-full cursor-pointer focus-ring rounded-xl transition-transform active:scale-[0.99] ${className}`}
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl bg-muted">
        {image ? (
          <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/40 to-accent/40" />
        )}
        {showPrice && <PriceBadge price={price} variant="overlay" className="absolute top-3 start-3" />}
        {wishlist && (
          <WishlistButton
            itemType={wishlist.itemType}
            itemId={wishlist.itemId}
            variant={wishlist.variant}
            className="absolute top-1.5 end-1.5 tap-target rounded-full bg-background/80 backdrop-blur-sm"
          />
        )}
        {badge && <span className="absolute bottom-2 start-2">{badge}</span>}
      </div>
      <div className="pt-2.5">
        <span className={`block text-[11px] font-semibold text-primary-dark ${lang === "ar" ? "" : "uppercase tracking-[0.14em]"}`}>
          {contentTypeLabel(type, lang)}
        </span>
        <h3 className={`listing-h2 ${lang === "ar" ? "lang-ar" : "lang-en"} mt-0.5 line-clamp-2 text-foreground ${lg ? "!text-lg" : "!text-base"}`}>
          {title}
        </h3>
        {subtitle && <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">{subtitle}</p>}
        {note && <p className="mt-0.5 text-[13px] text-muted-foreground">{note}</p>}
      </div>
    </article>
  );
};

export default ContentCard;
