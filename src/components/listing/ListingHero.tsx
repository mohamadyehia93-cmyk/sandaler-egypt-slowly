import { useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import WishlistButton from "@/components/WishlistButton";
import type { WishlistItemType } from "@/hooks/useWishlist";
import { fmtNumber } from "./format";

interface Props {
  images: string[];
  title: string;
  eyebrow?: string;
  ar: boolean;
  onBack: () => void;
  wishlistType?: WishlistItemType;
  wishlistId?: string | null;
}

const roundBtn = "tap-target rounded-full bg-background/80 backdrop-blur-sm text-foreground";

/** Full-bleed gallery of the row's REAL images only — never duplicates a file to fake a gallery. */
const ListingHero = ({ images, title, eyebrow, ar, onBack, wishlistType, wishlistId }: Props) => {
  const photos = Array.from(new Set(images.filter(Boolean)));
  const scroller = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    setIdx(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  };
  const go = (step: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: step * el.clientWidth * (ar ? -1 : 1), behavior: "smooth" });
  };

  return (
    <div className="relative h-[56vh] max-h-[460px] lg:h-[30rem] lg:max-h-none bg-muted overflow-hidden">
      {photos.length > 0 ? (
        <div
          ref={scroller}
          onScroll={onScroll}
          className="flex h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar"
          aria-roledescription="carousel"
        >
          {photos.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={photos.length > 1 ? `${title} (${i + 1}/${photos.length})` : title}
              loading={i === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover flex-shrink-0 snap-center"
            />
          ))}
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/25 to-transparent" />

      {/* floating controls */}
      <div className="absolute top-3 inset-x-3 flex justify-between pt-[env(safe-area-inset-top,0px)]">
        <button type="button" onClick={onBack} aria-label={ar ? "رجوع" : "Back"} className={roundBtn}>
          <ArrowLeft className={`w-5 h-5 ${ar ? "rotate-180" : ""}`} />
        </button>
        <div className="flex gap-2">
          <ShareButton title={title} className={roundBtn} />
          {wishlistType && <WishlistButton itemType={wishlistType} itemId={wishlistId} className={roundBtn} />}
        </div>
      </div>

      {photos.length > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label={ar ? "الصورة السابقة" : "Previous photo"}
            className={`${roundBtn} hidden lg:inline-flex absolute top-1/2 -translate-y-1/2 start-3`}>
            {ar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button type="button" onClick={() => go(1)} aria-label={ar ? "الصورة التالية" : "Next photo"}
            className={`${roundBtn} hidden lg:inline-flex absolute top-1/2 -translate-y-1/2 end-3`}>
            {ar ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <span className="absolute top-[4.25rem] end-3 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {fmtNumber(idx + 1, ar)} / {fmtNumber(photos.length, ar)}
          </span>
        </>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <div className="max-w-[680px] mx-auto px-4 pb-5">
          {eyebrow && (
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-primary-foreground/85 mb-1.5">{eyebrow}</p>
          )}
          <h1 className={`listing-title ${ar ? "lang-ar" : "lang-en"} text-primary-foreground text-2xl lg:text-4xl`}>{title}</h1>
          {photos.length > 1 && (
            <div className="flex gap-1.5 mt-3" aria-hidden>
              {photos.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-primary-foreground" : "w-1.5 bg-primary-foreground/50"}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingHero;
