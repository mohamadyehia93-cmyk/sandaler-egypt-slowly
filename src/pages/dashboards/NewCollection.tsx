import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { slugify, uploadImages } from "@/lib/dashboardForms";
import PhotoPicker from "@/components/dashboard/PhotoPicker";
import { ArrowLeft, Plus, Trash2, FileText, Image, Tag, MapPin, BookOpen } from "lucide-react";
import { toast } from "sonner";

const disciplines = [
  { en: "History", ar: "تاريخ" },
  { en: "Archaeology", ar: "آثار" },
  { en: "Ecology", ar: "بيئة" },
  { en: "Anthropology", ar: "أنثروبولوجيا" },
  { en: "Architecture", ar: "عمارة" },
  { en: "Linguistics", ar: "لغويات" },
  { en: "Marine Biology", ar: "أحياء بحرية" },
];

const NewCollection = () => {
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
    abstract: "",
    discipline: "",
    region: "",
    entries: [{ title: "", summary: "" }],
    references: [""],
    license: "cc-by",
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase.from("collections").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast.error(lang === "ar" ? "تعذر تحميل المجموعة" : "Could not load collection");
        return;
      }
      const entries = Array.isArray(data.entries) ? (data.entries as any[]) : [];
      const refs = Array.isArray(data.refs) ? (data.refs as any[]) : [];
      setForm({
        title: data.title_en || "",
        abstract: data.abstract_en || "",
        discipline: data.discipline || "",
        region: data.region_id || "",
        entries: entries.length ? entries.map((e: any) => ({ title: e.title || "", summary: e.summary || "" })) : [{ title: "", summary: "" }],
        references: refs.length ? refs.map((r: any) => String(r)) : [""],
        license: data.license || "cc-by",
      });
      setExistingImages(data.cover_image ? [data.cover_image] : []);
    })();
  }, [isEdit, id, lang]);

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));


  const updateEntry = (idx: number, field: "title" | "summary", value: string) => {
    setForm((p) => { const arr = [...p.entries]; arr[idx] = { ...arr[idx], [field]: value }; return { ...p, entries: arr }; });
  };
  const addEntry = () => setForm((p) => ({ ...p, entries: [...p.entries, { title: "", summary: "" }] }));
  const removeEntry = (idx: number) => setForm((p) => ({ ...p, entries: p.entries.filter((_, i) => i !== idx) }));

  const updateRef = (idx: number, value: string) => {
    setForm((p) => { const arr = [...p.references]; arr[idx] = value; return { ...p, references: arr }; });
  };
  const addRef = () => setForm((p) => ({ ...p, references: [...p.references, ""] }));
  const removeRef = (idx: number) => setForm((p) => ({ ...p, references: p.references.filter((_, i) => i !== idx) }));

  const handleSubmit = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in first");
      return;
    }
    if (!form.title.trim() || !form.abstract.trim() || !form.discipline) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      const uploaded = await uploadImages(photos, user.id);
      const images = [...existingImages, ...uploaded];
      const entries = form.entries.filter((e) => e.title.trim()).map((e) => ({ title: e.title.trim(), summary: e.summary.trim() }));
      const refs = form.references.map((r) => r.trim()).filter(Boolean);

      const payload = {
        expert_id: user.id,
        title_en: form.title.trim(),
        title_ar: form.title.trim(),
        abstract_en: form.abstract.trim(),
        abstract_ar: form.abstract.trim(),
        discipline: form.discipline,
        region_id: form.region || null,
        cover_image: images[0] || null,
        entries,
        refs,
        license: form.license,
        status: "published",
      };

      if (isEdit) {
        const { error } = await supabase.from("collections").update(payload).eq("id", id);
        if (error) throw error;
        toast.success(lang === "ar" ? "تم تحديث المجموعة!" : "Collection updated!");
      } else {
        const { error } = await supabase.from("collections").insert({ ...payload, slug: slugify(form.title, user.id.slice(0, 6)) });
        if (error) throw error;
        toast.success(lang === "ar" ? "تم نشر المجموعة بنجاح!" : "Collection published successfully!");
      }
      navigate("/dashboard/subject-expert/my-collections");
    } catch (err: any) {
      toast.error(err.message || "Failed to save collection");
    } finally {
      setSubmitting(false);
    }
  };


  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-subject-expert/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-subject-expert text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{isEdit ? (lang === "ar" ? "تعديل المجموعة" : "Edit Collection") : (lang === "ar" ? "مجموعة جديدة" : "New Collection")}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        <div>
          <label className={labelClass}><Image className="w-3.5 h-3.5 text-role-subject-expert" />{lang === "ar" ? "صورة الغلاف" : "Cover Image"}</label>
          <PhotoPicker files={photos} onChange={setPhotos} max={1} hint={lang === "ar" ? "صورة غلاف المجموعة" : "Collection cover image"} existing={existingImages} onRemoveExisting={(url) => setExistingImages((p) => p.filter((u) => u !== url))} />
        </div>

        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-subject-expert" />{lang === "ar" ? "عنوان المجموعة *" : "Collection Title *"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: التراث المعماري لرشيد" : "e.g. Architectural Heritage of Rosetta"} value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={120} />
        </div>

        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-subject-expert" />{lang === "ar" ? "الملخص *" : "Abstract *"}</label>
          <textarea className={`${inputClass} min-h-[120px] resize-none`} placeholder={lang === "ar" ? "ملخص أكاديمي للمجموعة..." : "Academic abstract for the collection..."} value={form.abstract} onChange={(e) => set("abstract", e.target.value)} maxLength={2000} />
          <span className="text-[10px] text-muted-foreground mt-1 block text-right">{form.abstract.length}/2000</span>
        </div>

        <div>
          <label className={labelClass}><Tag className="w-3.5 h-3.5 text-role-subject-expert" />{lang === "ar" ? "التخصص *" : "Discipline *"}</label>
          <div className="flex flex-wrap gap-2">
            {disciplines.map((d, i) => (
              <button key={i} onClick={() => set("discipline", d.en)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.discipline === d.en ? "bg-role-subject-expert text-white border-role-subject-expert" : "bg-card text-foreground border-border"}`}>
                {lang === "ar" ? d.ar : d.en}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-role-subject-expert" />{lang === "ar" ? "المنطقة" : "Region"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: دلتا النيل" : "e.g. Nile Delta"} value={form.region} onChange={(e) => set("region", e.target.value)} maxLength={80} />
        </div>

        {/* Collection Entries */}
        <div>
          <label className={labelClass}><BookOpen className="w-3.5 h-3.5 text-role-subject-expert" />{lang === "ar" ? "عناصر المجموعة" : "Collection Entries"}</label>
          <div className="space-y-3">
            {form.entries.map((entry, i) => (
              <div key={i} className="bg-card rounded-xl p-3 space-y-2 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-role-subject-expert">{lang === "ar" ? `عنصر ${i + 1}` : `Entry ${i + 1}`}</span>
                  {form.entries.length > 1 && <button onClick={() => removeEntry(i)} className="text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>
                <input className={inputClass} placeholder={lang === "ar" ? "عنوان العنصر" : "Entry title"} value={entry.title} onChange={(e) => updateEntry(i, "title", e.target.value)} maxLength={100} />
                <textarea className={`${inputClass} min-h-[60px] resize-none`} placeholder={lang === "ar" ? "ملخص مختصر..." : "Brief summary..."} value={entry.summary} onChange={(e) => updateEntry(i, "summary", e.target.value)} maxLength={500} />
              </div>
            ))}
            <button onClick={addEntry} className="flex items-center gap-1 text-xs font-medium text-role-subject-expert"><Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة عنصر" : "Add entry"}</button>
          </div>
        </div>

        {/* References */}
        <div>
          <label className={labelClass}>{lang === "ar" ? "المراجع" : "References"}</label>
          <div className="space-y-2">
            {form.references.map((ref, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "مرجع أكاديمي..." : "Academic reference..."} value={ref} onChange={(e) => updateRef(i, e.target.value)} maxLength={200} />
                {form.references.length > 1 && <button onClick={() => removeRef(i)} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>}
              </div>
            ))}
            <button onClick={addRef} className="flex items-center gap-1 text-xs font-medium text-role-subject-expert"><Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة مرجع" : "Add reference"}</button>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="w-full bg-role-subject-expert text-white rounded-xl py-4 font-bold text-sm mt-4 disabled:opacity-60">
          {submitting ? (lang === "ar" ? "جاري النشر..." : "Publishing...") : (lang === "ar" ? "نشر المجموعة" : "Publish Collection")}
        </button>
      </div>
    </div>
  );
};

export default NewCollection;
