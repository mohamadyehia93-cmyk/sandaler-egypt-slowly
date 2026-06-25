import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/dashboardForms";
import { ArrowLeft, FileText, MapPin, Clock, Users, Calendar, Tag } from "lucide-react";
import { toast } from "sonner";

const sessionTypes = [
  { en: "Storytelling Evening", ar: "أمسية حكايات" },
  { en: "Workshop", ar: "ورشة عمل" },
  { en: "Lecture", ar: "محاضرة" },
  { en: "Walking Tour", ar: "جولة مشي" },
  { en: "Q&A Session", ar: "جلسة أسئلة وأجوبة" },
];

const NewSession = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    date: "",
    time: "",
    duration: "",
    maxSpots: "",
    location: "",
  });

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in first");
      return;
    }
    if (!form.title.trim() || !form.type || !form.date) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      const description = [form.type, form.description.trim()].filter(Boolean).join(" — ");
      const { error } = await supabase.from("meetups").insert({
        organizer_id: user.id,
        title_en: form.title.trim(),
        title_ar: form.title.trim(),
        description_en: description || null,
        description_ar: description || null,
        meetup_date: form.date || null,
        meetup_time: form.time || null,
        location_en: form.location || null,
        location_ar: form.location || null,
        capacity: parseInt(form.maxSpots) || 20,
        slug: slugify(form.title, user.id.slice(0, 6)),
        status: "published",
      });
      if (error) throw error;
      toast.success(lang === "ar" ? "تم نشر الجلسة بنجاح!" : "Session published successfully!");
      navigate("/dashboard/whos-who/my-sessions");
    } catch (err: any) {
      toast.error(err.message || "Failed to create session");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-whos-who/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-whos-who text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "إنشاء جلسة" : "Create Session"}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-whos-who" />{lang === "ar" ? "عنوان الجلسة *" : "Session Title *"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: قصص عن طرق صيد المنزلة" : "e.g. Stories of Manzala fishing routes"} value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={100} />
        </div>

        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-whos-who" />{lang === "ar" ? "الوصف" : "Description"}</label>
          <textarea className={`${inputClass} min-h-[100px] resize-none`} placeholder={lang === "ar" ? "اوصف جلستك..." : "Describe your session..."} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={1000} />
        </div>

        <div>
          <label className={labelClass}><Tag className="w-3.5 h-3.5 text-role-whos-who" />{lang === "ar" ? "نوع الجلسة *" : "Session Type *"}</label>
          <div className="flex flex-wrap gap-2">
            {sessionTypes.map((t, i) => (
              <button key={i} onClick={() => set("type", t.en)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.type === t.en ? "bg-role-whos-who text-white border-role-whos-who" : "bg-card text-foreground border-border"}`}>
                {lang === "ar" ? t.ar : t.en}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><Calendar className="w-3.5 h-3.5 text-role-whos-who" />{lang === "ar" ? "التاريخ *" : "Date *"}</label>
            <input type="date" className={inputClass} value={form.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}><Clock className="w-3.5 h-3.5 text-role-whos-who" />{lang === "ar" ? "الوقت" : "Time"}</label>
            <input type="time" className={inputClass} value={form.time} onChange={(e) => set("time", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><Clock className="w-3.5 h-3.5 text-role-whos-who" />{lang === "ar" ? "المدة (ساعات)" : "Duration (hrs)"}</label>
            <input type="number" className={inputClass} placeholder="2" value={form.duration} onChange={(e) => set("duration", e.target.value)} min="0.5" max="8" />
          </div>
          <div>
            <label className={labelClass}><Users className="w-3.5 h-3.5 text-role-whos-who" />{lang === "ar" ? "عدد المقاعد" : "Max Spots"}</label>
            <input type="number" className={inputClass} placeholder="10" value={form.maxSpots} onChange={(e) => set("maxSpots", e.target.value)} min="1" max="100" />
          </div>
        </div>

        <div>
          <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-role-whos-who" />{lang === "ar" ? "المكان" : "Location"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: بيت السحيمي، القاهرة" : "e.g. Bayt Al-Suhaymi, Cairo"} value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={100} />
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="w-full bg-role-whos-who text-white rounded-xl py-4 font-bold text-sm mt-4 disabled:opacity-60">
          {submitting ? (lang === "ar" ? "جاري النشر..." : "Publishing...") : (lang === "ar" ? "نشر الجلسة" : "Publish Session")}
        </button>
      </div>
    </div>
  );
};

export default NewSession;
