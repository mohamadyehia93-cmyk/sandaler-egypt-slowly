import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, FileText, MapPin, Tag, AlertTriangle, Image } from "lucide-react";
import { toast } from "sonner";

const issueTypes = [
  { en: "Quality Concern", ar: "مشكلة جودة" },
  { en: "Safety Issue", ar: "مشكلة أمان" },
  { en: "Misrepresentation", ar: "معلومات مضللة" },
  { en: "Provider Inactive", ar: "مزود غير نشط" },
  { en: "Visitor Complaint", ar: "شكوى زائر" },
  { en: "Other", ar: "أخرى" },
];

const priorityLevels = [
  { en: "Low", ar: "منخفضة", color: "bg-success" },
  { en: "Medium", ar: "متوسطة", color: "bg-warning" },
  { en: "High", ar: "عالية", color: "bg-destructive" },
];

const NewFlagReport = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    issueType: "",
    priority: "",
    providerName: "",
    location: "",
    description: "",
    actionTaken: "",
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase.from("flag_reports").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast.error(lang === "ar" ? "تعذر تحميل البلاغ" : "Could not load report");
        return;
      }
      setForm({
        issueType: data.issue_type || "",
        priority: data.priority || "",
        providerName: data.provider_name || "",
        location: data.location || "",
        description: data.description || "",
        actionTaken: data.action_taken || "",
      });
    })();
  }, [isEdit, id, lang]);

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in first");
      return;
    }
    if (!form.issueType || !form.priority || !form.description.trim()) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        reporter_id: user.id,
        issue_type: form.issueType,
        priority: form.priority,
        provider_name: form.providerName || null,
        location: form.location || null,
        description: form.description.trim(),
        action_taken: form.actionTaken || null,
      };
      if (isEdit) {
        const { error } = await supabase.from("flag_reports").update(payload).eq("id", id);
        if (error) throw error;
        toast.success(lang === "ar" ? "تم تحديث البلاغ!" : "Report updated!");
      } else {
        const { error } = await supabase.from("flag_reports").insert(payload);
        if (error) throw error;
        toast.success(lang === "ar" ? "تم إرسال البلاغ بنجاح!" : "Report submitted successfully!");
      }
      navigate("/dashboard/ambassador/my-tasks");
    } catch (err: any) {
      toast.error(err.message || "Failed to save report");
    } finally {
      setSubmitting(false);
    }
  };




  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-ambassador/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-ambassador text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{isEdit ? (lang === "ar" ? "تعديل البلاغ" : "Edit Report") : (lang === "ar" ? "إبلاغ عن مشكلة" : "Flag Issue")}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        <div>
          <label className={labelClass}><Tag className="w-3.5 h-3.5 text-role-ambassador" />{lang === "ar" ? "نوع المشكلة *" : "Issue Type *"}</label>
          <div className="flex flex-wrap gap-2">
            {issueTypes.map((t, i) => (
              <button key={i} onClick={() => set("issueType", t.en)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.issueType === t.en ? "bg-role-ambassador text-white border-role-ambassador" : "bg-card text-foreground border-border"}`}>
                {lang === "ar" ? t.ar : t.en}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}><AlertTriangle className="w-3.5 h-3.5 text-role-ambassador" />{lang === "ar" ? "الأولوية *" : "Priority *"}</label>
          <div className="flex gap-2">
            {priorityLevels.map((p, i) => (
              <button key={i} onClick={() => set("priority", p.en)} className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${form.priority === p.en ? "bg-role-ambassador text-white border-role-ambassador" : "bg-card text-foreground border-border"}`}>
                <span className={`w-2 h-2 rounded-full ${p.color}`} />
                {lang === "ar" ? p.ar : p.en}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-ambassador" />{lang === "ar" ? "اسم المزود" : "Provider Name"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: أم فاطمة — طبخ دلتا" : "e.g. Om Fatma — Delta Cooking"} value={form.providerName} onChange={(e) => set("providerName", e.target.value)} maxLength={100} />
        </div>

        <div>
          <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-role-ambassador" />{lang === "ar" ? "الموقع" : "Location"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: المنزلة، الدقهلية" : "e.g. Manzala, Dakahlia"} value={form.location} onChange={(e) => set("location", e.target.value)} maxLength={100} />
        </div>

        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-ambassador" />{lang === "ar" ? "وصف المشكلة *" : "Issue Description *"}</label>
          <textarea className={`${inputClass} min-h-[120px] resize-none`} placeholder={lang === "ar" ? "اوصف المشكلة بالتفصيل..." : "Describe the issue in detail..."} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} />
        </div>

        <div>
          <label className={labelClass}>{lang === "ar" ? "الإجراء المتخذ" : "Action Taken (if any)"}</label>
          <textarea className={`${inputClass} min-h-[80px] resize-none`} placeholder={lang === "ar" ? "ما الذي فعلته حتى الآن..." : "What have you done so far..."} value={form.actionTaken} onChange={(e) => set("actionTaken", e.target.value)} maxLength={500} />
        </div>

        <div>
          <label className={labelClass}><Image className="w-3.5 h-3.5 text-role-ambassador" />{lang === "ar" ? "صور مرفقة" : "Attach Photos"}</label>
          <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 bg-card">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{lang === "ar" ? "اختياري — أدلة مرئية" : "Optional — visual evidence"}</span>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="w-full bg-role-ambassador text-white rounded-xl py-4 font-bold text-sm mt-4 disabled:opacity-60">
          {submitting ? (lang === "ar" ? "جاري الإرسال..." : "Submitting...") : (lang === "ar" ? "إرسال البلاغ" : "Submit Report")}
        </button>
      </div>
    </div>
  );
};

export default NewFlagReport;
