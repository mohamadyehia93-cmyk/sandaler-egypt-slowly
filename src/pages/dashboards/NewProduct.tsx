import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { slugify, uploadImages } from "@/lib/dashboardForms";
import PhotoPicker from "@/components/dashboard/PhotoPicker";
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

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    origin: "",
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
        name: data.name_en || "",
        description: data.description_en || "",
        category: data.category || "",
        price: data.price != null ? String(data.price) : "",
        stock: data.stock != null ? String(data.stock) : "",
        origin: data.seller_village_en || "",
        material: "",
        dimensions: "",
        shippingOptions: data.origin_story_en ? data.origin_story_en.split(" · ").filter(Boolean) : [""],
      });
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
    if (!form.name.trim() || !form.description.trim() || !form.category || !form.price.trim()) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      const uploaded = await uploadImages(photos, user.id);
      const images = [...existingImages, ...uploaded];
      const originStory = [form.material && `${lang === "ar" ? "المادة" : "Material"}: ${form.material}`, form.dimensions && `${lang === "ar" ? "الأبعاد" : "Dimensions"}: ${form.dimensions}`, ...form.shippingOptions.filter(Boolean)]
        .filter(Boolean)
        .join(" · ");

      const payload = {
        seller_id: user.id,
        name_en: form.name.trim(),
        name_ar: form.name.trim(),
        description_en: form.description.trim(),
        description_ar: form.description.trim(),
        origin_story_en: originStory || null,
        origin_story_ar: originStory || null,
        category: form.category,
        price: parseInt(form.price) || 0,
        stock: parseInt(form.stock) || 0,
        seller_village_en: form.origin || null,
        seller_village_ar: form.origin || null,
        image: images[0] || null,
        images,
        status: "published",
      };

      if (isEdit) {
        const { error } = await supabase.from("products").update(payload).eq("id", id);
        if (error) throw error;
        toast.success(lang === "ar" ? "تم تحديث المنتج!" : "Product updated!");
      } else {
        const { error } = await supabase.from("products").insert({ ...payload, slug: slugify(form.name, user.id.slice(0, 6)) });
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
        <div>
          <label className={labelClass}><Image className="w-3.5 h-3.5 text-role-product-seller" />{lang === "ar" ? "صور المنتج" : "Product Photos"}</label>
          <PhotoPicker files={photos} onChange={setPhotos} max={5} hint={lang === "ar" ? "حتى ٥ صور" : "Up to 5 photos"} existing={existingImages} onRemoveExisting={(url) => setExistingImages((p) => p.filter((u) => u !== url))} />
        </div>

        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-product-seller" />{lang === "ar" ? "اسم المنتج *" : "Product Name *"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: سجاد فوة يدوي" : "e.g. Handmade Fuwwah Carpet"} value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={100} />
        </div>

        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-product-seller" />{lang === "ar" ? "الوصف *" : "Description *"}</label>
          <textarea className={`${inputClass} min-h-[100px] resize-none`} placeholder={lang === "ar" ? "اوصف المنتج بالتفصيل..." : "Describe your product..."} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={1000} />
          <span className="text-[10px] text-muted-foreground mt-1 block text-right">{form.description.length}/1000</span>
        </div>

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

        <div>
          <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-role-product-seller" />{lang === "ar" ? "مكان الصنع" : "Origin / Made In"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: فوة، كفر الشيخ" : "e.g. Fuwwah, Kafr El-Sheikh"} value={form.origin} onChange={(e) => set("origin", e.target.value)} maxLength={100} />
        </div>

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
