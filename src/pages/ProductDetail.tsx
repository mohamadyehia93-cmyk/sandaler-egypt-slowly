import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, X, Truck, Ruler, Clock, Package, MapPin, Banknote } from "lucide-react";
import ListingHero from "@/components/listing/ListingHero";
import KeyFacts, { type KeyFact } from "@/components/listing/KeyFacts";
import Section from "@/components/listing/Section";
import ActionBar from "@/components/listing/ActionBar";
import ReadBeforeYouGo from "@/components/listing/ReadBeforeYouGo";
import { fmtNumber, splitStandfirst } from "@/components/listing/format";
import MachineTranslatedNote from "@/components/MachineTranslatedNote";
import { toast } from "sonner";
import Avatar from "@/components/AvatarFallback";
import MessageOwnerButton from "@/components/MessageOwnerButton";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { productCategoryLabel } from "@/lib/productTaxonomy";
import { PROVIDER_PUBLIC_COLUMNS } from "@/lib/providerColumns";
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

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { user } = useAuth();
  const ar = lang === "ar";
  const locale = ar ? "ar-EG" : "en-GB";

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

  // When the product HAS an owner, the maker identity comes from the claimed
  // provider record — the seed text columns (seller_name_*/seller_image) are
  // empty on owner-created rows.
  const { data: seller } = useQuery({
    queryKey: ["product-seller", sellerId],
    enabled: !!sellerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select(PROVIDER_PUBLIC_COLUMNS)
        .eq("id", sellerId!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as {
        name_en: string | null; name_ar: string | null; avatar: string | null;
        city_en: string | null; city_ar: string | null; slug: string | null;
        tagline_en: string | null; tagline_ar: string | null;
      } | null;
    },
  });

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

  const { data: city } = useQuery({
    queryKey: ["city-name", product?.city_id],
    enabled: !!product?.city_id,
    queryFn: async () => {
      const { data, error } = await supabase.from("cities").select("name_en, name_ar").eq("id", product!.city_id!).maybeSingle();
      if (error) throw error;
      return data;
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
      <div className="min-h-screen bg-background space-y-4">
        <Skeleton className="h-[56vh] max-h-[460px] w-full rounded-none" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!product) return <NotFoundView context="product" />;

  const name = ar ? product.name_ar || product.name_en : product.name_en;
  const description = ar ? product.description_ar || product.description_en : product.description_en;
  const rawStory = ar ? product.origin_story_ar || product.origin_story_en : product.origin_story_en;
  // Several seeded rows copied the description into origin_story; showing the
  // same paragraph twice reads as padding, so the duplicate is dropped.
  const norm = (v?: string | null) => (v || "").trim().replace(/\s+/g, " ").toLowerCase();
  const story = norm(rawStory) && norm(rawStory) !== norm(ar ? product.description_ar || product.description_en : product.description_en) ? rawStory : null;
  const providerName = seller ? (ar ? seller.name_ar || seller.name_en : seller.name_en) : null;
  const providerCity = seller ? (ar ? seller.city_ar || seller.city_en : seller.city_en) : null;
  const providerTagline = seller ? (ar ? seller.tagline_ar || seller.tagline_en : seller.tagline_en) : null;
  const sellerName =
    providerName || (ar ? product.seller_name_ar || product.seller_name_en : product.seller_name_en);
  const sellerVillage =
    (ar ? product.seller_village_ar || product.seller_village_en : product.seller_village_en) || providerCity;
  const materials = ar ? product.materials_ar || product.materials_en : product.materials_en;
  const care = ar ? product.care_ar || product.care_en : product.care_en;
  const categoryLabel = productCategoryLabel(product.category, lang);

  // Only real images: never repeat one file to fake a gallery.
  const gallery = (product.images || []).filter(Boolean);
  const photos = gallery.length > 0 ? gallery : product.image ? [product.image] : [];

  const currency = (product.currency || "EGP").trim();
  const money = (n: number) => `${n.toLocaleString(locale)} ${ar && currency === "EGP" ? "ج.م" : currency}`;
  const unitPrice = Number(product.price) || 0;
  const chosenDelivery = deliveryIdx !== null ? deliveryOptions[deliveryIdx] : undefined;
  const deliveryCost = chosenDelivery?.cost ?? 0;
  const total = unitPrice * qty + (deliveryCost || 0);
  const isPickup = /pickup|استلام/i.test(chosenDelivery?.method || "");

  const openOrder = (keepSelection = false) => {
    if (!user) {
      toast.error(ar ? "يرجى تسجيل الدخول لإتمام الطلب" : "Please sign in to place an order");
      navigate("/login");
      return;
    }
    if (!keepSelection) {
      setQty(1);
      setChosen({});
    }
    setNote("");
    setAddress("");
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

  const cityName = city ? (ar ? city.name_ar || city.name_en : city.name_en) : null;
  const place = cityName || sellerVillage;
  const eyebrow = [categoryLabel || (ar ? "صناعة يدوية" : "Handmade"), place].filter(Boolean).join(" · ");
  const { first: standfirst, rest } = splitStandfirst(description || "");
  const leadNote = product.made_to_order && product.lead_time_days
    ? ar ? `يُصنع حسب الطلب · جاهز في نحو ${fmtNumber(product.lead_time_days, ar)} أيام` : `Made to order · ready in ~${product.lead_time_days} days`
    : null;
  const weight = product.weight_grams
    ? product.weight_grams >= 1000
      ? `${(product.weight_grams / 1000).toLocaleString(locale)} ${ar ? "كجم" : "kg"}`
      : `${product.weight_grams.toLocaleString(locale)} ${ar ? "جم" : "g"}`
    : null;

  const facts: KeyFact[] = [{ icon: Banknote, label: money(unitPrice) }];
  if (product.made_to_order && product.lead_time_days)
    facts.push({ icon: Clock, label: ar ? `جاهز في نحو ${fmtNumber(product.lead_time_days, ar)} أيام` : `ready in ~${product.lead_time_days} days` });
  else if (product.stock !== null && product.stock !== undefined)
    facts.push({ icon: Package, label: ar ? `المتوفر: ${fmtNumber(product.stock, ar)}` : `In stock: ${product.stock}` });
  if (product.dimensions) facts.push({ icon: Ruler, label: product.dimensions });
  if (place) facts.push({ icon: MapPin, label: place });

  const dlRows = [
    materials && [ar ? "المواد" : "Materials", materials],
    product.dimensions && [ar ? "الأبعاد" : "Dimensions", product.dimensions],
    weight && [ar ? "الوزن" : "Weight", weight],
    care && [ar ? "العناية" : "Care", care],
  ].filter(Boolean) as [string, string][];

  const costLabel = (c: number | null) => (c === null ? (ar ? "حسب الاتفاق" : "On request") : c === 0 ? (ar ? "مجانًا" : "Free") : money(c));
  const orderLabel = ar ? "اطلب" : "Order";
  const msgSeller = sellerId ? () => navigate(`/inbox?personId=${sellerId}&kind=provider`) : undefined;
  const inputCls = "w-full h-12 rounded-xl border border-border bg-background px-4 text-[15px] text-foreground placeholder:text-muted-foreground";
  const areaCls = "w-full rounded-xl border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground";

  const chip = (label: string, o: string) => (
    <button key={o} type="button" onClick={() => setChosen((p) => ({ ...p, [label]: o }))} aria-pressed={chosen[label] === o}
      className={`min-h-[40px] px-4 rounded-full text-sm font-medium border transition-colors ${chosen[label] === o ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}>
      {o}
    </button>
  );
  const variantPickers = variants.map((v) => (
    <div key={v.label} className="mb-3 last:mb-0">
      <p className="text-[13px] font-semibold text-muted-foreground mb-1.5">{v.label}</p>
      <div className="flex flex-wrap gap-2">{v.options.map((o) => chip(v.label, o))}</div>
    </div>
  ));
  const qtyStepper = (
    <div className="flex items-center justify-between py-3">
      <span className="text-[15px] font-semibold text-foreground">{ar ? "الكمية" : "Quantity"}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={ar ? "إنقاص" : "Decrease"} className="tap-target rounded-full border border-border"><Minus className="w-4 h-4" /></button>
        <span className="text-base font-semibold w-6 text-center" aria-live="polite">{fmtNumber(qty, ar)}</span>
        <button type="button" onClick={() => setQty((q) => q + 1)} aria-label={ar ? "زيادة" : "Increase"} className="tap-target rounded-full border border-border"><Plus className="w-4 h-4" /></button>
      </div>
    </div>
  );

  type Mini = { id: string; slug: string | null; name_en: string; name_ar: string | null; image: string | null; price: number; currency?: string | null };
  const cards = (rows: Mini[]) => (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 snap-x">
      {rows.map((r) => {
        const rName = ar ? r.name_ar || r.name_en : r.name_en;
        const rCur = (r.currency || "EGP").trim();
        return (
          <button key={r.id} type="button" onClick={() => navigate(`/product/${r.slug || r.id}`)} className="flex-shrink-0 w-[220px] snap-start text-start">
            <div className="aspect-[3/2] rounded-xl overflow-hidden bg-muted">
              {r.image && <img src={r.image} alt="" loading="lazy" className="w-full h-full object-cover" />}
            </div>
            <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-base mt-2 line-clamp-2 text-foreground`}>{rName}</p>
            <p className="text-[13px] text-muted-foreground">{fmtNumber(Number(r.price || 0), ar)} {ar && rCur === "EGP" ? "ج.م" : rCur}</p>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-[150px] lg:pb-16">
      <ListingHero images={photos} title={name} eyebrow={eyebrow} ar={ar} onBack={() => navigate(-1)} wishlistType="product" wishlistId={product.id} thumbnails />
      <KeyFacts facts={facts} />

      <div className="max-w-[1040px] mx-auto px-4 lg:flex lg:gap-10 lg:justify-center">
        <main className="max-w-[680px] w-full min-w-0">
          <MachineTranslatedNote meta={product.translation_meta} field={ar ? "name_ar" : "name_en"} className="pt-3" />

          {description && (
            <>
              {standfirst && (
                <div className="pt-6 pb-2">
                  <p className={`article-standfirst ${ar ? "lang-ar" : "lang-en"} text-foreground`}>{standfirst}</p>
                </div>
              )}
              {rest ? (
                <Section title={ar ? "عن هذه القطعة" : "About this piece"} ar={ar} className={standfirst ? "" : ""}>
                  <p className="whitespace-pre-line">{rest}</p>
                  <MachineTranslatedNote meta={product.translation_meta} field={ar ? "description_ar" : "description_en"} className="mt-2" />
                </Section>
              ) : (
                <MachineTranslatedNote meta={product.translation_meta} field={ar ? "description_ar" : "description_en"} className="pb-4" />
              )}
            </>
          )}

          {(sellerName || sellerId) && (
            <Section title={ar ? "الحرفي" : "The maker"} ar={ar}>
              <div className="flex items-center gap-4">
                <Avatar src={seller?.avatar || product.seller_image} name={sellerName} className="w-16 h-16 rounded-full flex-shrink-0" />
                <div className="min-w-0">
                  <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground`}>{sellerName || (ar ? "حرفي محلي" : "Local maker")}</p>
                  {sellerVillage && <p className="text-[13px] text-muted-foreground">{sellerVillage}</p>}
                  {providerTagline && <p className="text-[13px] text-muted-foreground line-clamp-2">{providerTagline}</p>}
                </div>
              </div>
              {sellerId ? (
                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={() => navigate(`/provider/${seller?.slug || sellerId}`)} className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground">
                    {ar ? "عرض الملف" : "View profile"}
                  </button>
                  <MessageOwnerButton ownerId={sellerId} kind="provider" variant="chip" label={ar ? "راسل" : "Message"}
                    className="flex-1 h-11 rounded-xl border border-primary text-primary-dark text-sm font-semibold inline-flex items-center justify-center gap-1.5" />
                </div>
              ) : (
                <p className="mt-3 text-[13px] text-muted-foreground">
                  {ar ? "لم ينضم هذا الحرفي إلى التطبيق بعد، لذا لا يمكن مراسلته هنا." : "This maker hasn't joined the app yet, so they can't be messaged here."}
                </p>
              )}
            </Section>
          )}

          {story && (
            <Section title={ar ? "كيف تُصنع" : "How it’s made"} ar={ar}>
              <p className="whitespace-pre-line">{story}</p>
              <MachineTranslatedNote meta={product.translation_meta} field={ar ? "origin_story_ar" : "origin_story_en"} className="mt-2" />
            </Section>
          )}

          {dlRows.length > 0 && (
            <Section title={ar ? "التفاصيل" : "Details"} ar={ar}>
              <dl className="divide-y divide-border">
                {dlRows.map(([k, v]) => (
                  <div key={k} className="py-3 first:pt-0">
                    <dt className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="mt-1 whitespace-pre-line">{v}</dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          {variants.length > 0 && <Section title={ar ? "الخيارات" : "Options"} ar={ar}>{variantPickers}</Section>}

          <Section title={ar ? "الاستلام والتوصيل" : "Pickup & delivery"} ar={ar}>
            {deliveryOptions.length > 0 ? (
              <ul className="divide-y divide-border">
                {deliveryOptions.map((d, i) => (
                  <li key={`${d.method}-${i}`} className="py-3 first:pt-0 flex items-start gap-3">
                    <Truck className="w-5 h-5 text-primary-dark flex-shrink-0 mt-1" aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{d.method} · {costLabel(d.cost)}</p>
                      {d.notes && <p className="text-[13px] text-muted-foreground">{d.notes}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                {ar ? "يتم الاتفاق على الاستلام أو التوصيل مع الحرفي بعد الطلب." : "Pickup or delivery is arranged directly with the maker after you order."}
              </p>
            )}
          </Section>

          {sellerId && fromSeller.length > 0 && <Section title={ar ? "المزيد من هذا الحرفي" : "More from this maker"} ar={ar}>{cards(fromSeller as Mini[])}</Section>}
          {related.length > 0 && (
            <Section title={categoryLabel ? (ar ? `المزيد في ${categoryLabel}` : `More in ${categoryLabel}`) : ar ? "منتجات أخرى" : "Other products"} ar={ar}>
              {cards(related as Mini[])}
            </Section>
          )}

          <ReadBeforeYouGo cityId={product.city_id} regionId={product.region_id} ar={ar} />
        </main>

        <aside className="hidden lg:block w-[320px] flex-shrink-0 pt-6">
          <div className="sticky top-6 rounded-2xl border border-border bg-card shadow-card p-5">
            <p className="text-2xl font-bold text-foreground">{money(unitPrice)}</p>
            {leadNote && <p className="text-[13px] text-muted-foreground mt-1">{leadNote}</p>}
            {variants.length > 0 && <div className="mt-4">{variantPickers}</div>}
            {qtyStepper}
            <button type="button" onClick={() => openOrder(true)} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold">{orderLabel}</button>
            {msgSeller && (
              <button type="button" onClick={msgSeller} className="mt-2 w-full h-11 rounded-xl border border-border text-sm font-semibold">{ar ? "راسل الحرفي" : "Message the maker"}</button>
            )}
          </div>
        </aside>
      </div>

      <ActionBar price={money(unitPrice)} note={leadNote || undefined} buttonLabel={orderLabel} onPrimary={() => openOrder(true)} onMessage={msgSeller} ar={ar} />

      {sheetOpen && (
        <div className="fixed inset-0 z-[60] flex items-end lg:items-center lg:justify-center bg-foreground/40" onClick={() => setSheetOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label={ar ? "إتمام الطلب" : "Place your order"}
            className="w-full lg:max-w-[520px] max-h-[88vh] overflow-y-auto bg-background rounded-t-2xl lg:rounded-2xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] space-y-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground`}>{ar ? "إتمام الطلب" : "Place your order"}</h3>
              <button type="button" onClick={() => setSheetOpen(false)} className="tap-target text-muted-foreground" aria-label={ar ? "إغلاق" : "Close"}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[15px] font-semibold text-foreground line-clamp-2">{name}</p>
            {variantPickers}
            {qtyStepper}
            {deliveryOptions.length > 0 && (
              <div>
                <p className="text-[13px] font-semibold text-muted-foreground mb-1.5">{ar ? "الاستلام / التوصيل" : "Pickup / delivery"}</p>
                <div className="space-y-2">
                  {deliveryOptions.map((d, i) => (
                    <button key={`${d.method}-${i}`} type="button" onClick={() => setDeliveryIdx(i)} aria-pressed={deliveryIdx === i}
                      className={`w-full min-h-[48px] flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-start ${deliveryIdx === i ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
                      <span className="text-[15px] font-medium text-foreground">{d.method}</span>
                      <span className="text-sm font-semibold text-primary-dark shrink-0">{costLabel(d.cost)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chosenDelivery && !isPickup && (
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} aria-label={ar ? "عنوان التوصيل" : "Delivery address"} placeholder={ar ? "عنوان التوصيل" : "Delivery address"} className={areaCls} />
            )}
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} aria-label={ar ? "الاسم" : "Your name"} placeholder={ar ? "الاسم" : "Your name"} className={inputCls} />
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} type="tel" aria-label={ar ? "رقم الهاتف" : "Phone"} placeholder={ar ? "رقم الهاتف (اختياري)" : "Phone (optional)"} className={inputCls} />
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} aria-label={ar ? "ملاحظة للبائع" : "Note for the seller"} placeholder={ar ? "ملاحظة للبائع (اختياري)" : "Note for the seller (optional)"} className={areaCls} />
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-[15px] text-muted-foreground">{ar ? "الإجمالي" : "Total"}</span>
              <span className="text-xl font-bold text-foreground">{money(total)}</span>
            </div>
            <p className="text-[13px] text-muted-foreground">
              {ar ? "سيتم إرسال الطلب كغير مدفوع بانتظار تأكيد البائع، ويتم الدفع لاحقاً." : "The order is sent as unpaid and pending seller confirmation. Payment is handled later."}
            </p>
            <button type="button" disabled={submitting} onClick={submitOrder} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-[15px] disabled:opacity-50">
              {submitting ? (ar ? "جاري الإرسال..." : "Sending...") : ar ? "تأكيد الطلب" : "Confirm order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
