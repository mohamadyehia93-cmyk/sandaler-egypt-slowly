import React, { ReactNode, forwardRef } from "react";
import { useI18n } from "@/lib/i18n";
import { ChevronRight, ChevronLeft } from "lucide-react";

type SectionHeaderProps = {
  titleKey: string;
  onSeeAll?: () => void;
  /** Anchor id, used by the sticky category nav to scroll here. */
  id?: string;
  children: ReactNode;
};

const SectionHeader = forwardRef(({ titleKey, onSeeAll, id, children }: SectionHeaderProps, ref: React.Ref<HTMLElement>) => {
  const { t, lang } = useI18n();
  const Arrow = lang === "ar" ? ChevronLeft : ChevronRight;
  const isAr = lang === "ar";

  return (
    <section ref={ref} id={id} className="py-6 scroll-mt-28">
      <div className="flex items-baseline justify-between gap-3 px-4 mb-3">
        <h2 className={`listing-h2 ${isAr ? "lang-ar" : "lang-en"} text-foreground`}>
          {t(titleKey)}
        </h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="flex items-center gap-0.5 min-h-[44px] text-sm font-semibold text-primary-dark flex-shrink-0"
          >
            {t("section.seeAll")}
            <Arrow className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
});
SectionHeader.displayName = "SectionHeader";

export default SectionHeader;
