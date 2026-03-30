import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, HandHeart, CreditCard, Repeat, TrendingUp, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { causes } from "@/lib/sampleData";
import { useState } from "react";

const presetAmounts = [50, 100, 250, 500, 1000];

const CauseSupportDonate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [selected, setSelected] = useState<number>(100);
  const [recurring, setRecurring] = useState(false);

  const cause = causes.find((c) => c.id === id);
  if (!cause) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  const progress = Math.round((cause.raised / cause.goal) * 100);

  const impactExamples = [
    { amount: 50, text: { en: "Provides clean water for 1 family for a week", ar: "توفر مياه نظيفة لعائلة لمدة أسبوع" } },
    { amount: 100, text: { en: "Funds school supplies for 2 children", ar: "تموّل مستلزمات مدرسية لطفلين" } },
    { amount: 250, text: { en: "Supports a local artisan workshop for a month", ar: "تدعم ورشة حرفي محلي لمدة شهر" } },
    { amount: 500, text: { en: "Plants 50 trees in the community", ar: "تزرع 50 شجرة في المجتمع" } },
    { amount: 1000, text: { en: "Covers medical supplies for a village clinic", ar: "تغطي مستلزمات طبية لعيادة قرية" } },
  ];

  const currentImpact = impactExamples.find((e) => e.amount === selected) || impactExamples[1];

  return (
    <div className="min-h-screen bg-surface pb-28">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {lang === "ar" ? "تبرّع" : "Donate"}
        </h1>
      </header>

      <div className="px-4 pt-5">
        {/* Cause Context */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card border border-border mb-5">
          <img src={cause.image} alt={cause.title[lang]} className="w-14 h-14 rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{cause.title[lang]}</p>
            <div className="w-full h-1.5 bg-border rounded-full mt-1.5">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{progress}% {lang === "ar" ? "ممول" : "funded"}</p>
          </div>
        </div>

        {/* Amount Selection */}
        <h2 className="text-base font-bold text-foreground mb-3">
          {lang === "ar" ? "اختر المبلغ" : "Choose Amount"}
        </h2>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setSelected(amount)}
              className={`py-3 rounded-xl text-sm font-bold border-2 transition-colors ${
                selected === amount
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground"
              }`}
            >
              {amount} {t("common.egp")}
            </button>
          ))}
          <button className="py-3 rounded-xl text-sm font-medium border-2 border-dashed border-border bg-card text-muted-foreground">
            {lang === "ar" ? "مبلغ آخر" : "Other"}
          </button>
        </div>

        {/* Impact Preview */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary">
              {lang === "ar" ? "أثر تبرعك" : "Your Impact"}
            </span>
          </div>
          <p className="text-sm text-foreground">{currentImpact.text[lang]}</p>
        </div>

        {/* Recurring Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-card shadow-card border border-border mb-5">
          <div className="flex items-center gap-3">
            <Repeat className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {lang === "ar" ? "تبرع شهري" : "Monthly Donation"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {lang === "ar" ? "ادعم القضية كل شهر تلقائياً" : "Automatically support every month"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setRecurring(!recurring)}
            className={`w-11 h-6 rounded-full transition-colors ${recurring ? "bg-primary" : "bg-border"}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${recurring ? "translate-x-5.5" : "translate-x-0.5"}`} />
          </button>
        </div>

        {/* Payment Methods */}
        <h2 className="text-base font-bold text-foreground mb-3">
          {lang === "ar" ? "طريقة الدفع" : "Payment Method"}
        </h2>
        <div className="space-y-2 mb-6">
          {[
            { icon: CreditCard, label: { en: "Credit / Debit Card", ar: "بطاقة ائتمان / خصم" } },
            { icon: "📱", label: { en: "Mobile Wallet (Vodafone Cash, Fawry)", ar: "محفظة إلكترونية (فودافون كاش، فوري)" } },
            { icon: "🏦", label: { en: "Bank Transfer", ar: "تحويل بنكي" } },
          ].map((method, i) => (
            <button key={i} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-card shadow-card border border-border text-start">
              {typeof method.icon === "string" ? (
                <span className="text-xl">{method.icon}</span>
              ) : (
                <method.icon className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-sm text-foreground">{method.label[lang]}</span>
            </button>
          ))}
        </div>

        {/* Trust */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border">
          <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-[10px] text-muted-foreground">
            {lang === "ar"
              ? "جميع التبرعات آمنة ومشفرة. 100% من مساهمتك تذهب للقضية."
              : "All donations are secure and encrypted. 100% of your contribution goes to the cause."}
          </p>
        </div>
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-foreground">{selected} {t("common.egp")}</span>
          <span className="text-xs text-muted-foreground block">
            {recurring ? (lang === "ar" ? "شهرياً" : "monthly") : (lang === "ar" ? "مرة واحدة" : "one-time")}
          </span>
        </div>
        <button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {lang === "ar" ? "تبرّع الآن" : "Donate Now"}
        </button>
      </div>
    </div>
  );
};

export default CauseSupportDonate;
