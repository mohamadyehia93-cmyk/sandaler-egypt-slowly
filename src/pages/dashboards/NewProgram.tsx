import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Upload, Plus, Trash2, FileText, Image, Tag, MapPin, Calendar, Users, Heart } from "lucide-react";
import { toast } from "sonner";

const programTypes = [
  { en: "Volunteering", ar: "تطوع" },
  { en: "Education", ar: "تعليم" },
  { en: "Environmental", ar: "بيئي" },
  { en: "Cultural Preservation", ar: "حفظ ثقافي" },
  { en: "Community Development", ar: "تنمية مجتمعية" },
];

const NewProgram = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    location: "",
    startDate: "",
    endDate: "",
    volunteersNeeded: "",
    goals: [""],
    donationTarget: "",
  });

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const updateGoal = (idx: number, value: string) => {
    setForm((p) => { const arr = [...p.goals]; arr[idx] = value; return { ...p, goals: arr }; });
  };
  const addGoal = () => setForm((p) => ({ ...p, goals: [...p.goals, ""] }));
  const removeGoal = (idx: number) => setForm((p) => ({ ...p, goals: p.goals.filter((_, i) => i !== idx) }));

  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim() || !form.type) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }
    toast.success(lang === "ar" ? "تم إنشاء البرنامج بنجاح!" : "Program created successfully!");
    navigate("/dashboard/organization");
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-organization/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-organization text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "إضافة برنامج" : "Add Program"}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        <div>
          <label className={labelClass}><Image className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "صور البرنامج" : "Program Photos"}</label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 bg-card">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{lang === "ar" ? "حتى ٣ صور" : "Up to 3 photos"}</span>
          </div>
        </div>

        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "اسم البرنامج *" : "Program Name *"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: حملة تنظيف بحيرة البرلس" : "e.g. Lake Burullus Cleanup Campaign"} value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={100} />
        </div>

        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "الوصف *" : "Description *"}</label>
          <textarea className={`${inputClass} min-h-[100px] resize-none`} placeholder={lang === "ar" ? "اوصف البرنامج..." : "Describe the program..."} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} />
        </div>

        <div>
          <label className={labelClass}><Tag className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "النوع *" : "Type *"}</label>
          <div className="flex flex-wrap gap-2">
            {programTypes.map((t, i) => (
              <button key={i} onClick={() => set("type", t.en)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.type === t.en ? "bg-role-organization text-white border-role-organization" : "bg-card text-foreground border-border"}`}>
                {lang === "ar" ? t.ar : t.en}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "الموقع" : "Location"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: طنطا، الغربية" : "e.g. Tanta, Gharbia"} value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={100} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><Calendar className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "تاريخ البدء" : "Start Date"}</label>
            <input type="date" className={inputClass} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}><Calendar className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "تاريخ الانتهاء" : "End Date"}</label>
            <input type="date" className={inputClass} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><Users className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "متطوعون مطلوبون" : "Volunteers Needed"}</label>
            <input type="number" className={inputClass} placeholder="20" value={form.volunteersNeeded} onChange={(e) => set("volunteersNeeded", e.target.value)} min="0" />
          </div>
          <div>
            <label className={labelClass}><Heart className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "هدف التبرعات (ج.م)" : "Donation Goal (EGP)"}</label>
            <input type="number" className={inputClass} placeholder="5000" value={form.donationTarget} onChange={(e) => set("donationTarget", e.target.value)} min="0" />
          </div>
        </div>

        <div>
          <label className={labelClass}>{lang === "ar" ? "أهداف البرنامج" : "Program Goals"}</label>
          <div className="space-y-2">
            {form.goals.map((g, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "هدف..." : "Goal..."} value={g} onChange={(e) => updateGoal(i, e.target.value)} maxLength={100} />
                {form.goals.length > 1 && <button onClick={() => removeGoal(i)} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>}
              </div>
            ))}
            <button onClick={addGoal} className="flex items-center gap-1 text-xs font-medium text-role-organization"><Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة هدف" : "Add goal"}</button>
          </div>
        </div>

        <button onClick={handleSubmit} className="w-full bg-role-organization text-white rounded-xl py-4 font-bold text-sm mt-4">
          {lang === "ar" ? "نشر البرنامج" : "Publish Program"}
        </button>
      </div>
    </div>
  );
};

export default NewProgram;
