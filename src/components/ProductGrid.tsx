import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useProducts } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import CityBadge from "./CityBadge";
import { Skeleton } from "./ui/skeleton";

const ProductGrid = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();

  return (
    <SectionHeader titleKey="section.products">
      <div className="grid grid-cols-2 gap-3 px-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-lg" />
          ))
        ) : (products ?? []).slice(0, 3).map((p) => (
          <div key={p.id} className="rounded-lg overflow-hidden shadow-card bg-card">
            <div className="relative h-32">
              <img src={p.image || "/placeholder.svg"} alt={lang === "ar" ? p.name_ar : p.name_en} className="w-full h-full object-cover" />
              <button className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
                <Heart className="w-3.5 h-3.5 text-foreground" />
              </button>
              {p.badges && p.badges.length > 0 && (
                <span className="absolute bottom-2 left-2 bg-accent text-accent-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {p.badges[0]}
                </span>
              )}
            </div>
            <div className="p-2.5">
              <h3 className="text-xs font-semibold text-foreground line-clamp-2 mb-1">
                {lang === "ar" ? p.name_ar : p.name_en}
              </h3>
              {p.seller_name_en && (
                <div className="flex items-center gap-1.5 mb-1">
                  {p.seller_image && <img src={p.seller_image} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />}
                  <span className="text-[9px] text-primary font-medium truncate">
                    {lang === "ar" ? p.seller_name_ar : p.seller_name_en}
                  </span>
                </div>
              )}
              {p.city_id && <div className="mb-1"><CityBadge cityId={p.city_id} /></div>}
              <span className="text-sm font-bold text-primary-dark">{p.price} {t("common.egp")}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionHeader>
  );
};

export default ProductGrid;
