import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Package, Heart, Star, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { causes } from "@/lib/sampleData";

const giftPackages = [
  {
    emoji: "📦",
    name: { en: "Essential Care Package", ar: "حزمة الرعاية الأساسية" },
    desc: { en: "Includes hygiene kits, school supplies, and basic necessities for a family of four.", ar: "تشمل أدوات النظافة، مستلزمات مدرسية، واحتياجات أساسية لعائلة من أربعة." },
    price: 150,
    impact: { en: "Supports 1 family for a month", ar: "تدعم عائلة واحدة لمدة شهر" },
  },
  {
    emoji: "🎒",
    name: { en: "Student Starter Kit", ar: "حقيبة الطالب" },
    desc: { en: "Backpack, notebooks, pens, and educational materials for one student.", ar: "حقيبة ظهر، دفاتر، أقلام، ومواد تعليمية لطالب واحد." },
    price: 80,
    impact: { en: "Equips 1 student for the year", ar: "تجهز طالب واحد للعام الدراسي" },
  },
  {
    emoji: "🧶",
    name: { en: "Artisan Craft Bundle", ar: "حزمة الحرف اليدوية" },
    desc: { en: "Raw materials and tools to help local artisans create and sell their crafts.", ar: "مواد خام وأدوات لمساعدة الحرفيين المحليين على الإنتاج والبيع." },
    price: 200,
    impact: { en: "Empowers 1 artisan for 3 months", ar: "تمكّن حرفي واحد لمدة 3 أشهر" },
  },
  {
    emoji: "🌱",
    name: { en: "Green Growth Box", ar: "صندوق النمو الأخضر" },
    desc: { en: "Seeds, saplings, and gardening tools for community farming projects.", ar: "بذور، شتلات، وأدوات زراعية لمشاريع الزراعة المجتمعية." },
    price: 120,
    impact: { en: "Plants 20 trees in the community", ar: "تزرع 20 شجرة في المجتمع" },
  },
];

const CauseSupportGift = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const cause = causes.find((c) => c.id === id);
  if (!cause) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {lang === "ar" ? "أرسل هدية" : "Send a Gift"}
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
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <Gift className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-foreground">
              {lang === "ar" ? "اختر حزمة هدية" : "Choose a Gift Package"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {lang === "ar"
              ? "كل هدية يتم تسليمها مباشرة للمستفيدين مع إيصال تأكيد وصور"
              : "Every gift is delivered directly to beneficiaries with a confirmation receipt and photos"}
          </p>
        </div>

        {/* Gift Packages */}
        <div className="space-y-3 mb-6">
          {giftPackages.map((pkg, i) => (
            <div key={i} className="p-4 rounded-xl bg-card shadow-card border border-border">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{pkg.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{pkg.name[lang]}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{pkg.desc[lang]}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Heart className="w-3 h-3 text-primary" />
                    <span className="text-[10px] text-primary font-medium">{pkg.impact[lang]}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-base font-bold text-foreground">{pkg.price} {t("common.egp")}</span>
                <button className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
                  {lang === "ar" ? "أرسل هدية" : "Send Gift"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Gift */}
        <div className="rounded-xl bg-card shadow-card border border-border p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-foreground">
              {lang === "ar" ? "هدية مخصصة" : "Custom Gift"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {lang === "ar"
              ? "حدد مبلغاً مخصصاً وسنعد حزمة هدايا مخصصة للمستفيدين"
              : "Set a custom amount and we'll prepare a tailored gift package for the beneficiaries"}
          </p>
          <button className="w-full py-2.5 rounded-lg border-2 border-dashed border-primary/40 text-primary text-sm font-semibold hover:bg-primary/5 transition-colors">
            {lang === "ar" ? "إنشاء هدية مخصصة" : "Create Custom Gift"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CauseSupportGift;
