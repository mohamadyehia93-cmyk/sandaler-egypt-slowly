import { useNavigate } from "react-router-dom";
import { regions } from "@/lib/sampleData";
import { useI18n } from "@/lib/i18n";
import { getRegionImage } from "@/lib/regionImageMap";
import SectionHeader from "./SectionHeader";

const RegionScroll = () => {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <SectionHeader titleKey="section.regions" onSeeAll={() => {}}>
      <div className="grid grid-cols-4 gap-2 px-4">
        {regions.map((r) => {
          const photo = getRegionImage(r.id);
          return (
            <button key={r.id} onClick={() => navigate(`/region/${r.id}`)} className="flex flex-col items-center gap-2 min-w-[72px]">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-card border-2 border-primary/20 overflow-hidden bg-cover bg-center"
                style={{ background: `${r.color}18` }}
              >
                {photo ? (
                  <img
                    src={photo}
                    alt={t(r.nameKey)}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true">{r.emoji}</span>
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
