import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Upload, Plus, Trash2, FileText, Image, Tag, MapPin, DollarSign, Package } from "lucide-react";
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

  const handleSubmit = () => {
    if (!form.name.trim() || !form.description.trim() || !form.category || !form.price.trim()) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }
    toast.success(lang === "ar" ? "تمت إضافة المنتج بنجاح!" : "Product added successfully!");
    navigate("/dashboard/product-seller");
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-product-seller/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-product-seller text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "إضافة منتج" : "Add Product"}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        <div>
          <label className={labelClass}><Image className="w-3.5 h-3.5 text-role-product-seller" />{lang === "ar" ? "صور المنتج" : "Product Photos"}</label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 bg-card">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{lang === "ar" ? "حتى ٥ صور" : "Up to 5 photos"}</span>
          </div>
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

        <button onClick={handleSubmit} className="w-full bg-role-product-seller text-white rounded-xl py-4 font-bold text-sm mt-4">
          {lang === "ar" ? "نشر المنتج" : "Publish Product"}
        </button>
      </div>
    </div>
  );
};

export default NewProduct;
