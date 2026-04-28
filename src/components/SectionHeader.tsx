import React, { ReactNode, forwardRef } from "react";
import { useI18n } from "@/lib/i18n";
import { ChevronRight, ChevronLeft } from "lucide-react";

type SectionHeaderProps = {
  titleKey: string;
  onSeeAll?: () => void;
  children: ReactNode;
};

const SectionHeader = forwardRef(({ titleKey, onSeeAll, children }: SectionHeaderProps, ref: React.Ref<HTMLElement>) => {
  const { t, lang } = useI18n();
  const Arrow = lang === "ar" ? ChevronLeft : ChevronRight;
  const isAr = lang === "ar";

  return (
    <section ref={ref} className="mb-8">
      <div className="flex items-end justify-between px-4 mb-3">
        <h2
          className={`text-[11px] font-semibold text-muted-foreground ${
            isAr ? "" : "uppercase tracking-[0.12em]"
          }`}
        >
          {t(titleKey)}
        </h2>
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground/80 hover:text-primary transition-colors"
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
