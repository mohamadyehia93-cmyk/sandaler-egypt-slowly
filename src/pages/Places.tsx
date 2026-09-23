import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useI18n } from "@/lib/i18n";
import { useRegions, useCities } from "@/hooks/useListings";
import { getRegionImage } from "@/lib/regionImageMap";
import { Skeleton } from "@/components/ui/skeleton";

/** Places index: every region, with its cities underneath. */
const Places = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { data: regions, isLoading } = useRegions();
  const { data: cities } = useCities();

  const name = (r: any) => (lang === "ar" ? r.name_ar || r.name_en : r.name_en);

  return (
    <div className="min-h-screen bg-surface">
      <PageHeader title={lang === "ar" ? "الأماكن" : "Places"} />
      <div className="mx-auto max-w-5xl px-4 py-4">
        <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
          {lang === "ar"
            ? "ابدأ من منطقة، ثم اختر مدينة لتكتشف ما فيها."
            : "Start with a region, then pick a city to see what's there."}
        </p>

        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="mb-4 h-32 w-full rounded-xl" />
          ))}

        <div className="space-y-4">
          {(regions ?? []).map((r: any) => {
            const photo = getRegionImage(r.id) ?? r.image ?? null;
            const regionCities = (cities ?? []).filter((c: any) => c.region_id === r.id);
            return (
              <section key={r.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                <button
                  onClick={() => navigate(`/region/${r.id}`)}
                  className="focus-ring relative block h-32 w-full text-start"
                >
                  {photo ? (
                    <img src={photo} alt={name(r)} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-primary/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 start-4 end-4 flex items-center justify-between">
                    <span className="text-base font-bold text-white drop-shadow">{name(r)}</span>
                    <ChevronRight className="h-4 w-4 text-white rtl:rotate-180" />
                  </div>
                </button>
                {regionCities.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3">
                    {regionCities.map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/city/${c.id}`)}
                        className="focus-ring rounded-full bg-accent px-3 py-1.5 text-[12px] font-semibold text-accent-foreground"
                      >
                        {name(c)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="p-3 text-[12px] text-muted-foreground">
                    {lang === "ar" ? "لا توجد مدن مدرجة بعد." : "No cities listed yet."}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Places;
