import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { products } from "@/lib/sampleData";
import { productToProvider, providerShortInfo } from "@/lib/providerMappings";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";

const ProductGrid = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();

  return (
    <SectionHeader titleKey="section.products" onSeeAll={() => {}}>
      <div className="grid grid-cols-2 gap-3 px-4">
        {products.map((p) => (
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
              {(() => {
                const pid = productToProvider[p.id];
                const provider = pid ? providerShortInfo[pid] : null;
                return provider ? (
                  <button
                    onClick={() => navigate(`/provider/${pid}`)}
                    className="flex items-center gap-1.5 mb-1"
                  >
                    <img src={provider.avatar} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                    <span className="text-[9px] text-primary font-medium truncate">{provider.name[lang]}</span>
                  </button>
                ) : null;
              })()}
              <div className="mb-1"><CityBadge cityId={p.cityId} /></div>
              <span className="text-sm font-bold text-primary-dark">{p.price} {t("common.egp")}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default ProductGrid;
