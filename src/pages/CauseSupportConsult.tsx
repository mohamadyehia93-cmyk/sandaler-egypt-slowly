import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Briefcase, Clock, Calendar, Send, CheckCircle2, ChevronRight, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { causes } from "@/lib/sampleData";
import { useState } from "react";

const expertiseAreas = [
  { emoji: "💼", area: { en: "Business Strategy", ar: "استراتيجية الأعمال" }, desc: { en: "Help with fundraising, planning, and organizational growth", ar: "مساعدة في جمع التبرعات والتخطيط والنمو المؤسسي" } },
  { emoji: "📊", area: { en: "Marketing & Communications", ar: "التسويق والاتصالات" }, desc: { en: "Branding, social media, and outreach campaigns", ar: "العلامة التجارية ووسائل التواصل والحملات" } },
  { emoji: "⚖️", area: { en: "Legal & Compliance", ar: "القانون والامتثال" }, desc: { en: "NGO registration, contracts, and regulatory guidance", ar: "تسجيل المنظمات والعقود والإرشاد التنظيمي" } },
  { emoji: "💻", area: { en: "Technology & Digital", ar: "التكنولوجيا والرقمنة" }, desc: { en: "Websites, apps, data systems, and digital tools", ar: "مواقع، تطبيقات، أنظمة بيانات وأدوات رقمية" } },
  { emoji: "🏗️", area: { en: "Engineering & Design", ar: "الهندسة والتصميم" }, desc: { en: "Infrastructure, architecture, and sustainable design", ar: "البنية التحتية والعمارة والتصميم المستدام" } },
  { emoji: "🩺", area: { en: "Healthcare & Wellness", ar: "الصحة والعافية" }, desc: { en: "Medical advice, health programs, and wellness initiatives", ar: "الاستشارات الطبية وبرامج الصحة ومبادرات العافية" } },
];

const consultFormats = [
  { id: "virtual", icon: MessageCircle, label: { en: "Virtual Meeting", ar: "اجتماع افتراضي" }, desc: { en: "30-60 min video call", ar: "مكالمة فيديو 30-60 دقيقة" } },
  { id: "mentorship", icon: Calendar, label: { en: "Ongoing Mentorship", ar: "إرشاد مستمر" }, desc: { en: "Monthly sessions for 3-6 months", ar: "جلسات شهرية لمدة 3-6 أشهر" } },
  { id: "project", icon: Briefcase, label: { en: "Project-Based", ar: "مبني على مشروع" }, desc: { en: "Dedicated support for a specific initiative", ar: "دعم مخصص لمبادرة محددة" } },
];

type Step = "browse" | "form" | "review" | "success";

