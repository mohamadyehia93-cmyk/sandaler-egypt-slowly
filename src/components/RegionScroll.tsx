import { regions } from "@/lib/sampleData";
import { useI18n } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";

const RegionScroll = () => {
  const { t } = useI18n();

  return (
    <SectionHeader titleKey="section.regions" onSeeAll={() => {}}>
      <div className="flex gap-4 px-4 overflow-x-auto hide-scrollbar">
        {regions.map((r) => (
          <button key={r.id} className="flex flex-col items-center gap-2 min-w-[72px]">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-card border-2 border-primary/20"
              style={{ background: `${r.color}18` }}
            >
              {r.emoji}
            </div>
            <span className="text-xs font-medium text-foreground text-center leading-tight">
              {t(r.nameKey)}
            </span>
          </button>
        ))}
      </div>
    </SectionHeader>
  );
};

export default RegionScroll;
