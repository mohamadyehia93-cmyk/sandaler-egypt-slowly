import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Briefcase, Clock, Calendar, Send, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { causes } from "@/lib/sampleData";

const expertiseAreas = [
  { emoji: "💼", area: { en: "Business Strategy", ar: "استراتيجية الأعمال" }, desc: { en: "Help with fundraising, planning, and organizational growth", ar: "مساعدة في جمع التبرعات والتخطيط والنمو المؤسسي" } },
  { emoji: "📊", area: { en: "Marketing & Communications", ar: "التسويق والاتصالات" }, desc: { en: "Branding, social media, and outreach campaigns", ar: "العلامة التجارية ووسائل التواصل والحملات" } },
  { emoji: "⚖️", area: { en: "Legal & Compliance", ar: "القانون والامتثال" }, desc: { en: "NGO registration, contracts, and regulatory guidance", ar: "تسجيل المنظمات والعقود والإرشاد التنظيمي" } },
  { emoji: "💻", area: { en: "Technology & Digital", ar: "التكنولوجيا والرقمنة" }, desc: { en: "Websites, apps, data systems, and digital tools", ar: "مواقع، تطبيقات، أنظمة بيانات وأدوات رقمية" } },
  { emoji: "🏗️", area: { en: "Engineering & Design", ar: "الهندسة والتصميم" }, desc: { en: "Infrastructure, architecture, and sustainable design", ar: "البنية التحتية والعمارة والتصميم المستدام" } },
  { emoji: "🩺", area: { en: "Healthcare & Wellness", ar: "الصحة والعافية" }, desc: { en: "Medical advice, health programs, and wellness initiatives", ar: "الاستشارات الطبية وبرامج الصحة ومبادرات العافية" } },
];

const consultFormats = [
  { icon: MessageCircle, label: { en: "Virtual Meeting", ar: "اجتماع افتراضي" }, desc: { en: "30-60 min video call", ar: "مكالمة فيديو 30-60 دقيقة" } },
  { icon: Calendar, label: { en: "Ongoing Mentorship", ar: "إرشاد مستمر" }, desc: { en: "Monthly sessions for 3-6 months", ar: "جلسات شهرية لمدة 3-6 أشهر" } },
  { icon: Briefcase, label: { en: "Project-Based", ar: "مبني على مشروع" }, desc: { en: "Dedicated support for a specific initiative", ar: "دعم مخصص لمبادرة محددة" } },
];

const CauseSupportConsult = () => {
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
          {lang === "ar" ? "استشارة" : "Consult"}
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
        <h2 className="text-base font-bold text-foreground mb-3">
          {lang === "ar" ? "مجالات الخبرة المطلوبة" : "Expertise Areas Needed"}
        </h2>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {expertiseAreas.map((area, i) => (
            <button key={i} className="p-3 rounded-xl bg-card shadow-card border border-border text-start hover:border-primary transition-colors">
              <span className="text-xl block mb-1.5">{area.emoji}</span>
              <p className="text-xs font-semibold text-foreground">{area.area[lang]}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{area.desc[lang]}</p>
            </button>
          ))}
        </div>

        {/* Consultation Formats */}
        <h2 className="text-base font-bold text-foreground mb-3">
          {lang === "ar" ? "صيغة الاستشارة" : "Consultation Format"}
        </h2>
        <div className="space-y-2 mb-6">
          {consultFormats.map((fmt, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-card border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <fmt.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{fmt.label[lang]}</p>
                <p className="text-xs text-muted-foreground">{fmt.desc[lang]}</p>
              </div>
            </div>
          ))}
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
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary-foreground">{step.step}</span>
              </div>
              <span className="text-xs text-foreground">{step.text[lang]}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated flex items-center justify-center gap-2 mb-6">
          <Send className="w-4 h-4" />
          {lang === "ar" ? "أرسل طلب استشارة" : "Submit Consultation Request"}
        </button>
      </div>
    </div>
  );
};

export default CauseSupportConsult;
