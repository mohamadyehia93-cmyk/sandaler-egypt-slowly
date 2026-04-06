import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, ShoppingCart, Leaf, Package } from "lucide-react";
import WishlistButton from "@/components/WishlistButton";
import { useI18n } from "@/lib/i18n";
import ProviderBioCard from "@/components/ProviderBioCard";
import { Skeleton } from "@/components/ui/skeleton";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`id.eq.${id},slug.eq.${id}`)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!product) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  const name = lang === "ar" ? product.name_ar : product.name_en;
  const description = lang === "ar" ? product.description_ar : product.description_en;
  const originStory = lang === "ar" ? product.origin_story_ar : product.origin_story_en;
  const sellerName = lang === "ar" ? product.seller_name_ar : product.seller_name_en;
  const sellerVillage = lang === "ar" ? product.seller_village_ar : product.seller_village_en;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-72">
        <img src={product.image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <WishlistButton />
        {product.badges && product.badges.length > 0 && (
          <div className="absolute bottom-3 left-4 flex gap-1.5">
            {product.badges.map((badge, i) => (
              <span key={i} className="bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-foreground mb-1">{name}</h1>
        {sellerVillage && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPin className="w-4 h-4" />
            <span>{sellerVillage}</span>
          </div>
        )}

        {/* Description */}
        {description && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-2">{lang === "ar" ? "عن المنتج" : "About This Product"}</h2>
            <p className="text-sm text-foreground leading-relaxed mb-5">{description}</p>
          </>
        )}

        {/* Origin Story */}
        {originStory && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "قصة المنتج" : "Origin Story"}</p>
              <p className="text-sm font-semibold text-foreground">{originStory}</p>
            </div>
          </div>
        )}

        {/* Seller */}
        {sellerName && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface mb-5">
            {product.seller_image ? (
              <img src={product.seller_image} alt={sellerName} className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-lg">🧑‍🎨</div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "صنع بواسطة" : "Made by"}</p>
              <p className="text-sm font-semibold text-foreground">{sellerName}</p>
            </div>
          </div>
        )}

        {/* Purchase Options */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "خيارات الشراء" : "Purchase Options"}</h2>
        <div className="space-y-2 mb-6">
          {[
            { icon: "📦", text: lang === "ar" ? "شحن محلي متاح" : "Local shipping available" },
            { icon: "🎁", text: lang === "ar" ? "تغليف هدايا مجاني" : "Free gift wrapping" },
            { icon: "🔄", text: lang === "ar" ? "إرجاع خلال ١٤ يوم" : "14-day return policy" },
            { icon: "✅", text: lang === "ar" ? "شهادة أصالة مرفقة" : "Certificate of authenticity included" },
          ].map((opt, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
              <span className="text-base">{opt.icon}</span>
              <span className="text-xs text-foreground">{opt.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seller Bio */}
      {product.seller_id && (
        <ProviderBioCard providerId={product.seller_id} roleLabel={{ en: "Artisan / Seller", ar: "الحرفي / البائع" }} />
      )}

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{product.price} {t("common.egp")}</span>
        </div>
        <button onClick={() => navigate(`/booking?type=product&id=${product.id}`)} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          <ShoppingCart className="w-4 h-4" />
          {lang === "ar" ? "أضف للسلة" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
