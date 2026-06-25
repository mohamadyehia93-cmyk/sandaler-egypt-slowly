import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { slugify, uploadImages } from "@/lib/dashboardForms";
import PhotoPicker from "@/components/dashboard/PhotoPicker";
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
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    theme: "",
    duration: "",
    price: "",
    languages: [] as string[],
  });

  const [stops, setStops] = useState<{ name: string; desc_en: string; desc_ar: string }[]>([
    { name: "", desc_en: "", desc_ar: "" },
  ]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase.from("audio_tours").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast.error(lang === "ar" ? "تعذر تحميل الجولة" : "Could not load tour");
        return;
      }
      setForm({
        title: data.title_en || "",
        description: data.description_en || "",
        city: data.city_id || "",
        theme: "",
        duration: data.duration_minutes != null ? String(data.duration_minutes) : "",
        price: data.price != null ? String(data.price) : "",
        languages: Array.isArray(data.languages) ? (data.languages as string[]) : [],
      });
      const dbStops = Array.isArray(data.stops) ? (data.stops as any[]) : [];
      setStops(dbStops.length ? dbStops.map((s: any) => ({ name: s.label_en || "", desc_en: s.desc_en || "", desc_ar: s.desc_ar || "" })) : [{ name: "", desc_en: "", desc_ar: "" }]);
      setExistingImages(data.image ? [data.image] : []);
    })();
  }, [isEdit, id, lang]);

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

  const handleSubmit = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in first");
      return;
    }
    if (!form.title.trim() || !form.city.trim() || (!isEdit && !form.theme) || stops.length === 0 || !stops[0].name.trim()) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة وإضافة محطة واحدة على الأقل" : "Please fill required fields and add at least one stop");
      return;
    }
    setSubmitting(true);
    try {
      const uploaded = await uploadImages(photos, user.id);
      const images = [...existingImages, ...uploaded];
      const cleanStops = stops
        .filter((s) => s.name.trim())
        .map((s) => ({ label_en: s.name.trim(), label_ar: s.name.trim(), desc_en: s.desc_en.trim(), desc_ar: s.desc_ar.trim() }));

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      const payload = {
        creator_id: user.id,
        title_en: form.title.trim(),
        title_ar: form.title.trim(),
        description_en: form.description.trim() || null,
        description_ar: form.description.trim() || null,
        city_id: form.city.trim(),
        duration_minutes: parseInt(form.duration) || 30,
        stops_count: cleanStops.length,
        stops: cleanStops,
        price: parseInt(form.price) || 0,
        languages: form.languages.length > 0 ? form.languages : ["ar"],
        narrator_name_en: profile?.display_name || null,
        narrator_name_ar: profile?.display_name || null,
        narrator_image: profile?.avatar_url || null,
        image: images[0] || null,
        status: "published",
      };

      if (isEdit) {
        const { error } = await supabase.from("audio_tours").update(payload).eq("id", id);
        if (error) throw error;
        toast.success(lang === "ar" ? "تم تحديث الجولة!" : "Audio tour updated!");
      } else {
        const { error } = await supabase.from("audio_tours").insert({ ...payload, slug: slugify(form.title, user.id.slice(0, 6)) });
        if (error) throw error;
        toast.success(lang === "ar" ? "تم نشر الجولة الصوتية بنجاح!" : "Audio tour published successfully!");
      }
      navigate("/dashboard/narrator/my-tours");
    } catch (err: any) {
      toast.error(err.message || "Failed to save audio tour");
    } finally {
      setSubmitting(false);
    }
  };


  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-narrator/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-narrator text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{isEdit ? (lang === "ar" ? "تعديل الجولة" : "Edit Audio Tour") : (lang === "ar" ? "جولة صوتية جديدة" : "New Audio Tour")}</h1>
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
          <PhotoPicker files={photos} onChange={setPhotos} max={1} hint={lang === "ar" ? "اضغط لرفع صورة" : "Tap to upload image"} existing={existingImages} onRemoveExisting={(url) => setExistingImages((p) => p.filter((u) => u !== url))} />
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
                <textarea dir="ltr" className={`${inputClass} min-h-[56px] resize-none`} placeholder="Short description (English) — what the visitor sees/hears here" value={s.desc_en} onChange={(e) => updateStop(i, "desc_en", e.target.value)} maxLength={200} />
                <textarea dir="rtl" className={`${inputClass} min-h-[56px] resize-none text-right`} placeholder="وصف مختصر (عربي) — ما يراه الزائر ويسمعه هنا" value={s.desc_ar} onChange={(e) => updateStop(i, "desc_ar", e.target.value)} maxLength={200} />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="w-full bg-role-narrator text-white rounded-xl py-4 font-bold text-sm mt-4 disabled:opacity-60">
          {submitting ? (lang === "ar" ? "جاري النشر..." : "Publishing...") : (lang === "ar" ? "نشر الجولة" : "Publish Tour")}
        </button>
      </div>
    </div>
  );
};

export default NewAudioTour;
