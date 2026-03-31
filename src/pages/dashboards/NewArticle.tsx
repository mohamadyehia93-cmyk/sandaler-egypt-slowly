import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Upload, Plus, Trash2, FileText, Image, Tag, MapPin, Mic } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { en: "Heritage & History", ar: "تراث وتاريخ" },
  { en: "Food & Recipes", ar: "طعام ووصفات" },
  { en: "Craftsmanship", ar: "حرف يدوية" },
  { en: "Nature & Environment", ar: "طبيعة وبيئة" },
  { en: "Oral Traditions", ar: "تقاليد شفهية" },
  { en: "Architecture", ar: "عمارة" },
  { en: "Festivals & Events", ar: "مهرجانات وفعاليات" },
];

const NewArticle = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "",
    location: "",
    tags: [""],
    hasAudio: false,
  });

  const set = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));

  const updateTag = (idx: number, value: string) => {
    setForm((p) => {
      const arr = [...p.tags];
      arr[idx] = value;
      return { ...p, tags: arr };
    });
  };

  const addTag = () => setForm((p) => ({ ...p, tags: [...p.tags, ""] }));
  const removeTag = (idx: number) => setForm((p) => ({ ...p, tags: p.tags.filter((_, i) => i !== idx) }));

  const handleSubmit = () => {
    if (!form.title.trim() || !form.body.trim() || !form.category) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }
    toast.success(lang === "ar" ? "تم نشر المقال بنجاح!" : "Article published successfully!");
    navigate("/dashboard/culture-actor");
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-culture-actor/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-culture-actor text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "مقال جديد" : "New Article"}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        {/* Cover Image */}
        <div>
          <label className={labelClass}><Image className="w-3.5 h-3.5 text-role-culture-actor" />{lang === "ar" ? "صورة الغلاف" : "Cover Image"}</label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 bg-card">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{lang === "ar" ? "اسحب أو اضغط للرفع" : "Drag or tap to upload"}</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-culture-actor" />{lang === "ar" ? "العنوان *" : "Title *"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "عنوان مقالك..." : "Your article title..."} value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={120} />
        </div>

        {/* Body */}
        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-culture-actor" />{lang === "ar" ? "المحتوى *" : "Content *"}</label>
          <textarea className={`${inputClass} min-h-[180px] resize-none`} placeholder={lang === "ar" ? "اكتب مقالك هنا..." : "Write your article here..."} value={form.body} onChange={(e) => set("body", e.target.value)} maxLength={5000} />
          <span className="text-[10px] text-muted-foreground mt-1 block text-right">{form.body.length}/5000</span>
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}><Tag className="w-3.5 h-3.5 text-role-culture-actor" />{lang === "ar" ? "الفئة *" : "Category *"}</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, i) => (
              <button key={i} onClick={() => set("category", cat.en)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.category === cat.en ? "bg-role-culture-actor text-white border-role-culture-actor" : "bg-card text-foreground border-border"}`}>
                {lang === "ar" ? cat.ar : cat.en}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-role-culture-actor" />{lang === "ar" ? "الموقع" : "Location"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: رشيد، البحيرة" : "e.g. Rosetta, Beheira"} value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={100} />
        </div>

        {/* Tags */}
        <div>
          <label className={labelClass}><Tag className="w-3.5 h-3.5 text-role-culture-actor" />{lang === "ar" ? "وسوم" : "Tags"}</label>
          <div className="space-y-2">
            {form.tags.map((tag, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "مثال: تراث" : "e.g. heritage"} value={tag} onChange={(e) => updateTag(i, e.target.value)} maxLength={30} />
                {form.tags.length > 1 && <button onClick={() => removeTag(i)} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>}
              </div>
            ))}
            <button onClick={addTag} className="flex items-center gap-1 text-xs font-medium text-role-culture-actor"><Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة وسم" : "Add tag"}</button>
          </div>
        </div>

        {/* Audio toggle */}
        <div className="flex items-center justify-between bg-card rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-role-culture-actor" />
            <span className="text-sm font-medium text-foreground">{lang === "ar" ? "إضافة سرد صوتي" : "Add Audio Narration"}</span>
          </div>
          <button onClick={() => set("hasAudio", !form.hasAudio)} className={`w-10 h-6 rounded-full relative transition-colors ${form.hasAudio ? "bg-role-culture-actor" : "bg-border"}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.hasAudio ? "right-0.5" : "left-0.5"}`} />
          </button>
        </div>

        <button onClick={handleSubmit} className="w-full bg-role-culture-actor text-white rounded-xl py-4 font-bold text-sm mt-4">
          {lang === "ar" ? "نشر المقال" : "Publish Article"}
        </button>
      </div>
    </div>
  );
};

export default NewArticle;
