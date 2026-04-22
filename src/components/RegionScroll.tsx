import { useNavigate } from "react-router-dom";
import { regions } from "@/lib/sampleData";
import { useI18n } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";

const RegionScroll = () => {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <SectionHeader titleKey="section.regions" onSeeAll={() => {}}>
      <div className="grid grid-cols-4 gap-2 px-4">
        {regions.map((r) => {
          const photo = r.id === "frontiers"
            ? "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=200&q=80"
            : null;
          return (
            <button key={r.id} onClick={() => navigate(`/region/${r.id}`)} className="flex flex-col items-center gap-2 min-w-[72px]">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-card border-2 border-primary/20 overflow-hidden"
                style={{ background: `${r.color}18` }}
              >
                {photo ? (
                  <img src={photo} alt={t(r.nameKey)} className="w-full h-full object-cover" />
                ) : (
                  r.emoji
                )}
              </div>
              <span className="text-xs font-medium text-foreground text-center leading-tight">
                {t(r.nameKey)}
              </span>
            </button>
          );
        })}
      </div>
    </SectionHeader>
  );
};

export default RegionScroll;
