import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, ShoppingCart, Leaf, Package, Users } from "lucide-react";
import WishlistButton from "@/components/WishlistButton";
import { useI18n } from "@/lib/i18n";
import { products } from "@/lib/sampleData";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const product = products.find((p) => p.id === id);
  if (!product) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-72">
        <img src={product.image} alt={product.title[lang]} className="w-full h-full object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <WishlistButton />
        <div className="absolute bottom-3 left-4">
          <span className="bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {product.badge[lang]}
          </span>
        </div>
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-foreground mb-1">{product.title[lang]}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          <span>{product.village[lang]}</span>
        </div>

        {/* Description */}
        {product.description && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-2">{lang === "ar" ? "عن المنتج" : "About This Product"}</h2>
            <p className="text-sm text-foreground leading-relaxed mb-5">{product.description[lang]}</p>
          </>
        )}

        {/* Artisan */}
        {product.artisan && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface mb-5">
            <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-lg">🧑‍🎨</div>
            <div>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "صنع بواسطة" : "Made by"}</p>
              <p className="text-sm font-semibold text-foreground">{product.artisan[lang]}</p>
            </div>
          </div>
        )}

        {/* Materials */}
        {product.materials && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "المواد" : "Materials"}</h2>
            <div className="flex flex-wrap gap-2 mb-5">
              {product.materials[lang].map((m, i) => (
                <span key={i} className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
                  <Package className="w-3 h-3" /> {m}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Impact */}
        {product.impact && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "الأثر المجتمعي" : "Community Impact"}</p>
              <p className="text-sm font-semibold text-foreground">{product.impact[lang]}</p>
            </div>
          </div>
        )}

        {/* Shipping & Options */}
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
