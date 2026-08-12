import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ShoppingCart, Minus, Plus, X, Truck, Ruler, Clock, Sparkles, Package, Droplets } from "lucide-react";
import MachineTranslatedNote from "@/components/MachineTranslatedNote";
import { toast } from "sonner";
import WishlistButton from "@/components/WishlistButton";
import ShareButton from "@/components/ShareButton";
import LocationChips from "@/components/LocationChips";
import Avatar from "@/components/AvatarFallback";
import MessageOwnerButton from "@/components/MessageOwnerButton";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { productCategoryLabel } from "@/lib/productTaxonomy";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundView from "@/components/NotFound";

/**
 * INTEGRITY RULE for this page: every block is backed by a real column on THIS
 * product row (or a query scoped to it). No invented specs, no ratings without
 * real reviews, no delivery terms the seller did not write. Each section hides
 * itself when its column is empty.
 *
 * DESIGN INTENT: the maker and the making lead; the specs are evidence.
 */

type VariantGroup = { label_en?: string | null; label_ar?: string | null; options?: unknown };
type DeliveryOption = {
  method_en?: string | null;
  method_ar?: string | null;
  cost?: number | string | null;
  notes_en?: string | null;
  notes_ar?: string | null;
};

const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

const Divider = () => <div className="h-px bg-black/[0.06] my-4" />;

