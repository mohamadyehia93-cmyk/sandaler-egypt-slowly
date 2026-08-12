import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { slugify, uploadImages } from "@/lib/dashboardForms";
import { fetchMyProviderId } from "@/lib/providerRecord";
import PhotoPicker from "@/components/dashboard/PhotoPicker";
import CityPicker from "@/components/dashboard/CityPicker";
import BilingualField from "@/components/dashboard/BilingualField";
import AuthorLangToggle from "@/components/dashboard/AuthorLangToggle";
import type { Lang, TranslationMeta } from "@/lib/translation";
import { ArrowLeft, Plus, Trash2, FileText, Image, Tag, MapPin, DollarSign, Package, Ruler, Truck, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { en: "Handmade Jewelry", ar: "مجوهرات يدوية" },
  { en: "Textiles & Weaving", ar: "نسيج وحياكة" },
  { en: "Pottery & Ceramics", ar: "فخار وخزف" },
  { en: "Food & Spices", ar: "طعام وتوابل" },
  { en: "Palm & Wood Crafts", ar: "حرف نخيل وخشب" },
  { en: "Art & Paintings", ar: "فنون ولوحات" },
];

type VariantRow = { labelEn: string; labelAr: string; options: string };
type DeliveryRow = { methodEn: string; methodAr: string; cost: string; notesEn: string; notesAr: string };

const deliveryPresets: DeliveryRow[] = [
  { methodEn: "Pickup from workshop", methodAr: "الاستلام من الورشة", cost: "0", notesEn: "", notesAr: "" },
  { methodEn: "Local delivery", methodAr: "توصيل محلي", cost: "", notesEn: "", notesAr: "" },
  { methodEn: "Shipping within Egypt", methodAr: "شحن داخل مصر", cost: "", notesEn: "", notesAr: "" },
];

const emptyDelivery: DeliveryRow = { methodEn: "", methodAr: "", cost: "", notesEn: "", notesAr: "" };

