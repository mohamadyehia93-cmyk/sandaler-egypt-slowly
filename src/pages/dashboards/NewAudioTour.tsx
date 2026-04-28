import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, FileText, MapPin, Clock, Tag, Languages, DollarSign, Plus, Trash2, Mic, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const themes = [
  { en: "History", ar: "تاريخ" },
  { en: "Food", ar: "طعام" },
  { en: "Architecture", ar: "عمارة" },
  { en: "Crafts", ar: "حِرف" },
  { en: "Spiritual", ar: "روحاني" },
  { en: "Nature", ar: "طبيعة" },
];

const NewAudioTour = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    theme: "",
    duration: "",
    price: "",
    languages: [] as string[],
    coverImage: "",
  });

  const [stops, setStops] = useState<{ name: string; desc_en: string; desc_ar: string }[]>([
    { name: "", desc_en: "", desc_ar: "" },
  ]);

  const set = (key: string, value: string | string[]) => setForm((p) => ({ ...p, [key]: value }));

  const toggleLang = (l: string) => {
    setForm((p) => ({
      ...p,
      languages: p.languages.includes(l) ? p.languages.filter((x) => x !== l) : [...p.languages, l],
    }));
  };

  const addStop = () => setStops((s) => [...s, { name: "", desc_en: "", desc_ar: "" }]);
  const removeStop = (i: number) => setStops((s) => s.filter((_, idx) => idx !== i));
  const updateStop = (i: number, key: "name" | "desc_en" | "desc_ar", v: string) =>
    setStops((s) => s.map((stop, idx) => (idx === i ? { ...stop, [key]: v } : stop)));

  const handleSubmit = () => {
    if (!form.title.trim() || !form.city.trim() || !form.theme || stops.length === 0 || !stops[0].name.trim()) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة وإضافة محطة واحدة على الأقل" : "Please fill required fields and add at least one stop");
      return;
    }
    toast.success(lang === "ar" ? "تم إنشاء الجولة الصوتية بنجاح!" : "Audio tour created successfully!");
    navigate("/dashboard/narrator/my-tours");
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-narrator/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-narrator text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "جولة صوتية جديدة" : "New Audio Tour"}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "عنوان الجولة *" : "Tour Title *"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: حواري الخان وأسرارها" : "e.g. Khan Alleys & Their Secrets"} value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={100} />
        </div>

        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "وصف الجولة" : "Tour Description"}</label>
          <textarea className={`${inputClass} min-h-[100px] resize-none`} placeholder={lang === "ar" ? "صف ما سيسمعه المستمع..." : "Describe what the listener will hear..."} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={1000} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "المدينة *" : "City *"}</label>
            <input className={inputClass} placeholder={lang === "ar" ? "القاهرة" : "Cairo"} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}><Clock className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "المدة (د)" : "Duration (min)"}</label>
            <input type="number" className={inputClass} placeholder="45" value={form.duration} onChange={(e) => set("duration", e.target.value)} min="5" max="240" />
          </div>
        </div>

        <div>
          <label className={labelClass}><Tag className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "الموضوع *" : "Theme *"}</label>
          <div className="flex flex-wrap gap-2">
            {themes.map((t, i) => (
              <button key={i} onClick={() => set("theme", t.en)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.theme === t.en ? "bg-role-narrator text-white border-role-narrator" : "bg-card text-foreground border-border"}`}>
                {lang === "ar" ? t.ar : t.en}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}><Languages className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "لغات السرد" : "Narration Languages"}</label>
          <div className="flex flex-wrap gap-2">
            {[{ k: "ar", l: lang === "ar" ? "العربية" : "Arabic" }, { k: "en", l: lang === "ar" ? "الإنجليزية" : "English" }, { k: "fr", l: lang === "ar" ? "الفرنسية" : "French" }].map((o) => (
              <button key={o.k} onClick={() => toggleLang(o.k)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.languages.includes(o.k) ? "bg-role-narrator text-white border-role-narrator" : "bg-card text-foreground border-border"}`}>
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}><DollarSign className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "السعر (ج.م)" : "Price (EGP)"}</label>
          <input type="number" className={inputClass} placeholder="0 = مجاني / Free" value={form.price} onChange={(e) => set("price", e.target.value)} min="0" />
          <p className="text-[10px] text-muted-foreground mt-1">{lang === "ar" ? "تحتفظ بـ 85% من السعر" : "You keep 85% of the price"}</p>
        </div>

        <div>
          <label className={labelClass}><ImageIcon className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "صورة الغلاف" : "Cover Image"}</label>
          <button className="w-full border-2 border-dashed border-border rounded-xl py-6 text-xs text-muted-foreground hover:border-role-narrator transition-colors">
            {lang === "ar" ? "اضغط لرفع صورة" : "Tap to upload image"}
          </button>
        </div>

        {/* Stops */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "محطات الجولة *" : "Tour Stops *"}</label>
            <button onClick={addStop} className="text-[10px] font-semibold text-role-narrator flex items-center gap-1">
              <Plus className="w-3 h-3" /> {lang === "ar" ? "إضافة محطة" : "Add stop"}
            </button>
          </div>
          <div className="space-y-3">
            {stops.map((s, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-role-narrator">{lang === "ar" ? `المحطة ${i + 1}` : `Stop ${i + 1}`}</span>
                  {stops.length > 1 && (
                    <button onClick={() => removeStop(i)} className="text-destructive p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input className={inputClass} placeholder={lang === "ar" ? "اسم المكان" : "Place name"} value={s.name} onChange={(e) => updateStop(i, "name", e.target.value)} />
                <textarea className={`${inputClass} min-h-[60px] resize-none`} placeholder={lang === "ar" ? "ما سيقال هنا..." : "What's narrated here..."} value={s.description} onChange={(e) => updateStop(i, "description", e.target.value)} maxLength={300} />
                <button className="w-full text-[10px] font-semibold text-role-narrator border border-dashed border-role-narrator/40 rounded-lg py-2 flex items-center justify-center gap-1">
                  <Mic className="w-3 h-3" /> {lang === "ar" ? "رفع تسجيل صوتي" : "Upload audio recording"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} className="w-full bg-role-narrator text-white rounded-xl py-4 font-bold text-sm mt-4">
          {lang === "ar" ? "نشر الجولة" : "Publish Tour"}
        </button>
      </div>
    </div>
  );
};

export default NewAudioTour;
