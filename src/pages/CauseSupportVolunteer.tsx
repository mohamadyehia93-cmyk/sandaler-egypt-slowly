import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserCheck, Calendar, MapPin, Clock, CheckCircle2, Users, ChevronRight, Check, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { causes } from "@/lib/sampleData";
import { useState } from "react";

const opportunities = [
  {
    emoji: "🏗️",
    title: { en: "On-Site Community Work", ar: "عمل ميداني مجتمعي" },
    desc: { en: "Help with construction, restoration, or infrastructure projects directly in the community.", ar: "المساعدة في البناء أو الترميم أو مشاريع البنية التحتية مباشرة في المجتمع." },
    duration: { en: "2–4 weeks", ar: "2–4 أسابيع" },
    slots: 5,
    skills: [
      { en: "Physical fitness", ar: "لياقة بدنية" },
      { en: "Teamwork", ar: "عمل جماعي" },
    ],
  },
  {
    emoji: "📚",
    title: { en: "Teaching & Mentoring", ar: "تعليم وإرشاد" },
    desc: { en: "Teach English, math, or digital skills to children and young adults in the area.", ar: "تعليم الإنجليزية أو الرياضيات أو المهارات الرقمية للأطفال والشباب في المنطقة." },
    duration: { en: "1–3 months", ar: "1–3 أشهر" },
    slots: 8,
    skills: [
      { en: "Teaching experience", ar: "خبرة تعليمية" },
      { en: "Patience", ar: "صبر" },
    ],
  },
  {
    emoji: "🌿",
    title: { en: "Environmental Conservation", ar: "حماية البيئة" },
    desc: { en: "Join tree planting, clean-up drives, and wildlife preservation efforts.", ar: "شارك في زراعة الأشجار وحملات التنظيف وجهود حفظ الحياة البرية." },
    duration: { en: "1–2 weeks", ar: "1–2 أسبوع" },
    slots: 12,
    skills: [
      { en: "Outdoor work", ar: "عمل خارجي" },
      { en: "Environmental awareness", ar: "وعي بيئي" },
    ],
  },
  {
    emoji: "📸",
    title: { en: "Documentation & Storytelling", ar: "توثيق وسرد قصص" },
    desc: { en: "Photograph, film, or write stories about the community and its progress.", ar: "تصوير أو تصوير فيديو أو كتابة قصص عن المجتمع وتقدمه." },
    duration: { en: "2–4 weeks", ar: "2–4 أسابيع" },
    slots: 3,
    skills: [
      { en: "Photography/Writing", ar: "تصوير/كتابة" },
      { en: "Creativity", ar: "إبداع" },
    ],
  },
];

type Step = "browse" | "form" | "review" | "success";

