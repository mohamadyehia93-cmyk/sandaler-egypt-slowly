import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";
import MessageOwnerButton from "@/components/MessageOwnerButton";
import NotFoundView from "@/components/NotFound";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { findProgramAction } from "@/lib/programActions";
import { useI18n } from "@/lib/i18n";

/**
 * One page for all four program actions. Volunteer and consult insert a real
 * volunteer_applications row (org_owner_id and status are set by the insert
 * trigger, never by the client). Donate and gift have no payment path, so they
 * state that plainly and offer messaging instead of a fake receipt.
 */
const ProgramSupport = () => {
  const { id, action } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["program", id],
    queryFn: () => fetchByIdOrSlug("programs", id as string),
    enabled: !!id,
  });

  const config = findProgramAction(action);
  if (!config) return <NotFoundView context="program" />;
  if (isLoading) return <div className="min-h-screen bg-background p-4 space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (!data) return <NotFoundView context="program" />;

  const program = data as any;
  const title = lang === "ar" ? (program.title_ar || program.title_en) : program.title_en;
  const ownerId: string | null = program.owner_id ?? null;
  const isConsult = config.key === "consult";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = lang === "ar" ? "مطلوب" : "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = lang === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email";
    if (phone.trim().length < 8) e.phone = lang === "ar" ? "رقم غير صالح" : "Invalid number";
    if (message.trim().length < 10) e.message = lang === "ar" ? "10 أحرف على الأقل" : "At least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please sign in first");
      navigate("/login");
      return;
    }
    if (!validate()) return;
    setSubmitting(true);
    const { error } = await supabase.from("volunteer_applications").insert({
      program_id: program.id,
      applicant_id: user.id,
      full_name: fullName.trim(),
      contact_email: email.trim(),
      contact_phone: phone.trim(),
      availability: availability || null,
      message: `${config.label.en}: ${message.trim()}`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(lang === "ar" ? "تعذر إرسال الطلب" : "Could not submit your request");
      return;
    }
    toast.success(lang === "ar" ? "تم إرسال طلبك" : "Your request was sent");
    setSent(true);
  };

  const inputClass = (key: string) =>
    `w-full rounded-xl border-2 bg-card p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground ${
      errors[key] ? "border-destructive" : "border-border focus:border-primary"
    }`;

  return (
    <div className="min-h-screen bg-surface pb-16">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <button onClick={() => navigate(`/program/${id}`)} className="rounded-full p-1.5 hover:bg-secondary" aria-label={lang === "ar" ? "رجوع" : "Back"}>
          <ArrowLeft className="h-5 w-5 text-foreground rtl:rotate-180" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{config.label[lang]}</h1>
      </header>

      <div className="px-4 pt-5 space-y-5">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          {program.image && <img src={program.image} alt="" className="h-14 w-14 rounded-lg object-cover" />}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">{config.desc[lang]}</p>
          </div>
        </div>

        {!ownerId ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {lang === "ar"
                ? "لا توجد جهة يمكنها استقبال هذا الطلب لهذا البرنامج حالياً."
                : "No organisation can currently receive this request for this program."}
            </p>
          </div>
        ) : !config.submits ? (
          <>
            <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {lang === "ar"
                  ? "لا يوجد حتى الآن مسار دفع أو تسليم داخل التطبيق لهذا النوع من الدعم. يمكنك التنسيق مباشرة مع المنظمة عبر الرسائل، ولن يُسجَّل أي تبرع في التطبيق."
                  : "There is no in-app payment or delivery path for this kind of support yet. You can arrange it directly with the organisation through messages — nothing is charged or recorded in the app."}
              </p>
            </div>
            <MessageOwnerButton ownerId={ownerId} kind="auto" label={lang === "ar" ? "مراسلة المنظمة" : "Message organization"} />
          </>
        ) : sent ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-primary" />
            <p className="text-sm font-bold text-foreground">{lang === "ar" ? "تم إرسال طلبك" : "Your request was sent"}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {lang === "ar"
                ? "ستتواصل معك المنظمة عبر الرسائل داخل التطبيق أو بيانات الاتصال التي أدخلتها."
                : "The organisation will reply through in-app messages or the contact details you provided."}
            </p>
            <button onClick={() => navigate(`/program/${id}`)} className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
              {lang === "ar" ? "رجوع للبرنامج" : "Back to program"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">{lang === "ar" ? "الاسم الكامل" : "Full Name"} *</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} className={inputClass("fullName")} placeholder={lang === "ar" ? "أدخل اسمك" : "Enter your name"} />
              {errors.fullName && <p className="mt-1 text-[10px] text-destructive">{errors.fullName}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">{lang === "ar" ? "البريد الإلكتروني" : "Email"} *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className={inputClass("email")} placeholder="example@email.com" />
              {errors.email && <p className="mt-1 text-[10px] text-destructive">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">{lang === "ar" ? "رقم الهاتف" : "Phone Number"} *</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className={inputClass("phone")} placeholder="+20 1xx xxx xxxx" />
              {errors.phone && <p className="mt-1 text-[10px] text-destructive">{errors.phone}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                {isConsult ? (lang === "ar" ? "التوفر (اختياري)" : "Availability (optional)") : (lang === "ar" ? "تاريخ البدء المفضل" : "Preferred start date")}
              </label>
              <input type="date" value={availability} onChange={(e) => setAvailability(e.target.value)} className={inputClass("availability")} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                {isConsult ? (lang === "ar" ? "خبرتك وكيف يمكنك المساعدة" : "Your expertise and how you can help") : (lang === "ar" ? "لماذا تريد التطوع؟" : "Why do you want to volunteer?")} *
              </label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={4} className={`${inputClass("message")} resize-none`} placeholder={lang === "ar" ? "اكتب هنا..." : "Tell the organisation more..."} />
              {errors.message && <p className="mt-1 text-[10px] text-destructive">{errors.message}</p>}
            </div>
            <button onClick={handleSubmit} disabled={submitting} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {submitting ? (lang === "ar" ? "جارٍ الإرسال..." : "Sending...") : (lang === "ar" ? "إرسال الطلب" : "Send request")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramSupport;
