import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, ShoppingCart, Leaf, Package, Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import WishlistButton from "@/components/WishlistButton";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import ProviderBioCard from "@/components/ProviderBioCard";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundView from "@/components/NotFound";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const ar = lang === "ar";
  const [sheetOpen, setSheetOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchByIdOrSlug("products", id!),
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

  if (!product) return <NotFoundView context="product" />;

  const name = lang === "ar" ? product.name_ar : product.name_en;
  const description = lang === "ar" ? product.description_ar : product.description_en;
  const originStory = lang === "ar" ? product.origin_story_ar : product.origin_story_en;
  const sellerName = lang === "ar" ? product.seller_name_ar : product.seller_name_en;
  const sellerVillage = lang === "ar" ? product.seller_village_ar : product.seller_village_en;
  const unitPrice = Number(product.price) || 0;
  const total = unitPrice * qty;

  const openOrder = () => {
    if (!user) {
      toast.error(ar ? "يرجى تسجيل الدخول لإتمام الطلب" : "Please sign in to place an order");
      navigate("/login");
      return;
    }
    setQty(1);
    setNote("");
    setContactName(((user.user_metadata as Record<string, unknown>)?.display_name as string) || "");
    setContactPhone("");
    setSheetOpen(true);
  };

  // Unpaid order request: the seller confirms/declines/fulfils it.
  // Payment (Stripe) can be layered on later without changing this flow.
  // seller_id / unit_price_egp / total_egp are set server-side by the
  // orders_insert_integrity trigger, so they are never trusted from the client.
  const submitOrder = async () => {
    if (!user) return;
    if (!contactName.trim()) {
      toast.error(ar ? "يرجى إدخال الاسم" : "Please enter your name");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      product_id: product.id,
      buyer_id: user.id,
      quantity: qty,
      buyer_note: note.trim() || null,
      contact_name: contactName.trim(),
      contact_phone: contactPhone.trim() || null,
    } as never);
    setSubmitting(false);
    if (error) {
      toast.error(ar ? "تعذر إنشاء الطلب" : "Could not place the order");
      return;
    }
    setSheetOpen(false);
    toast.success(ar ? "تم إرسال طلبك للبائع" : "Your order request was sent to the seller");
    navigate("/orders");
  };




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
        <button onClick={openOrder} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          <ShoppingCart className="w-4 h-4" />
          {ar ? "اطلب الآن" : "Order Now"}
        </button>
      </div>

      {/* Order Sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] flex items-end bg-foreground/40" onClick={() => setSheetOpen(false)}>
          <div className="w-full bg-background rounded-t-2xl p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">{ar ? "إتمام الطلب" : "Place Order"}</h3>
              <button onClick={() => setSheetOpen(false)} className="p-1 text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm font-semibold text-foreground line-clamp-1">{name}</p>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{ar ? "الكمية" : "Quantity"}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-base font-bold text-foreground w-6 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={ar ? "ملاحظة للبائع (اختياري)" : "Note for the seller (optional)"}
              className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground"
            />

            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">{ar ? "الإجمالي" : "Total"}</span>
              <span className="text-lg font-bold text-primary-dark">{total.toLocaleString(ar ? "ar-EG" : "en-US")} {t("common.egp")}</span>
            </div>

            <p className="text-[11px] text-muted-foreground">
              {ar
                ? "سيتم إرسال الطلب كغير مدفوع بانتظار تأكيد البائع، ويتم الدفع لاحقاً."
                : "The order is sent as unpaid and pending seller confirmation. Payment is handled later."}
            </p>

            <button
              disabled={submitting}
              onClick={submitOrder}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50"
            >
              {submitting ? (ar ? "جاري الإرسال..." : "Sending...") : (ar ? "تأكيد الطلب" : "Confirm Order")}
            </button>
          </div>
        </div>
      )}
    </div>

  );
};

export default ProductDetail;
