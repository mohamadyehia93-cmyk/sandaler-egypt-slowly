import { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { ChevronRight, ChevronLeft } from "lucide-react";

type SectionHeaderProps = {
  titleKey: string;
  onSeeAll?: () => void;
  children: ReactNode;
};

const SectionHeader = ({ titleKey, onSeeAll, children }: SectionHeaderProps) => {
  const { t, lang } = useI18n();
  const Arrow = lang === "ar" ? ChevronLeft : ChevronRight;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-lg font-bold text-primary-dark tracking-tight">{t(titleKey)}</h2>
        {onSeeAll && (
          <button onClick={onSeeAll} className="flex items-center gap-0.5 text-sm font-medium text-primary">
            {t("section.seeAll")}
            <Arrow className="w-4 h-4" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
};

export default SectionHeader;