const SectionTitle = ({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) => (
  <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
    {icon}
    {children}
  </h2>
);

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { user } = useAuth();
  const ar = lang === "ar";
  const locale = ar ? "ar-EG" : "en-US";

  const [photoIdx, setPhotoIdx] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [deliveryIdx, setDeliveryIdx] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchByIdOrSlug("products", id!),
    enabled: !!id,
  });

  const sellerId = product?.seller_id ?? null;

  // More from this seller — only meaningful when the product actually has an owner.
  const { data: fromSeller = [] } = useQuery({
    queryKey: ["product-more-from-seller", sellerId, product?.id],
    enabled: !!sellerId && !!product?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name_en, name_ar, image, price, currency")
        .eq("seller_id", sellerId!)
        .eq("status", "published")
        .neq("id", product!.id)
        .limit(8);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: related = [] } = useQuery({
    queryKey: ["product-related", product?.id, product?.category, product?.city_id],
    enabled: !!product?.id,
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("id, slug, name_en, name_ar, image, price, currency, category")
        .eq("status", "published")
        .neq("id", product!.id)
        .limit(8);
      if (product!.category) q = q.eq("category", product!.category);
      else if (product!.city_id) q = q.eq("city_id", product!.city_id);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const variants = useMemo(() => {
    return asArray<VariantGroup>(product?.variants)
      .map((v) => ({
        label: ar ? v.label_ar || v.label_en || "" : v.label_en || v.label_ar || "",
        options: (Array.isArray(v.options) ? v.options : String(v.options || "").split(","))
          .map((o) => String(o).trim())
          .filter(Boolean),
      }))
      .filter((v) => v.label && v.options.length > 0);
  }, [product?.variants, ar]);

  const deliveryOptions = useMemo(
    () =>
      asArray<DeliveryOption>(product?.delivery_options)
        .map((d) => ({
          method: ar ? d.method_ar || d.method_en || "" : d.method_en || d.method_ar || "",
          cost: d.cost === null || d.cost === undefined || d.cost === "" ? null : Number(d.cost),
          notes: ar ? d.notes_ar || d.notes_en || "" : d.notes_en || d.notes_ar || "",
        }))
        .filter((d) => d.method),
    [product?.delivery_options, ar]
  );

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

  const name = ar ? product.name_ar || product.name_en : product.name_en;
  const description = ar ? product.description_ar || product.description_en : product.description_en;
  const story = ar ? product.origin_story_ar || product.origin_story_en : product.origin_story_en;
  const sellerName = ar ? product.seller_name_ar || product.seller_name_en : product.seller_name_en;
  const sellerVillage = ar ? product.seller_village_ar || product.seller_village_en : product.seller_village_en;
  const materials = ar ? product.materials_ar || product.materials_en : product.materials_en;
  const care = ar ? product.care_ar || product.care_en : product.care_en;
  const categoryLabel = productCategoryLabel(product.category, lang);

  // Only real images: never repeat one file to fake a gallery.
  const gallery = (product.images || []).filter(Boolean);
  const photos = gallery.length > 0 ? gallery : product.image ? [product.image] : [];
  const hero = photos[Math.min(photoIdx, Math.max(photos.length - 1, 0))] || "/placeholder.svg";

  const currency = (product.currency || "EGP").trim();
  const money = (n: number) => `${n.toLocaleString(locale)} ${ar && currency === "EGP" ? "ج.م" : currency}`;
  const unitPrice = Number(product.price) || 0;
  const chosenDelivery = deliveryIdx !== null ? deliveryOptions[deliveryIdx] : undefined;
  const deliveryCost = chosenDelivery?.cost ?? 0;
  const total = unitPrice * qty + (deliveryCost || 0);
  const isPickup = /pickup|استلام/i.test(chosenDelivery?.method || "");

  const openOrder = () => {
    if (!user) {
      toast.error(ar ? "يرجى تسجيل الدخول لإتمام الطلب" : "Please sign in to place an order");
      navigate("/login");
      return;
    }
    setQty(1);
    setNote("");
    setAddress("");
    setChosen({});
    setDeliveryIdx(deliveryOptions.length > 0 ? 0 : null);
    setContactName(((user.user_metadata as Record<string, unknown>)?.display_name as string) || "");
    setContactPhone("");
    setSheetOpen(true);
  };

  // Unpaid order request: the seller confirms/declines/fulfils it.
  // seller_id / unit_price_egp / total_egp are set server-side by the
  // orders_insert_integrity trigger, so they are never trusted from the client.
  const submitOrder = async () => {
    if (!user) return;
    if (!contactName.trim()) {
      toast.error(ar ? "يرجى إدخال الاسم" : "Please enter your name");
      return;
    }
    const missing = variants.find((v) => !chosen[v.label]);
    if (missing) {
      toast.error(ar ? `يرجى اختيار ${missing.label}` : `Please choose a ${missing.label}`);
      return;
    }
    if (chosenDelivery && !isPickup && !address.trim()) {
      toast.error(ar ? "يرجى إدخال عنوان التوصيل" : "Please enter a delivery address");
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
      variant_selection: Object.keys(chosen).length > 0 ? chosen : null,
      delivery_method: chosenDelivery?.method || null,
      delivery_address: !isPickup && address.trim() ? address.trim() : null,
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

  const MiniCard = ({
    row,
  }: {
    row: { id: string; slug: string | null; name_en: string; name_ar: string | null; image: string | null; price: number; currency?: string | null };
  }) => {
    const rName = ar ? row.name_ar || row.name_en : row.name_en;
    const rCur = (row.currency || "EGP").trim();
    return (
      <button
        onClick={() => navigate(`/product/${row.slug || row.id}`)}
        className="flex-shrink-0 w-[138px] border border-border rounded-[10px] overflow-hidden bg-card text-start"
      >
        <div className="h-[80px] bg-secondary overflow-hidden">
          {row.image ? (
            <img src={row.image} alt={rName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-primary-dark font-medium px-2 text-center">{rName}</div>
          )}
        </div>
        <div className="p-2">
          <p className="text-[11px] font-semibold text-foreground leading-[1.3] line-clamp-2">{rName}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {Number(row.price || 0).toLocaleString(locale)} {ar && rCur === "EGP" ? "ج.م" : rCur}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── TOP NAV — actions live here, so nothing overlaps the title ── */}
      <div className="h-11 flex items-center justify-between px-4 bg-card sticky top-0 z-40">
        <button
          onClick={() => navigate(-1)}
          className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <span className="text-xs text-muted-foreground truncate max-w-[55%]">
          {categoryLabel || (ar ? "منتج يدوي" : "Handmade product")}
        </span>
        <div className="flex gap-2">
          <ShareButton
            title={name}
            className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center"
            iconClassName="w-3.5 h-3.5 text-foreground"
          />
          <WishlistButton
            itemType="product"
            itemId={product.id}
            className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center transition-transform [&>svg]:w-3.5 [&>svg]:h-3.5"
          />
        </div>
      </div>

      {/* ── GALLERY — only the images the row actually has ── */}
      {photos.length > 0 && (
        <div>
          <div className="h-[260px] bg-secondary">
            <img src={hero} alt={name} className="w-full h-full object-cover" />
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-2">
              {photos.map((p, i) => (
                <button
                  key={`${p}-${i}`}
                  onClick={() => setPhotoIdx(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                    i === photoIdx ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-4 pt-4">
        {/* ── TITLE · PRICE · CATEGORY · LOCATION ── */}
        <h1 className="text-xl font-bold text-foreground leading-snug">{name}</h1>
        <p className="text-lg font-bold text-primary-dark mt-1">{money(unitPrice)}</p>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {categoryLabel && (
            <span className="text-[11px] font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">{categoryLabel}</span>
          )}
        </div>
        <LocationChips
          cityId={product.city_id}
          regionId={product.region_id}
          fallbackText={product.city_id ? null : sellerVillage}
          className="mt-2"
        />

        {/* ── DESCRIPTION ── */}
        {description && (
          <>
            <Divider />
            <SectionTitle>{ar ? "عن المنتج" : "About this product"}</SectionTitle>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{description}</p>
            <MachineTranslatedNote
              meta={product.translation_meta}
              field={ar ? "description_ar" : "description_en"}
              className="mt-1"
            />
          </>
        )}

        {/* ── THE MAKER — lead, not footnote ── */}
        {(sellerName || story || sellerId) && (
          <>
            <Divider />
            <SectionTitle>{ar ? "الحرفي" : "The maker"}</SectionTitle>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={product.seller_image}
                  name={sellerName}
                  className="w-14 h-14 rounded-full border-2 border-primary/20"
                />
                <div className="min-w-0">
                  <p className="text-base font-bold text-foreground leading-tight">
                    {sellerName || (ar ? "حرفي محلي" : "Local maker")}
                  </p>
                  {sellerVillage && <p className="text-xs text-muted-foreground mt-0.5">{sellerVillage}</p>}
                </div>
              </div>

              {story && (
                <>
                  <p className="text-sm text-foreground leading-relaxed mt-3 whitespace-pre-line">{story}</p>
                  <MachineTranslatedNote
                    meta={product.translation_meta}
                    field={ar ? "origin_story_ar" : "origin_story_en"}
                    className="mt-1"
                  />
                </>
              )}

              {sellerId ? (
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => navigate(`/provider/${sellerId}`)}
                    className="flex-1 h-9 rounded-xl bg-card border border-border text-xs font-semibold text-foreground"
                  >
                    {ar ? "عرض ملف الحرفي" : "View maker profile"}
                  </button>
                  <MessageOwnerButton
                    ownerId={sellerId}
                    kind="provider"
                    variant="chip"
                    label={ar ? "مراسلة" : "Message"}
                  />
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground mt-3">
                  {ar
                    ? "لم ينضم هذا الحرفي إلى التطبيق بعد، لذا لا يمكن مراسلته هنا."
                    : "This maker hasn't joined the app yet, so they can't be messaged here."}
                </p>
              )}
            </div>
          </>
        )}

        {/* ── MADE TO ORDER — a feature of craft ── */}
        {product.made_to_order && (
          <>
            <Divider />
            <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-3.5">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {ar ? "يُصنع خصيصًا لك" : "Made to order for you"}
                  {product.lead_time_days
                    ? ar
                      ? ` · جاهز في نحو ${product.lead_time_days} يوم`
                      : ` · ready in ~${product.lead_time_days} days`
                    : ""}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ar
                    ? "يبدأ الحرفي العمل بعد تأكيد الطلب."
                    : "The maker starts the work once your order is confirmed."}
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── VARIANTS ── */}
        {variants.length > 0 && (
          <>
            <Divider />
            <SectionTitle icon={<Package className="w-4 h-4 text-primary" />}>
              {ar ? "الخيارات" : "Options"}
            </SectionTitle>
            <div className="space-y-3">
              {variants.map((v) => (
                <div key={v.label}>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">{v.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((o) => (
                      <button
                        key={o}
                        onClick={() => setChosen((p) => ({ ...p, [v.label]: o }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          chosen[v.label] === o
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── DETAILS — supporting evidence ── */}
        {(materials || product.dimensions || product.weight_grams || care) && (
          <>
            <Divider />
            <SectionTitle icon={<Ruler className="w-4 h-4 text-primary" />}>
              {ar ? "التفاصيل" : "Details"}
            </SectionTitle>
            <dl className="rounded-xl border border-border bg-surface divide-y divide-border">
              {materials && (
                <div className="flex gap-3 px-3 py-2.5">
                  <dt className="text-xs text-muted-foreground w-24 shrink-0">{ar ? "المواد" : "Materials"}</dt>
                  <dd className="text-xs font-medium text-foreground">{materials}</dd>
                </div>
              )}
              {product.dimensions && (
                <div className="flex gap-3 px-3 py-2.5">
                  <dt className="text-xs text-muted-foreground w-24 shrink-0">{ar ? "الأبعاد" : "Dimensions"}</dt>
                  <dd className="text-xs font-medium text-foreground">{product.dimensions}</dd>
                </div>
              )}
              {!!product.weight_grams && (
                <div className="flex gap-3 px-3 py-2.5">
                  <dt className="text-xs text-muted-foreground w-24 shrink-0">{ar ? "الوزن" : "Weight"}</dt>
                  <dd className="text-xs font-medium text-foreground">
                    {product.weight_grams >= 1000
                      ? `${(product.weight_grams / 1000).toLocaleString(locale)} ${ar ? "كجم" : "kg"}`
                      : `${product.weight_grams.toLocaleString(locale)} ${ar ? "جم" : "g"}`}
                  </dd>
                </div>
              )}
              {care && (
                <div className="flex gap-3 px-3 py-2.5">
                  <dt className="text-xs text-muted-foreground w-24 shrink-0 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-primary" />
                    {ar ? "العناية" : "Care"}
                  </dt>
                  <dd className="text-xs font-medium text-foreground">{care}</dd>
                </div>
              )}
            </dl>
          </>
        )}

        {/* ── DELIVERY ── */}
        <Divider />
        <SectionTitle icon={<Truck className="w-4 h-4 text-primary" />}>
          {ar ? "الاستلام والتوصيل" : "Pickup & delivery"}
        </SectionTitle>
        {deliveryOptions.length > 0 ? (
          <ul className="rounded-xl border border-border bg-surface divide-y divide-border">
            {deliveryOptions.map((d, i) => (
              <li key={`${d.method}-${i}`} className="px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-foreground">{d.method}</span>
                  <span className="text-xs font-semibold text-primary-dark shrink-0">
                    {d.cost === null ? (ar ? "حسب الاتفاق" : "On request") : d.cost === 0 ? (ar ? "مجانًا" : "Free") : money(d.cost)}
                  </span>
                </div>
                {d.notes && <p className="text-[11px] text-muted-foreground mt-0.5">{d.notes}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            {ar
              ? "يتم الاتفاق على الاستلام أو التوصيل مع الحرفي بعد الطلب."
              : "Pickup or delivery is arranged directly with the maker after you order."}
          </p>
        )}

        {/* ── MORE FROM THIS SELLER ── */}
        {sellerId && fromSeller.length > 0 && (
          <>
            <Divider />
            <SectionTitle>{ar ? "المزيد من هذا الحرفي" : "More from this maker"}</SectionTitle>
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1.5">
              {fromSeller.map((r) => (
                <MiniCard key={r.id} row={r} />
              ))}
            </div>
          </>
        )}

        {/* ── RELATED ── */}
        {related.length > 0 && (
          <>
            <Divider />
            <SectionTitle>
              {categoryLabel ? (ar ? `المزيد في ${categoryLabel}` : `More in ${categoryLabel}`) : ar ? "منتجات أخرى" : "Other products"}
            </SectionTitle>
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1.5">
              {related.map((r) => (
                <MiniCard key={r.id} row={r} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── STICKY BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div className="min-w-0">
          <span className="text-lg font-bold text-primary-dark">{money(unitPrice)}</span>
          {product.made_to_order && product.lead_time_days ? (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {ar ? `يُصنع في نحو ${product.lead_time_days} يوم` : `made in ~${product.lead_time_days} days`}
            </p>
          ) : null}
        </div>
        <button
          onClick={openOrder}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated"
        >
          <ShoppingCart className="w-4 h-4" />
          {ar ? "اطلب الآن" : "Order Now"}
        </button>
      </div>

      {/* ── ORDER SHEET ── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] flex items-end bg-foreground/40" onClick={() => setSheetOpen(false)}>
          <div
            className="w-full max-h-[88vh] overflow-y-auto bg-background rounded-t-2xl p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">{ar ? "إتمام الطلب" : "Place Order"}</h3>
              <button onClick={() => setSheetOpen(false)} className="p-1 text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm font-semibold text-foreground line-clamp-1">{name}</p>

            {/* variant choices — captured on the order row */}
            {variants.map((v) => (
              <div key={v.label}>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">{v.label}</p>
                <div className="flex flex-wrap gap-2">
                  {v.options.map((o) => (
                    <button
                      key={o}
                      onClick={() => setChosen((p) => ({ ...p, [v.label]: o }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                        chosen[v.label] === o
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}

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

            {/* delivery choice */}
            {deliveryOptions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                  {ar ? "الاستلام / التوصيل" : "Pickup / delivery"}
                </p>
                <div className="space-y-2">
                  {deliveryOptions.map((d, i) => (
                    <button
                      key={`${d.method}-${i}`}
                      onClick={() => setDeliveryIdx(i)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-start ${
                        deliveryIdx === i ? "border-primary bg-primary/5" : "border-border bg-surface"
                      }`}
                    >
                      <span className="text-xs font-medium text-foreground">{d.method}</span>
                      <span className="text-xs font-semibold text-primary-dark shrink-0">
                        {d.cost === null ? (ar ? "حسب الاتفاق" : "On request") : d.cost === 0 ? (ar ? "مجانًا" : "Free") : money(d.cost)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chosenDelivery && !isPickup && (
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder={ar ? "عنوان التوصيل" : "Delivery address"}
                className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground"
              />
            )}

            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder={ar ? "الاسم" : "Your name"}
              className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder={ar ? "رقم الهاتف (اختياري)" : "Phone (optional)"}
              className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={ar ? "ملاحظة للبائع (اختياري)" : "Note for the seller (optional)"}
              className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground"
            />

            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">{ar ? "الإجمالي" : "Total"}</span>
              <span className="text-lg font-bold text-primary-dark">{money(total)}</span>
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
              {submitting ? (ar ? "جاري الإرسال..." : "Sending...") : ar ? "تأكيد الطلب" : "Confirm Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
