import { Children, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Hide the dot indicators (e.g. for 1–2 items). */
  showDots?: boolean;
  className?: string;
};

/**
 * Horizontal swipe rail of big cards. One card per screen on mobile,
 * three across on desktop. RTL-safe: it relies on the document direction
 * rather than doing its own left/right maths.
 */
const CardCarousel = ({ children, showDots = true, className = "" }: Props) => {
  const items = Children.toArray(children);
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const step = rail.scrollWidth / Math.max(items.length, 1);
    const index = Math.round(Math.abs(rail.scrollLeft) / step);
    setActive(Math.min(items.length - 1, Math.max(0, index)));
  };

  if (items.length === 0) return null;

  return (
    <div className={className}>
      <div
        ref={railRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 hide-scrollbar scroll-smooth"
      >
        {items.map((child, i) => (
          <div
            key={i}
            className="w-[86%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
          >
            {child}
          </div>
        ))}
      </div>

      {showDots && items.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {items.map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-4 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardCarousel;
