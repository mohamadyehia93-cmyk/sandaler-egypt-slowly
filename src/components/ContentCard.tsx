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
  className?: string;
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
  className = "",
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
      className={`group relative w-full overflow-hidden rounded-xl bg-card focus-ring shadow-card cursor-pointer transition-transform active:scale-[0.99] ${className}`}
    >
      <div className="relative aspect-[3/2] w-full bg-secondary">
        {image ? (
          <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          // No cover photo (e.g. a text announcement): a calm brand block, never
          // the stretched placeholder graphic.
          <div className="h-full w-full bg-gradient-to-br from-primary to-primary-dark" />
        )}
        <div className="absolute inset-0 gradient-overlay" />

        {showPrice && (
          <PriceBadge price={price} variant="overlay" className="absolute top-3 start-3" />
        )}

        {wishlist && (
          <WishlistButton
            itemType={wishlist.itemType}
            itemId={wishlist.itemId}
            variant={wishlist.variant}
            className="absolute top-2.5 end-2.5 rounded-full bg-background/70 p-2 backdrop-blur-sm"
          />
        )}

        <div className={`absolute bottom-0 start-0 end-0 ${lg ? "p-5" : "p-4"}`}>
          <span
            className={`block ${lg ? "text-[11px]" : "text-[10px]"} font-semibold text-primary-foreground/80 ${
              lang === "ar" ? "" : "uppercase tracking-[0.14em]"
            }`}
          >
            {contentTypeLabel(type, lang)}
          </span>
          <h3 className={`mt-1 line-clamp-2 font-bold leading-snug text-primary-foreground ${
              lg ? "text-[19px] lg:text-xl" : "text-base"
            }`}>
            {title}
          </h3>
          {note && (
            <span className={`mt-1 block ${lg ? "text-xs" : "text-[11px]"} font-medium text-primary-foreground/85`}>
              {note}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default ContentCard;
