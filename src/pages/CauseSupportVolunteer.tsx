import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserCheck, Calendar, MapPin, Clock, CheckCircle2, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { causes } from "@/lib/sampleData";

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

const CauseSupportVolunteer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();

  const cause = causes.find((c) => c.id === id);
  if (!cause) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {lang === "ar" ? "تطوّع" : "Volunteer"}
        </h1>
      </header>

      <div className="px-4 pt-5">
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
          {opportunities.map((opp, i) => (
            <div key={i} className="p-4 rounded-xl bg-card shadow-card border border-border">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{opp.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{opp.title[lang]}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{opp.desc[lang]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {opp.duration[lang]}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {opp.slots} {lang === "ar" ? "مكان متاح" : "spots left"}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {opp.skills.map((skill, si) => (
                  <span key={si} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                    {skill[lang]}
                  </span>
                ))}
              </div>
              <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                {lang === "ar" ? "سجّل اهتمامك" : "Express Interest"}
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
      </div>
    </div>
  );
};

export default CauseSupportVolunteer;
