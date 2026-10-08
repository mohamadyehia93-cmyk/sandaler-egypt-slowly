import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  path: string;
  title: string;
  image?: string | null;
  meta?: string | null;
  ar: boolean;
  /** Small overlay in the image corner (e.g. a play glyph). */
  badge?: ReactNode;
  /** Optional block under the image instead of / before the title (e.g. a mini date). */
  top?: ReactNode;
}

/** Wide 3:2 image-led card shared by "More in {city}", provider offers and the city hub. */
const WideCard = ({ path, title, image, meta, ar, badge, top }: Props) => {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(path)} className="flex-shrink-0 w-[220px] snap-start text-start">
      <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-muted">
        {image && <img src={image} alt="" loading="lazy" className="w-full h-full object-cover" />}
        {badge && <span className="absolute bottom-2 start-2">{badge}</span>}
      </div>
      {top}
      <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-base mt-2 line-clamp-2 text-foreground`}>{title}</p>
      {meta && <p className="text-[13px] text-muted-foreground">{meta}</p>}
    </button>
  );
};

export const WideRow = ({ children }: { children: ReactNode }) => (
  <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 snap-x">{children}</div>
);

export default WideCard;
