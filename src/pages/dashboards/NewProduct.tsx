import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { slugify, uploadImages } from "@/lib/dashboardForms";
import { fetchMyProviderId } from "@/lib/providerRecord";
import PhotoPicker from "@/components/dashboard/PhotoPicker";
import BilingualField from "@/components/dashboard/BilingualField";
import AuthorLangToggle from "@/components/dashboard/AuthorLangToggle";
import type { Lang, TranslationMeta } from "@/lib/translation";
import { ArrowLeft, Plus, Trash2, FileText, Image, Tag, MapPin, DollarSign, Package } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { en: "Handmade Jewelry", ar: "مجوهرات يدوية" },
  { en: "Textiles & Weaving", ar: "نسيج وحياكة" },
  { en: "Pottery & Ceramics", ar: "فخار وخزف" },
  { en: "Food & Spices", ar: "طعام وتوابل" },
  { en: "Palm & Wood Crafts", ar: "حرف نخيل وخشب" },
  { en: "Art & Paintings", ar: "فنون ولوحات" },
];

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
    originEn: "",
    originAr: "",
    category: "",
    cityId: "",
    regionId: "",
    price: "",
    stock: "",
    material: "",
    dimensions: "",
    shippingOptions: [""],
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast.error(lang === "ar" ? "تعذر تحميل المنتج" : "Could not load product");
        return;
      }
      setForm({
        nameEn: data.name_en || "",
        nameAr: data.name_ar || "",
        descriptionEn: data.description_en || "",
        descriptionAr: data.description_ar || "",
        originEn: data.seller_village_en || "",
        originAr: data.seller_village_ar || "",
        category: data.category || "",
        cityId: data.city_id || "",
        regionId: data.region_id || "",
        price: data.price != null ? String(data.price) : "",
        stock: data.stock != null ? String(data.stock) : "",
        material: "",
        dimensions: "",
        shippingOptions: data.origin_story_en ? data.origin_story_en.split(" · ").filter(Boolean) : [""],
      });
      setMeta(((data as any).translation_meta as TranslationMeta) || {});
      setExistingImages(Array.isArray(data.images) ? (data.images as string[]) : data.image ? [data.image] : []);
    })();
  }, [isEdit, id, lang]);

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));


  const updateShipping = (idx: number, value: string) => {
    setForm((p) => {
      const arr = [...p.shippingOptions];
      arr[idx] = value;
      return { ...p, shippingOptions: arr };
    });
  };
  const addShipping = () => setForm((p) => ({ ...p, shippingOptions: [...p.shippingOptions, ""] }));
  const removeShipping = (idx: number) => setForm((p) => ({ ...p, shippingOptions: p.shippingOptions.filter((_, i) => i !== idx) }));

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
      const originStory = [form.material && `${lang === "ar" ? "المادة" : "Material"}: ${form.material}`, form.dimensions && `${lang === "ar" ? "الأبعاد" : "Dimensions"}: ${form.dimensions}`, ...form.shippingOptions.filter(Boolean)]
        .filter(Boolean)
        .join(" · ");

      const payload = {
        seller_id: providerId,
        name_en: form.nameEn.trim(),
        name_ar: form.nameAr.trim(),
        description_en: form.descriptionEn.trim(),
        description_ar: form.descriptionAr.trim(),
        // composite spec line — stored only in the language it was written in
        origin_story_en: (authorLang === "en" ? originStory : null) || null,
        origin_story_ar: (authorLang === "ar" ? originStory : null) || null,
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
        const { error } = await supabase.from("products").update(payload).eq("id", id);
        if (error) throw error;
        toast.success(lang === "ar" ? "تم تحديث المنتج!" : "Product updated!");
      } else {
        const { error } = await supabase.from("products").insert({ ...payload, slug: slugify(form.nameEn || form.nameAr, user.id.slice(0, 6)) });
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

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-product-seller text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{isEdit ? (lang === "ar" ? "تعديل المنتج" : "Edit Product") : (lang === "ar" ? "إضافة منتج" : "Add Product")}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        <AuthorLangToggle value={authorLang} onChange={setAuthorLang} />

        <div>
          <label className={labelClass}><Image className="w-3.5 h-3.5 text-role-product-seller" />{lang === "ar" ? "صور المنتج" : "Product Photos"}</label>
          <PhotoPicker files={photos} onChange={setPhotos} max={5} hint={lang === "ar" ? "حتى ٥ صور" : "Up to 5 photos"} existing={existingImages} onRemoveExisting={(url) => setExistingImages((p) => p.filter((u) => u !== url))} />
        </div>

        <BilingualField
          fieldEn="name_en" fieldAr="name_ar"
          labelEn="Product Name" labelAr="اسم المنتج"
          required
          icon={<FileText className="w-3.5 h-3.5 text-role-product-seller" />}
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
          icon={<FileText className="w-3.5 h-3.5 text-role-product-seller" />}
          valueEn={form.descriptionEn} valueAr={form.descriptionAr}
          onChange={({ en, ar }) => setForm((p) => ({ ...p, descriptionEn: en, descriptionAr: ar }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="product description for an Egyptian handmade craft listing"
          placeholderEn="Describe your product..." placeholderAr="اوصف المنتج بالتفصيل..."
          inputClass={inputClass} labelClass={labelClass}
        />


        <div>
          <label className={labelClass}><Tag className="w-3.5 h-3.5 text-role-product-seller" />{lang === "ar" ? "الفئة *" : "Category *"}</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => (
              <button key={i} onClick={() => set("category", cat.en)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.category === cat.en ? "bg-role-product-seller text-white border-role-product-seller" : "bg-card text-foreground border-border"}`}>
                {lang === "ar" ? cat.ar : cat.en}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><DollarSign className="w-3.5 h-3.5 text-role-product-seller" />{lang === "ar" ? "السعر (ج.م) *" : "Price (EGP) *"}</label>
            <input type="number" className={inputClass} placeholder="250" value={form.price} onChange={(e) => set("price", e.target.value)} min="0" />
          </div>
          <div>
            <label className={labelClass}><Package className="w-3.5 h-3.5 text-role-product-seller" />{lang === "ar" ? "المخزون" : "Stock"}</label>
            <input type="number" className={inputClass} placeholder="10" value={form.stock} onChange={(e) => set("stock", e.target.value)} min="0" />
          </div>
        </div>

        <BilingualField
          fieldEn="seller_village_en" fieldAr="seller_village_ar"
          labelEn="Origin / Made In" labelAr="مكان الصنع"
          icon={<MapPin className="w-3.5 h-3.5 text-role-product-seller" />}
          valueEn={form.originEn} valueAr={form.originAr}
          onChange={({ en, ar }) => setForm((p) => ({ ...p, originEn: en, originAr: ar }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="the Egyptian town or village where a handmade product was made"
          placeholderEn="e.g. Fuwwah, Kafr El-Sheikh" placeholderAr="مثال: فوة، كفر الشيخ"
          inputClass={inputClass} labelClass={labelClass}
        />


        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{lang === "ar" ? "المادة" : "Material"}</label>
            <input className={inputClass} placeholder={lang === "ar" ? "قطن، خشب..." : "Cotton, wood..."} value={form.material} onChange={(e) => set("material", e.target.value)} maxLength={50} />
          </div>
          <div>
            <label className={labelClass}>{lang === "ar" ? "الأبعاد" : "Dimensions"}</label>
            <input className={inputClass} placeholder="30×40 cm" value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} maxLength={30} />
          </div>
        </div>

        <div>
          <label className={labelClass}>{lang === "ar" ? "خيارات الشحن/الاستلام" : "Shipping / Pickup Options"}</label>
          <div className="space-y-2">
            {form.shippingOptions.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "مثال: استلام من الورشة" : "e.g. Pickup from workshop"} value={opt} onChange={(e) => updateShipping(i, e.target.value)} maxLength={80} />
                {form.shippingOptions.length > 1 && <button onClick={() => removeShipping(i)} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>}
              </div>
            ))}
            <button onClick={addShipping} className="flex items-center gap-1 text-xs font-medium text-role-product-seller"><Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة خيار" : "Add option"}</button>
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
