import { forwardRef, type ReactNode } from "react";

interface Props {
  title?: string;
  ar: boolean;
  id?: string;
  children: ReactNode;
  className?: string;
}

/** Consistent listing section: serif heading, py-6, top border. */
const Section = forwardRef<HTMLElement, Props>(({ title, ar, id, children, className = "" }, ref) => (
  <section ref={ref} id={id} className={`py-6 border-t border-border scroll-mt-4 ${className}`}>
    {title && <h2 className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground mb-3`}>{title}</h2>}
    <div className="text-[15px] leading-7 text-foreground/90">{children}</div>
  </section>
));
Section.displayName = "Section";

export default Section;
