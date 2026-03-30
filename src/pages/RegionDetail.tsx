import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { regions, accommodation, transport, products } from "@/lib/sampleData";
import SectionHeader from "@/components/SectionHeader";
import BottomNav from "@/components/BottomNav";

const RegionDetail = () => {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const region = regions.find((r) => r.id === regionId);
  if (!region) return <div className="p-8 text-center text-muted-foreground">Region not found</div>;

  const regionAccommodation = accommodation.filter((a) => a.regionId === regionId);
  const regionTransport = transport.filter((tr) => tr.regionId === regionId);
  const regionProducts = products.filter((p) => p.regionId === regionId);

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{region.emoji}</span>
          <h1 className="text-lg font-bold text-foreground">{t(region.nameKey)}</h1>
        </div>
      </header>

      {/* Hero banner */}
      <div
        className="mx-4 mt-2 mb-4 h-36 rounded-xl flex items-end p-4"
        style={{ background: `linear-gradient(135deg, ${region.color}40, ${region.color}15)` }}
      >
        <span className="text-5xl">{region.emoji}</span>
      </div>

      <div className="space-y-6 pt-2">
        {/* Places to Stay */}
        {regionAccommodation.length > 0 && (
          <SectionHeader titleKey="section.placesToStay" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {regionAccommodation.map((a) => (
                <div key={a.id} className="min-w-[200px] rounded-lg overflow-hidden shadow-card bg-card">
                  <div className="relative h-32">
                    <img src={a.image} alt={a.title[lang]} className="w-full h-full object-cover" />
                    <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                      <Heart className="w-4 h-4 text-foreground" />
                    </button>
                    <span className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {a.type[lang]}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-0.5">{a.title[lang]}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{a.location[lang]}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary-dark">
                        {a.price} {t("common.egp")}<span className="text-xs font-normal text-muted-foreground">{t("common.perNight")}</span>
                      </span>
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {a.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}

        {/* Getting Around */}
        {regionTransport.length > 0 && (
          <SectionHeader titleKey="section.gettingAround" onSeeAll={() => {}}>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {regionTransport.map((tr) => (
                <div key={tr.id} className="min-w-[140px] rounded-lg shadow-card bg-card p-4 flex flex-col items-center gap-2">
                  <span className="text-3xl">{tr.icon}</span>
                  <h3 className="text-xs font-semibold text-foreground text-center line-clamp-2">{tr.title[lang]}</h3>
                  <span className="text-sm font-bold text-primary-dark">{tr.price} {t("common.egp")}</span>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}

        {/* Local Products */}
        {regionProducts.length > 0 && (
          <SectionHeader titleKey="section.products" onSeeAll={() => {}}>
            <div className="grid grid-cols-2 gap-3 px-4">
              {regionProducts.map((p) => (
                <div key={p.id} className="rounded-lg overflow-hidden shadow-card bg-card">
                  <div className="relative h-32">
                    <img src={p.image} alt={p.title[lang]} className="w-full h-full object-cover" />
                    <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                      <Heart className="w-3.5 h-3.5 text-foreground" />
                    </button>
                    <span className="absolute bottom-2 left-2 bg-accent text-accent-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {p.badge[lang]}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-xs font-semibold text-foreground line-clamp-2 mb-1">{p.title[lang]}</h3>
                    <p className="text-[10px] text-muted-foreground mb-1">{p.village[lang]}</p>
                    <span className="text-sm font-bold text-primary-dark">{p.price} {t("common.egp")}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionHeader>
        )}

        {/* Empty state */}
        {regionAccommodation.length === 0 && regionTransport.length === 0 && regionProducts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {lang === "ar" ? "المحتوى قادم قريباً" : "Content coming soon"}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default RegionDetail;