const CauseSupportConsult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();

  const cause = causes.find((c) => c.id === id);

  const [step, setStep] = useState<Step>("browse");
  const [selectedExpertise, setSelectedExpertise] = useState<number[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!cause) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  const toggleExpertise = (i: number) => {
    setSelectedExpertise((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  };

  const canProceedToBrowse = selectedExpertise.length > 0 && selectedFormat;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = lang === "ar" ? "مطلوب" : "Required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = lang === "ar" ? "بريد غير صالح" : "Invalid email";
    if (!phone.trim() || phone.trim().length < 8) e.phone = lang === "ar" ? "رقم غير صالح" : "Invalid number";
    if (!yearsExp) e.yearsExp = lang === "ar" ? "مطلوب" : "Required";
    if (!availability) e.availability = lang === "ar" ? "مطلوب" : "Required";
    if (!message.trim() || message.trim().length < 10) e.message = lang === "ar" ? "10 أحرف على الأقل" : "At least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmitForm = () => {
    if (!validate()) return;
    setStep("review");
  };

  const handleConfirm = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setStep("success"); }, 2000);
  };

  const handleBack = () => {
    if (step === "form") setStep("browse");
    else if (step === "review") setStep("form");
    else navigate(-1);
  };

  const stepTitles: Record<Step, { en: string; ar: string }> = {
    browse: { en: "Consult", ar: "استشارة" },
    form: { en: "Your Details", ar: "بياناتك" },
    review: { en: "Review", ar: "مراجعة" },
    success: { en: "Request Sent!", ar: "تم الإرسال!" },
  };

  const fmt = consultFormats.find((f) => f.id === selectedFormat);

  return (
    <div className="min-h-screen bg-surface pb-28">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        {step !== "success" && (
          <button onClick={handleBack} className="p-1.5 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        <h1 className="text-lg font-bold text-foreground">{stepTitles[step][lang]}</h1>
        {step !== "success" && step !== "browse" && (
          <div className="flex gap-1.5 ms-auto">
            {(["form", "review"] as Step[]).map((s, i) => (
              <div key={s} className={`w-2 h-2 rounded-full transition-colors ${
                s === step ? "bg-primary" : (["form", "review"].indexOf(step) > i ? "bg-primary/40" : "bg-border")
              }`} />
            ))}
          </div>
        )}
      </header>

      <div className="px-4 pt-5">
        {/* ── STEP 1: Browse & Select ── */}
        {step === "browse" && (
          <>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card border border-border mb-5">
              <img src={cause.image} alt={cause.title[lang]} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{cause.title[lang]}</p>
                <p className="text-xs text-muted-foreground">{cause.category[lang]}</p>
              </div>
            </div>

            <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <MessageCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-foreground">
                  {lang === "ar" ? "شارك خبرتك المهنية" : "Share Your Professional Expertise"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {lang === "ar"
                  ? "ساعد المنظمة بخبرتك المهنية واجعل تأثيراً دائماً بدون تكلفة مالية"
                  : "Help the organization with your expertise and make a lasting impact at no financial cost"}
              </p>
            </div>

            {/* Expertise Areas */}
            <h2 className="text-base font-bold text-foreground mb-1">
              {lang === "ar" ? "مجالات الخبرة المطلوبة" : "Expertise Areas Needed"}
            </h2>
            <p className="text-[10px] text-muted-foreground mb-3">{lang === "ar" ? "اختر مجالاً واحداً أو أكثر" : "Select one or more areas"}</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {expertiseAreas.map((area, i) => {
                const isSelected = selectedExpertise.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleExpertise(i)}
                    className={`p-3 rounded-xl border-2 text-start transition-colors relative ${
                      isSelected ? "border-primary bg-primary/5" : "border-border bg-card shadow-card"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 end-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                    <span className="text-xl block mb-1.5">{area.emoji}</span>
                    <p className="text-xs font-semibold text-foreground">{area.area[lang]}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{area.desc[lang]}</p>
                  </button>
                );
              })}
            </div>

            {/* Consultation Format */}
            <h2 className="text-base font-bold text-foreground mb-1">
              {lang === "ar" ? "صيغة الاستشارة" : "Consultation Format"}
            </h2>
            <p className="text-[10px] text-muted-foreground mb-3">{lang === "ar" ? "اختر صيغة واحدة" : "Choose one format"}</p>
            <div className="space-y-2 mb-6">
              {consultFormats.map((f) => {
                const isSelected = selectedFormat === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFormat(f.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-start transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "border-border bg-card shadow-card"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{f.label[lang]}</p>
                      <p className="text-xs text-muted-foreground">{f.desc[lang]}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* How It Works */}
            <h2 className="text-base font-bold text-foreground mb-3">
              {lang === "ar" ? "كيف يعمل" : "How It Works"}
            </h2>
            <div className="space-y-2 mb-6">
              {[
                { step: "1", text: { en: "Select your area of expertise and preferred format", ar: "اختر مجال خبرتك والصيغة المفضلة" } },
                { step: "2", text: { en: "We match you with the organization's needs", ar: "نطابقك مع احتياجات المنظمة" } },
                { step: "3", text: { en: "Schedule an introductory call", ar: "حدد موعد مكالمة تعارف" } },
                { step: "4", text: { en: "Begin your consultation and track impact", ar: "ابدأ استشارتك وتابع التأثير" } },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-foreground">{s.step}</span>
                  </div>
                  <span className="text-xs text-foreground">{s.text[lang]}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── STEP 2: Form ── */}
        {step === "form" && (
          <>
            {/* Selected summary */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 mb-5">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedExpertise.map((i) => (
                  <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {expertiseAreas[i].emoji} {expertiseAreas[i].area[lang]}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">{fmt?.label[lang]} · {fmt?.desc[lang]}</p>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">{lang === "ar" ? "الاسم الكامل" : "Full Name"} *</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100}
                  placeholder={lang === "ar" ? "أدخل اسمك" : "Enter your name"}
                  className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors ${errors.fullName ? "border-destructive" : "border-border focus:border-primary"}`}
                />
                {errors.fullName && <p className="text-[10px] text-destructive mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">{lang === "ar" ? "البريد الإلكتروني" : "Email"} *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255}
                  placeholder="example@email.com"
                  className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors ${errors.email ? "border-destructive" : "border-border focus:border-primary"}`}
                />
                {errors.email && <p className="text-[10px] text-destructive mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">{lang === "ar" ? "رقم الهاتف" : "Phone Number"} *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20}
                  placeholder="+20 1xx xxx xxxx"
                  className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors ${errors.phone ? "border-destructive" : "border-border focus:border-primary"}`}
                />
                {errors.phone && <p className="text-[10px] text-destructive mt-1">{errors.phone}</p>}
              </div>

              {/* Company (optional) */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">{lang === "ar" ? "الشركة / المؤسسة" : "Company / Organization"}</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} maxLength={100}
                  placeholder={lang === "ar" ? "اختياري" : "Optional"}
                  className="w-full p-3 rounded-xl border-2 border-border bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition-colors"
                />
              </div>

              {/* Years of Experience */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">{lang === "ar" ? "سنوات الخبرة" : "Years of Experience"} *</label>
                <div className="grid grid-cols-4 gap-2">
                  {["1-3", "4-7", "8-15", "15+"].map((yr) => (
                    <button key={yr} onClick={() => setYearsExp(yr)}
                      className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-colors ${
                        yearsExp === yr ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground"
                      }`}
                    >{yr}</button>
                  ))}
                </div>
                {errors.yearsExp && <p className="text-[10px] text-destructive mt-1">{errors.yearsExp}</p>}
              </div>

              {/* Availability */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">{lang === "ar" ? "التوفر" : "Availability"} *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "weekdays", label: { en: "Weekdays", ar: "أيام العمل" } },
                    { val: "weekends", label: { en: "Weekends", ar: "عطلة الأسبوع" } },
                    { val: "flexible", label: { en: "Flexible", ar: "مرن" } },
                  ].map((a) => (
                    <button key={a.val} onClick={() => setAvailability(a.val)}
                      className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-colors ${
                        availability === a.val ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground"
                      }`}
                    >{a.label[lang]}</button>
                  ))}
                </div>
                {errors.availability && <p className="text-[10px] text-destructive mt-1">{errors.availability}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">{lang === "ar" ? "كيف يمكنك المساعدة؟" : "How can you help?"} *</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={3}
                  placeholder={lang === "ar" ? "صف كيف يمكن لخبرتك أن تفيد القضية..." : "Describe how your expertise can benefit the cause..."}
                  className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground resize-none transition-colors ${errors.message ? "border-destructive" : "border-border focus:border-primary"}`}
                />
                <div className="flex justify-between">
                  {errors.message && <p className="text-[10px] text-destructive mt-1">{errors.message}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1 ms-auto">{message.length}/500</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 3: Review ── */}
        {step === "review" && (
          <>
            <div className="rounded-xl bg-card border border-border shadow-card p-4 mb-5 space-y-4">
              <div className="flex items-center gap-3">
                <img src={cause.image} alt={cause.title[lang]} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="text-xs text-muted-foreground">{lang === "ar" ? "استشارة لـ" : "Consulting for"}</p>
                  <p className="text-sm font-semibold text-foreground">{cause.title[lang]}</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div>
                <p className="text-xs text-muted-foreground mb-1.5">{lang === "ar" ? "مجالات الخبرة" : "Expertise Areas"}</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedExpertise.map((i) => (
                    <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      {expertiseAreas[i].emoji} {expertiseAreas[i].area[lang]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border" />

              {[
                { label: { en: "Format", ar: "الصيغة" }, value: fmt?.label[lang] || "" },
                { label: { en: "Name", ar: "الاسم" }, value: fullName },
                { label: { en: "Email", ar: "البريد" }, value: email },
                { label: { en: "Phone", ar: "الهاتف" }, value: phone },
                ...(company ? [{ label: { en: "Company", ar: "الشركة" }, value: company }] : []),
                { label: { en: "Experience", ar: "الخبرة" }, value: `${yearsExp} ${lang === "ar" ? "سنوات" : "years"}` },
                { label: { en: "Availability", ar: "التوفر" }, value: availability },
              ].map((row, i) => (
                <div key={i} className="flex items-start justify-between">
                  <span className="text-xs text-muted-foreground">{row.label[lang]}</span>
                  <span className="text-xs font-semibold text-foreground text-end max-w-[60%]">{row.value}</span>
                </div>
              ))}

              <div className="h-px bg-border" />

              <div>
                <p className="text-xs text-muted-foreground mb-1">{lang === "ar" ? "الرسالة" : "Message"}</p>
                <p className="text-xs text-foreground leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                {lang === "ar"
                  ? "بالضغط على 'تأكيد الطلب' سيتم إرسال طلبك وسيتواصل معك فريق المنظمة خلال 48 ساعة."
                  : "By clicking 'Confirm Request' your application will be sent and the organization will contact you within 48 hours."}
              </p>
            </div>
          </>
        )}

        {/* ── STEP 4: Success ── */}
        {step === "success" && (
          <div className="flex flex-col items-center text-center pt-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {lang === "ar" ? "تم إرسال طلبك!" : "Request Submitted!"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-[300px]">
              {lang === "ar"
                ? `شكراً ${fullName}! تم تسجيل طلب الاستشارة الخاص بك. سنتواصل معك قريباً.`
                : `Thank you ${fullName}! Your consultation request has been submitted. We'll be in touch soon.`}
            </p>

            <div className="w-full rounded-xl bg-card border border-border shadow-card p-4 mb-6 text-start space-y-3">
              <p className="text-xs text-muted-foreground font-medium">{lang === "ar" ? "ملخص الطلب" : "Request Summary"}</p>
              {[
                { label: { en: "Expertise", ar: "الخبرة" }, value: selectedExpertise.map((i) => expertiseAreas[i].area[lang]).join(", ") },
                { label: { en: "Format", ar: "الصيغة" }, value: fmt?.label[lang] || "" },
                { label: { en: "Experience", ar: "سنوات الخبرة" }, value: `${yearsExp} ${lang === "ar" ? "سنوات" : "years"}` },
                { label: { en: "Reference", ar: "المرجع" }, value: `#CON-${Date.now().toString(36).toUpperCase().slice(-6)}` },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{row.label[lang]}</span>
                  <span className="text-xs font-semibold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="w-full rounded-xl bg-primary/5 border border-primary/20 p-4 mb-6 text-start">
              <p className="text-xs font-semibold text-primary mb-2">{lang === "ar" ? "الخطوات التالية" : "What's Next"}</p>
              <div className="space-y-2">
                {[
                  { en: "📧 Confirmation email sent to your inbox", ar: "📧 تم إرسال بريد تأكيد لبريدك" },
                  { en: "📞 Organization will contact you within 48 hours", ar: "📞 ستتواصل المنظمة معك خلال 48 ساعة" },
                  { en: "📅 Introductory call will be scheduled", ar: "📅 سيتم جدولة مكالمة تعارف" },
                ].map((item, i) => (
                  <p key={i} className="text-xs text-foreground">{item[lang]}</p>
                ))}
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button onClick={() => navigate(`/cause/${id}`)} className="flex-1 py-3 rounded-xl border-2 border-primary text-primary font-bold text-sm">
                {lang === "ar" ? "عودة للقضية" : "Back to Cause"}
              </button>
              <button onClick={() => navigate("/")} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
                {lang === "ar" ? "الرئيسية" : "Home"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom */}
      {step === "browse" && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 z-50">
          <button
            disabled={!canProceedToBrowse}
            onClick={() => setStep("form")}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {lang === "ar" ? "التالي" : "Continue"} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      {(step === "form" || step === "review") && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
          <div>
            <span className="text-sm font-bold text-foreground">{fmt?.label[lang]}</span>
            <span className="text-[10px] text-muted-foreground block">
              {selectedExpertise.length} {lang === "ar" ? "مجالات" : "areas"}
            </span>
          </div>
          {step === "form" && (
            <button onClick={handleSubmitForm}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated flex items-center gap-2"
            >
              {lang === "ar" ? "مراجعة" : "Review"} <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === "review" && (
            <button disabled={submitting} onClick={handleConfirm}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-70"
            >
              {submitting ? (lang === "ar" ? "جاري الإرسال..." : "Submitting...") : (lang === "ar" ? "تأكيد الطلب" : "Confirm Request")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CauseSupportConsult;