const NewProduct = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [authorLang, setAuthorLang] = useState<Lang>(lang === "ar" ? "ar" : "en");
  const [meta, setMeta] = useState<TranslationMeta>({});

  const [form, setForm] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    storyEn: "",
    storyAr: "",
    originEn: "",
    originAr: "",
    materialsEn: "",
    materialsAr: "",
    careEn: "",
    careAr: "",
    category: "",
    cityId: "",
    regionId: "",
    price: "",
    currency: "EGP",
    stock: "",
    dimensions: "",
    weightGrams: "",
    madeToOrder: false,
    leadTimeDays: "",
  });
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [delivery, setDelivery] = useState<DeliveryRow[]>([]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast.error(lang === "ar" ? "تعذر تحميل المنتج" : "Could not load product");
        return;
      }
      const row = data as any;
      setForm({
        nameEn: row.name_en || "",
        nameAr: row.name_ar || "",
        descriptionEn: row.description_en || "",
        descriptionAr: row.description_ar || "",
        storyEn: row.origin_story_en || "",
        storyAr: row.origin_story_ar || "",
        originEn: row.seller_village_en || "",
        originAr: row.seller_village_ar || "",
        materialsEn: row.materials_en || "",
        materialsAr: row.materials_ar || "",
        careEn: row.care_en || "",
        careAr: row.care_ar || "",
        category: row.category || "",
        cityId: row.city_id || "",
        regionId: row.region_id || "",
        price: row.price != null ? String(row.price) : "",
        currency: row.currency || "EGP",
        stock: row.stock != null ? String(row.stock) : "",
        dimensions: row.dimensions || "",
        weightGrams: row.weight_grams != null ? String(row.weight_grams) : "",
        madeToOrder: !!row.made_to_order,
        leadTimeDays: row.lead_time_days != null ? String(row.lead_time_days) : "",
      });
      setVariants(
        Array.isArray(row.variants)
          ? row.variants.map((v: any) => ({
              labelEn: v?.label_en || "",
              labelAr: v?.label_ar || "",
              options: Array.isArray(v?.options) ? v.options.join(", ") : String(v?.options || ""),
            }))
          : []
      );
      setDelivery(
        Array.isArray(row.delivery_options)
          ? row.delivery_options.map((d: any) => ({
              methodEn: d?.method_en || "",
              methodAr: d?.method_ar || "",
              cost: d?.cost != null ? String(d.cost) : "",
              notesEn: d?.notes_en || "",
              notesAr: d?.notes_ar || "",
            }))
          : []
      );
      setMeta((row.translation_meta as TranslationMeta) || {});
      setExistingImages(Array.isArray(row.images) ? (row.images as string[]) : row.image ? [row.image] : []);
    })();
  }, [isEdit, id, lang]);

  const set = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));

  const setVariant = (i: number, patch: Partial<VariantRow>) =>
    setVariants((p) => p.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const setDeliveryRow = (i: number, patch: Partial<DeliveryRow>) =>
    setDelivery((p) => p.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  const handleSubmit = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in first");
      return;
    }
    const nameSrc = authorLang === "ar" ? form.nameAr : form.nameEn;
    const descSrc = authorLang === "ar" ? form.descriptionAr : form.descriptionEn;
    // Required-field validation needs ONE language, not both.
    if (!nameSrc.trim() || !descSrc.trim() || !form.category || !form.cityId || !form.price.trim()) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      // ownership convention: products.seller_id holds providers.id
      const providerId = await fetchMyProviderId(user.id);
      if (!providerId) {
        toast.error(lang === "ar" ? "أكمل ملف المزود أولاً" : "Complete your provider profile first");
        setSubmitting(false);
        return;
      }
      const uploaded = await uploadImages(photos, user.id);
      const images = [...existingImages, ...uploaded];

      const variantsJson = variants
        .map((v) => ({
          label_en: v.labelEn.trim() || null,
          label_ar: v.labelAr.trim() || null,
          options: v.options.split(",").map((o) => o.trim()).filter(Boolean),
        }))
        .filter((v) => (v.label_en || v.label_ar) && v.options.length > 0);

      const deliveryJson = delivery
        .map((d) => ({
          method_en: d.methodEn.trim() || null,
          method_ar: d.methodAr.trim() || null,
          cost: d.cost.trim() === "" ? null : Number(d.cost),
          notes_en: d.notesEn.trim() || null,
          notes_ar: d.notesAr.trim() || null,
        }))
        .filter((d) => d.method_en || d.method_ar);

      const payload = {
        seller_id: providerId,
        name_en: form.nameEn.trim() || null,
        name_ar: form.nameAr.trim() || null,
        description_en: form.descriptionEn.trim() || null,
        description_ar: form.descriptionAr.trim() || null,
        // the maker's story — nothing else goes in here
        origin_story_en: form.storyEn.trim() || null,
        origin_story_ar: form.storyAr.trim() || null,
        materials_en: form.materialsEn.trim() || null,
        materials_ar: form.materialsAr.trim() || null,
        care_en: form.careEn.trim() || null,
        care_ar: form.careAr.trim() || null,
        dimensions: form.dimensions.trim() || null,
        weight_grams: form.weightGrams.trim() ? parseInt(form.weightGrams) : null,
        made_to_order: form.madeToOrder,
        lead_time_days: form.madeToOrder && form.leadTimeDays.trim() ? parseInt(form.leadTimeDays) : null,
        variants: variantsJson as any,
        delivery_options: deliveryJson as any,
        currency: form.currency.trim() || "EGP",
        category: form.category,
        city_id: form.cityId || null,
        region_id: form.regionId || null,
        price: parseInt(form.price) || 0,
        stock: parseInt(form.stock) || 0,
        seller_village_en: form.originEn.trim() || null,
        seller_village_ar: form.originAr.trim() || null,
        image: images[0] || null,
        images,
        status: "published",
        translation_meta: meta as any,
      };

      if (isEdit) {
        const { error } = await supabase.from("products").update(payload as any).eq("id", id);
        if (error) throw error;
        toast.success(lang === "ar" ? "تم تحديث المنتج!" : "Product updated!");
      } else {
        const { error } = await supabase
          .from("products")
          .insert({ ...(payload as any), slug: slugify(form.nameEn || form.nameAr, user.id.slice(0, 6)) });
        if (error) throw error;
        toast.success(lang === "ar" ? "تمت إضافة المنتج بنجاح!" : "Product published successfully!");
      }
      navigate("/dashboard/product-seller/my-products");
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-product-seller/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";
  const iconCls = "w-3.5 h-3.5 text-role-product-seller";

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-product-seller text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{isEdit ? (lang === "ar" ? "تعديل المنتج" : "Edit Product") : (lang === "ar" ? "إضافة منتج" : "Add Product")}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        <AuthorLangToggle value={authorLang} onChange={setAuthorLang} />

        <div>
          <label className={labelClass}><Image className={iconCls} />{lang === "ar" ? "صور المنتج" : "Product Photos"}</label>
          <PhotoPicker files={photos} onChange={setPhotos} max={5} hint={lang === "ar" ? "حتى ٥ صور" : "Up to 5 photos"} existing={existingImages} onRemoveExisting={(url) => setExistingImages((p) => p.filter((u) => u !== url))} />
        </div>

        <BilingualField
          fieldEn="name_en" fieldAr="name_ar"
          labelEn="Product Name" labelAr="اسم المنتج"
          required
          icon={<FileText className={iconCls} />}
          valueEn={form.nameEn} valueAr={form.nameAr}
          onChange={({ en, ar }) => setForm((p) => ({ ...p, nameEn: en, nameAr: ar }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="short marketplace product name for an Egyptian handmade craft"
          placeholderEn="e.g. Handmade Fuwwah Carpet" placeholderAr="مثال: سجاد فوة يدوي"
          inputClass={inputClass} labelClass={labelClass}
        />

        <BilingualField
          fieldEn="description_en" fieldAr="description_ar"
          labelEn="Description" labelAr="الوصف"
          required multiline rows={4}
          icon={<FileText className={iconCls} />}
          valueEn={form.descriptionEn} valueAr={form.descriptionAr}
          onChange={({ en, ar }) => setForm((p) => ({ ...p, descriptionEn: en, descriptionAr: ar }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="product description for an Egyptian handmade craft listing"
          placeholderEn="Describe your product..." placeholderAr="اوصف المنتج بالتفصيل..."
          inputClass={inputClass} labelClass={labelClass}
        />

        <div>
          <label className={labelClass}><Tag className={iconCls} />{lang === "ar" ? "الفئة *" : "Category *"}</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => (
              <button key={i} onClick={() => set("category", cat.en)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.category === cat.en ? "bg-role-product-seller text-white border-role-product-seller" : "bg-card text-foreground border-border"}`}>
                {lang === "ar" ? cat.ar : cat.en}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className={labelClass}><DollarSign className={iconCls} />{lang === "ar" ? "السعر *" : "Price *"}</label>
            <input type="number" className={inputClass} placeholder="250" value={form.price} onChange={(e) => set("price", e.target.value)} min="0" />
          </div>
          <div>
            <label className={labelClass}>{lang === "ar" ? "العملة" : "Currency"}</label>
            <input className={inputClass} value={form.currency} onChange={(e) => set("currency", e.target.value)} maxLength={8} />
          </div>
          <div>
            <label className={labelClass}><Package className={iconCls} />{lang === "ar" ? "المخزون" : "Stock"}</label>
            <input type="number" className={inputClass} placeholder="10" value={form.stock} onChange={(e) => set("stock", e.target.value)} min="0" />
          </div>
        </div>

        <CityPicker
          cityId={form.cityId}
          onChange={(cityId, regionId) => setForm((p) => ({ ...p, cityId, regionId }))}
          required
          labelEn="Main city (listed under)"
          labelAr="المدينة الرئيسية (يُدرج تحتها)"
          iconClass={iconCls}
          inputClass={inputClass}
          labelClass={labelClass}
        />

        <BilingualField
          fieldEn="seller_village_en" fieldAr="seller_village_ar"
          labelEn="Origin / Made In" labelAr="مكان الصنع"
          icon={<MapPin className={iconCls} />}
          valueEn={form.originEn} valueAr={form.originAr}
          onChange={({ en, ar }) => setForm((p) => ({ ...p, originEn: en, originAr: ar }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="the Egyptian town or village where a handmade product was made"
          placeholderEn="e.g. Fuwwah, Kafr El-Sheikh" placeholderAr="مثال: فوة، كفر الشيخ"
          inputClass={inputClass} labelClass={labelClass}
        />

        {/* MAKER'S STORY — prose only */}
        <div>
          <BilingualField
            fieldEn="origin_story_en" fieldAr="origin_story_ar"
            labelEn="The maker's story" labelAr="قصة الصانع"
            multiline rows={4} manualOnly
            icon={<Sparkles className={iconCls} />}
            valueEn={form.storyEn} valueAr={form.storyAr}
            onChange={({ en, ar }) => setForm((p) => ({ ...p, storyEn: en, storyAr: ar }))}
            meta={meta} onMetaChange={setMeta}
            authorLang={authorLang}
            context="the personal story of the Egyptian artisan and craft tradition behind a handmade product"
            placeholderEn="Who makes this, where, and what tradition it comes from..."
            placeholderAr="من يصنعها، وأين، وما التقليد الذي تنتمي إليه..."
            inputClass={inputClass} labelClass={labelClass}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            {lang === "ar"
              ? "قصة الصانع والحرفة فقط — المواد والمقاسات والشحن لها حقول خاصة أدناه."
              : "The story of the maker and the craft only — materials, size and delivery have their own fields below."}
          </p>
        </div>

        {/* SPECS */}
        <BilingualField
          fieldEn="materials_en" fieldAr="materials_ar"
          labelEn="Materials" labelAr="المواد"
          icon={<Ruler className={iconCls} />}
          valueEn={form.materialsEn} valueAr={form.materialsAr}
          onChange={({ en, ar }) => setForm((p) => ({ ...p, materialsEn: en, materialsAr: ar }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="the materials a handmade Egyptian craft product is made from"
          placeholderEn="e.g. Egyptian cotton, olive wood" placeholderAr="مثال: قطن مصري، خشب زيتون"
          inputClass={inputClass} labelClass={labelClass}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{lang === "ar" ? "الأبعاد" : "Dimensions"}</label>
            <input className={inputClass} placeholder="40 × 25 cm" value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} maxLength={60} />
          </div>
          <div>
            <label className={labelClass}>{lang === "ar" ? "الوزن (جرام)" : "Weight (grams)"}</label>
            <input type="number" className={inputClass} placeholder="800" value={form.weightGrams} onChange={(e) => set("weightGrams", e.target.value)} min="0" />
          </div>
        </div>

        <BilingualField
          fieldEn="care_en" fieldAr="care_ar"
          labelEn="Care instructions" labelAr="إرشادات العناية"
          multiline rows={3}
          icon={<Sparkles className={iconCls} />}
          valueEn={form.careEn} valueAr={form.careAr}
          onChange={({ en, ar }) => setForm((p) => ({ ...p, careEn: en, careAr: ar }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="care and cleaning instructions for a handmade textile or pottery item"
          placeholderEn="e.g. Hand wash cold, dry flat in shade" placeholderAr="مثال: يُغسل يدوياً بماء بارد، ويُجفف في الظل"
          inputClass={inputClass} labelClass={labelClass}
        />

        {/* MADE TO ORDER */}
        <div className="rounded-xl border border-border bg-card p-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-current text-role-product-seller" checked={form.madeToOrder} onChange={(e) => set("madeToOrder", e.target.checked)} />
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5"><Clock className={iconCls} />{lang === "ar" ? "يُصنع حسب الطلب" : "Made to order"}</span>
          </label>
          {form.madeToOrder && (
            <div className="mt-3">
              <label className={labelClass}>{lang === "ar" ? "مدة التنفيذ (أيام)" : "Lead time (days)"}</label>
              <input type="number" className={inputClass} placeholder="7" value={form.leadTimeDays} onChange={(e) => set("leadTimeDays", e.target.value)} min="0" />
            </div>
          )}
        </div>

        {/* VARIANTS */}
        <div>
          <label className={labelClass}><Tag className={iconCls} />{lang === "ar" ? "الخيارات (مثل المقاس أو اللون)" : "Variants (e.g. Size or Colour)"}</label>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-2">
                <div className="flex gap-2">
                  <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "الاسم بالإنجليزية (Size)" : "Name in English (Size)"} value={v.labelEn} onChange={(e) => setVariant(i, { labelEn: e.target.value })} maxLength={40} />
                  <button onClick={() => setVariants((p) => p.filter((_, idx) => idx !== i))} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
                <input className={inputClass} dir="rtl" placeholder="الاسم بالعربية (المقاس)" value={v.labelAr} onChange={(e) => setVariant(i, { labelAr: e.target.value })} maxLength={40} />
                <input className={inputClass} placeholder={lang === "ar" ? "الخيارات مفصولة بفاصلة: S, M, L" : "Options, comma separated: S, M, L"} value={v.options} onChange={(e) => setVariant(i, { options: e.target.value })} maxLength={200} />
              </div>
            ))}
            <button onClick={() => setVariants((p) => [...p, { labelEn: "", labelAr: "", options: "" }])} className="flex items-center gap-1 text-xs font-medium text-role-product-seller">
              <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة خيار" : "Add variant"}
            </button>
          </div>
        </div>

        {/* DELIVERY */}
        <div>
          <label className={labelClass}><Truck className={iconCls} />{lang === "ar" ? "خيارات الاستلام والتوصيل" : "Pickup & delivery options"}</label>
          {delivery.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {deliveryPresets.map((p, i) => (
                <button key={i} onClick={() => setDelivery((prev) => [...prev, { ...p }])} className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card text-foreground">
                  + {lang === "ar" ? p.methodAr : p.methodEn}
                </button>
              ))}
            </div>
          )}
          <div className="space-y-3">
            {delivery.map((d, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-2">
                <div className="flex gap-2">
                  <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "الطريقة بالإنجليزية" : "Method in English"} value={d.methodEn} onChange={(e) => setDeliveryRow(i, { methodEn: e.target.value })} maxLength={60} />
                  <button onClick={() => setDelivery((p) => p.filter((_, idx) => idx !== i))} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
                <input className={inputClass} dir="rtl" placeholder="الطريقة بالعربية" value={d.methodAr} onChange={(e) => setDeliveryRow(i, { methodAr: e.target.value })} maxLength={60} />
                <input type="number" className={inputClass} placeholder={lang === "ar" ? `التكلفة (${form.currency})` : `Cost (${form.currency})`} value={d.cost} onChange={(e) => setDeliveryRow(i, { cost: e.target.value })} min="0" />
                <input className={inputClass} placeholder={lang === "ar" ? "ملاحظات بالإنجليزية" : "Notes in English"} value={d.notesEn} onChange={(e) => setDeliveryRow(i, { notesEn: e.target.value })} maxLength={120} />
                <input className={inputClass} dir="rtl" placeholder="ملاحظات بالعربية" value={d.notesAr} onChange={(e) => setDeliveryRow(i, { notesAr: e.target.value })} maxLength={120} />
              </div>
            ))}
            <button onClick={() => setDelivery((p) => [...p, { ...emptyDelivery }])} className="flex items-center gap-1 text-xs font-medium text-role-product-seller">
              <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة طريقة" : "Add option"}
            </button>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="w-full bg-role-product-seller text-white rounded-xl py-4 font-bold text-sm mt-4 disabled:opacity-60">
          {submitting ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") : isEdit ? (lang === "ar" ? "حفظ التغييرات" : "Save Changes") : (lang === "ar" ? "نشر المنتج" : "Publish Product")}
        </button>
      </div>
    </div>
  );
};

export default NewProduct;