const CauseSupportVolunteer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();

  const cause = causes.find((c) => c.id === id);

  const [step, setStep] = useState<Step>("browse");
  const [selectedOpp, setSelectedOpp] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [motivation, setMotivation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!cause) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  const opp = selectedOpp !== null ? opportunities[selectedOpp] : null;

  const allSkillOptions = [
    { en: "Teaching", ar: "تعليم" },
    { en: "Photography", ar: "تصوير" },
    { en: "Writing", ar: "كتابة" },
    { en: "Construction", ar: "بناء" },
    { en: "First Aid", ar: "إسعافات أولية" },
    { en: "Cooking", ar: "طبخ" },
    { en: "Driving", ar: "قيادة" },
    { en: "Translation", ar: "ترجمة" },
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = lang === "ar" ? "مطلوب" : "Required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = lang === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email";
    if (!phone.trim() || phone.trim().length < 8) e.phone = lang === "ar" ? "رقم غير صالح" : "Invalid number";
    if (!startDate) e.startDate = lang === "ar" ? "مطلوب" : "Required";
    if (!motivation.trim() || motivation.trim().length < 10) e.motivation = lang === "ar" ? "10 أحرف على الأقل" : "At least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleExpress = (index: number) => {
    setSelectedOpp(index);
    setStep("form");
  };

  const handleSubmitForm = () => {
    if (!validate()) return;
    setStep("review");
  };

  const handleConfirm = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStep("success");
    }, 2000);
  };

  const handleBack = () => {
    if (step === "form") { setStep("browse"); setSelectedOpp(null); }
    else if (step === "review") setStep("form");
    else navigate(-1);
  };

  const stepTitles: Record<Step, { en: string; ar: string }> = {
    browse: { en: "Volunteer", ar: "تطوّع" },
    form: { en: "Your Details", ar: "بياناتك" },
    review: { en: "Review", ar: "مراجعة" },
    success: { en: "You're In!", ar: "تم التسجيل!" },
  };

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
        {/* ── STEP 1: Browse Opportunities ── */}
        {step === "browse" && (
          <>
            {/* Cause Context */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card border border-border mb-5">
              <img src={cause.image} alt={cause.title[lang]} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{cause.title[lang]}</p>
                <p className="text-xs text-muted-foreground">{cause.category[lang]}</p>
              </div>
            </div>

            {/* Intro */}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-foreground">
                  {lang === "ar" ? "قدّم وقتك ومهاراتك" : "Give Your Time & Skills"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {lang === "ar"
                  ? "انضم لفريق المتطوعين واحدث تأثيراً مباشراً. نوفر الإقامة والتوجيه."
                  : "Join our volunteer team and make a direct impact. We provide accommodation and guidance."}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { icon: Users, value: "24", label: { en: "Volunteers", ar: "متطوع" } },
                { icon: MapPin, value: "3", label: { en: "Locations", ar: "مواقع" } },
                { icon: Calendar, value: "12", label: { en: "Programs/yr", ar: "برنامج/سنة" } },
              ].map((s, i) => (
                <div key={i} className="bg-card rounded-xl shadow-card border border-border p-3 text-center">
                  <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label[lang]}</p>
                </div>
              ))}
            </div>

            {/* Opportunities */}
            <h2 className="text-base font-bold text-foreground mb-3">
              {lang === "ar" ? "فرص التطوع" : "Volunteer Opportunities"}
            </h2>
            <div className="space-y-3 mb-6">
              {opportunities.map((o, i) => (
                <div key={i} className="p-4 rounded-xl bg-card shadow-card border border-border">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{o.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{o.title[lang]}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{o.desc[lang]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {o.duration[lang]}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {o.slots} {lang === "ar" ? "مكان متاح" : "spots left"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {o.skills.map((skill, si) => (
                      <span key={si} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                        {skill[lang]}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleExpress(i)}
                    className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1"
                  >
                    {lang === "ar" ? "سجّل اهتمامك" : "Express Interest"} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* What's Included */}
            <h2 className="text-base font-bold text-foreground mb-3">
              {lang === "ar" ? "ما يشمله التطوع" : "What's Included"}
            </h2>
            <div className="space-y-2 mb-6">
              {[
                { en: "Free accommodation during your stay", ar: "إقامة مجانية خلال فترة التطوع" },
                { en: "Orientation and safety training", ar: "تدريب توجيهي وتدريب على السلامة" },
                { en: "Certificate of participation", ar: "شهادة مشاركة" },
                { en: "Local guide and cultural immersion", ar: "مرشد محلي وانغماس ثقافي" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs text-foreground">{item[lang]}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── STEP 2: Application Form ── */}
        {step === "form" && opp && (
          <>
            {/* Selected opportunity */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 mb-5">
              <span className="text-2xl">{opp.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{opp.title[lang]}</p>
                <p className="text-[10px] text-muted-foreground">{opp.duration[lang]} · {opp.slots} {lang === "ar" ? "مكان" : "spots"}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {lang === "ar" ? "الاسم الكامل" : "Full Name"} *
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={100}
                  placeholder={lang === "ar" ? "أدخل اسمك" : "Enter your name"}
                  className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors ${
                    errors.fullName ? "border-destructive" : "border-border focus:border-primary"
                  }`}
                />
                {errors.fullName && <p className="text-[10px] text-destructive mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {lang === "ar" ? "البريد الإلكتروني" : "Email"} *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  placeholder={lang === "ar" ? "example@email.com" : "example@email.com"}
                  className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors ${
                    errors.email ? "border-destructive" : "border-border focus:border-primary"
                  }`}
                />
                {errors.email && <p className="text-[10px] text-destructive mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {lang === "ar" ? "رقم الهاتف" : "Phone Number"} *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                  placeholder={lang === "ar" ? "+20 1xx xxx xxxx" : "+20 1xx xxx xxxx"}
                  className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors ${
                    errors.phone ? "border-destructive" : "border-border focus:border-primary"
                  }`}
                />
                {errors.phone && <p className="text-[10px] text-destructive mt-1">{errors.phone}</p>}
              </div>

              {/* Preferred Start Date */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {lang === "ar" ? "تاريخ البدء المفضل" : "Preferred Start Date"} *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none transition-colors ${
                    errors.startDate ? "border-destructive" : "border-border focus:border-primary"
                  }`}
                />
                {errors.startDate && <p className="text-[10px] text-destructive mt-1">{errors.startDate}</p>}
              </div>

              {/* Skills */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {lang === "ar" ? "مهاراتك" : "Your Skills"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {allSkillOptions.map((skill) => {
                    const isSelected = selectedSkills.includes(skill.en);
                    return (
                      <button
                        key={skill.en}
                        onClick={() => toggleSkill(skill.en)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        {skill[lang]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Motivation */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {lang === "ar" ? "لماذا تريد التطوع؟" : "Why do you want to volunteer?"} *
                </label>
                <textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder={lang === "ar" ? "أخبرنا عن حافزك..." : "Tell us about your motivation..."}
                  className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground resize-none transition-colors ${
                    errors.motivation ? "border-destructive" : "border-border focus:border-primary"
                  }`}
                />
                <div className="flex justify-between">
                  {errors.motivation && <p className="text-[10px] text-destructive mt-1">{errors.motivation}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1 ms-auto">{motivation.length}/500</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 3: Review ── */}
        {step === "review" && opp && (
          <>
            <div className="rounded-xl bg-card border border-border shadow-card p-4 mb-5 space-y-4">
              {/* Opportunity */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opp.emoji}</span>
                <div>
                  <p className="text-xs text-muted-foreground">{lang === "ar" ? "الفرصة" : "Opportunity"}</p>
                  <p className="text-sm font-semibold text-foreground">{opp.title[lang]}</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              {[
                { label: { en: "Name", ar: "الاسم" }, value: fullName },
                { label: { en: "Email", ar: "البريد" }, value: email },
                { label: { en: "Phone", ar: "الهاتف" }, value: phone },
                { label: { en: "Start Date", ar: "تاريخ البدء" }, value: startDate },
                { label: { en: "Skills", ar: "المهارات" }, value: selectedSkills.length > 0 ? selectedSkills.join(", ") : (lang === "ar" ? "لم يتم التحديد" : "None selected") },
              ].map((row, i) => (
                <div key={i} className="flex items-start justify-between">
                  <span className="text-xs text-muted-foreground">{row.label[lang]}</span>
                  <span className="text-xs font-semibold text-foreground text-end max-w-[60%]">{row.value}</span>
                </div>
              ))}

              <div className="h-px bg-border" />

              <div>
                <p className="text-xs text-muted-foreground mb-1">{lang === "ar" ? "الحافز" : "Motivation"}</p>
                <p className="text-xs text-foreground leading-relaxed">{motivation}</p>
              </div>
            </div>

            {/* Cause */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card border border-border mb-5">
              <img src={cause.image} alt={cause.title[lang]} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{lang === "ar" ? "القضية" : "Cause"}</p>
                <p className="text-sm font-semibold text-foreground truncate">{cause.title[lang]}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                {lang === "ar"
                  ? "بالضغط على 'تأكيد التسجيل' سيتم إرسال طلبك للمراجعة وسيتم التواصل معك خلال 48 ساعة."
                  : "By clicking 'Confirm Application' your request will be reviewed and we'll contact you within 48 hours."}
              </p>
            </div>
          </>
        )}

        {/* ── STEP 4: Success ── */}
        {step === "success" && opp && (
          <div className="flex flex-col items-center text-center pt-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {lang === "ar" ? "تم تسجيل اهتمامك!" : "Application Submitted!"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-[300px]">
              {lang === "ar"
                ? `شكراً ${fullName}! تم تسجيلك للتطوع في "${opp.title[lang]}". سنتواصل معك قريباً.`
                : `Thank you ${fullName}! You've applied to volunteer for "${opp.title[lang]}". We'll be in touch soon.`}
            </p>

            {/* Confirmation card */}
            <div className="w-full rounded-xl bg-card border border-border shadow-card p-4 mb-6 text-start space-y-3">
              <p className="text-xs text-muted-foreground font-medium">{lang === "ar" ? "ملخص الطلب" : "Application Summary"}</p>
              {[
                { label: { en: "Opportunity", ar: "الفرصة" }, value: opp.title[lang] },
                { label: { en: "Duration", ar: "المدة" }, value: opp.duration[lang] },
                { label: { en: "Start Date", ar: "تاريخ البدء" }, value: startDate },
                { label: { en: "Reference", ar: "المرجع" }, value: `#VOL-${Date.now().toString(36).toUpperCase().slice(-6)}` },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{row.label[lang]}</span>
                  <span className="text-xs font-semibold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            {/* What's next */}
            <div className="w-full rounded-xl bg-primary/5 border border-primary/20 p-4 mb-6 text-start">
              <p className="text-xs font-semibold text-primary mb-2">{lang === "ar" ? "الخطوات التالية" : "What's Next"}</p>
              <div className="space-y-2">
                {[
                  { en: "📧 Confirmation email sent to your inbox", ar: "📧 تم إرسال بريد تأكيد لبريدك" },
                  { en: "📞 Our team will contact you within 48 hours", ar: "📞 سيتواصل فريقنا معك خلال 48 ساعة" },
                  { en: "📋 Prepare your travel documents if needed", ar: "📋 جهّز وثائق السفر إذا لزم الأمر" },
                ].map((item, i) => (
                  <p key={i} className="text-xs text-foreground">{item[lang]}</p>
                ))}
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => navigate(`/cause/${id}`)}
                className="flex-1 py-3 rounded-xl border-2 border-primary text-primary font-bold text-sm"
              >
                {lang === "ar" ? "عودة للقضية" : "Back to Cause"}
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated"
              >
                {lang === "ar" ? "الرئيسية" : "Home"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom */}
      {(step === "form" || step === "review") && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
          <div>
            <span className="text-sm font-bold text-foreground">{opp?.title[lang]}</span>
            <span className="text-[10px] text-muted-foreground block">{opp?.duration[lang]}</span>
          </div>
          {step === "form" && (
            <button
              onClick={handleSubmitForm}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated flex items-center gap-2"
            >
              {lang === "ar" ? "مراجعة" : "Review"} <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === "review" && (
            <button
              disabled={submitting}
              onClick={handleConfirm}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-70"
            >
              {submitting
                ? (lang === "ar" ? "جاري الإرسال..." : "Submitting...")
                : (lang === "ar" ? "تأكيد التسجيل" : "Confirm Application")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CauseSupportVolunteer;
