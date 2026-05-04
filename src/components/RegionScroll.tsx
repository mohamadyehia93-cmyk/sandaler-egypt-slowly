import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useRegions } from "@/hooks/useListings";
import { getRegionImage } from "@/lib/regionImageMap";
import SectionHeader from "./SectionHeader";
import { Skeleton } from "./ui/skeleton";

const RegionScroll = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { data: regions, isLoading } = useRegions();

  return (
    <SectionHeader titleKey="section.regions">
      <div className="grid grid-cols-4 gap-2 px-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-12 h-3" />
              </div>
            ))
          : (regions ?? []).map((r: any) => {
              const photo = getRegionImage(r.id) ?? r.image ?? null;
              const name = lang === "ar" ? r.name_ar : r.name_en;
              return (
                <button
                  key={r.id}
                  onClick={() => navigate(`/region/${r.id}`)}
                  className="flex flex-col items-center gap-2 min-w-[72px]"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-card border-2 border-primary/20 overflow-hidden bg-cover bg-center"
                    style={{ background: `${r.color ?? "hsl(var(--primary))"}18` }}
                  >
                    {photo ? (
                      <img
                        src={photo}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span aria-hidden="true">{r.emoji}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground text-center leading-tight">
                    {name}
                  </span>
                </button>
              );
            })}
      </div>
    </SectionHeader>
  );
};

export default RegionScroll;
