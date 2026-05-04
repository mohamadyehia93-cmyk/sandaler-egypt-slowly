import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Repeat, TrendingUp, ShieldCheck, Check, ChevronRight, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { causes } from "@/lib/sampleData";
import { useState } from "react";
import NotFoundView from "@/components/NotFound";

const presetAmounts = [50, 100, 250, 500, 1000];

type Step = "amount" | "payment" | "confirm" | "success";

const paymentMethods = [
  { id: "card", icon: CreditCard, label: { en: "Credit / Debit Card", ar: "بطاقة ائتمان / خصم" }, isComponent: true },
  { id: "wallet", icon: "📱", label: { en: "Mobile Wallet (Vodafone Cash, Fawry)", ar: "محفظة إلكترونية (فودافون كاش، فوري)" }, isComponent: false },
  { id: "bank", icon: "🏦", label: { en: "Bank Transfer", ar: "تحويل بنكي" }, isComponent: false },
];

const CauseSupportDonate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [selected, setSelected] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [step, setStep] = useState<Step>("amount");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const cause = causes.find((c) => c.id === id);
  if (!cause) return <NotFoundView context="cause" />;

  const progress = Math.round((cause.raised / cause.goal) * 100);
  const finalAmount = showCustom ? (parseInt(customAmount) || 0) : selected;

  const impactExamples = [
    { amount: 50, text: { en: "Provides clean water for 1 family for a week", ar: "توفر مياه نظيفة لعائلة لمدة أسبوع" } },
    { amount: 100, text: { en: "Funds school supplies for 2 children", ar: "تموّل مستلزمات مدرسية لطفلين" } },
    { amount: 250, text: { en: "Supports a local artisan workshop for a month", ar: "تدعم ورشة حرفي محلي لمدة شهر" } },
    { amount: 500, text: { en: "Plants 50 trees in the community", ar: "تزرع 50 شجرة في المجتمع" } },
    { amount: 1000, text: { en: "Covers medical supplies for a village clinic", ar: "تغطي مستلزمات طبية لعيادة قرية" } },
  ];

  const currentImpact = impactExamples.find((e) => e.amount <= finalAmount) 
    ? [...impactExamples].reverse().find((e) => e.amount <= finalAmount)!
    : impactExamples[0];

  const selectedPayment = paymentMethods.find(m => m.id === paymentMethod);

  const handleDonate = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep("success");
    }, 2000);
  };

  const stepTitles: Record<Step, { en: string; ar: string }> = {
    amount: { en: "Donate", ar: "تبرّع" },
    payment: { en: "Payment Method", ar: "طريقة الدفع" },
    confirm: { en: "Confirm Donation", ar: "تأكيد التبرع" },
    success: { en: "Thank You!", ar: "شكراً لك!" },
  };

  const handleBack = () => {
    if (step === "payment") setStep("amount");
    else if (step === "confirm") setStep("payment");
    else navigate(-1);
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
        {/* Step indicator */}
        {step !== "success" && (
          <div className="flex gap-1.5 ms-auto">
            {(["amount", "payment", "confirm"] as Step[]).map((s, i) => (
              <div key={s} className={`w-2 h-2 rounded-full transition-colors ${
                s === step ? "bg-primary" : (["amount", "payment", "confirm"].indexOf(step) > i ? "bg-primary/40" : "bg-border")
              }`} />
            ))}
          </div>
        )}
      </header>

      <div className="px-4 pt-5">
        {/* ── STEP 1: Amount ── */}
        {step === "amount" && (
          <>
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

            <h2 className="text-base font-bold text-foreground mb-3">
              {lang === "ar" ? "اختر المبلغ" : "Choose Amount"}
            </h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => { setSelected(amount); setShowCustom(false); }}
                  className={`py-3 rounded-xl text-sm font-bold border-2 transition-colors ${
                    !showCustom && selected === amount
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  {amount} {t("common.egp")}
                </button>
              ))}
              <button
                onClick={() => setShowCustom(true)}
                className={`py-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                  showCustom ? "border-primary bg-primary/10 text-primary" : "border-dashed border-border bg-card text-muted-foreground"
                }`}
              >
                {lang === "ar" ? "مبلغ آخر" : "Other"}
              </button>
            </div>

            {showCustom && (
              <div className="mb-4">
                <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-primary bg-card">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder={lang === "ar" ? "أدخل المبلغ" : "Enter amount"}
                    className="flex-1 bg-transparent text-foreground text-lg font-bold outline-none placeholder:text-muted-foreground"
                    autoFocus
                    min={1}
                  />
                  <span className="text-sm text-muted-foreground font-medium">{t("common.egp")}</span>
                </div>
              </div>
            )}

            {/* Impact Preview */}
            {finalAmount > 0 && (
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">
                    {lang === "ar" ? "أثر تبرعك" : "Your Impact"}
                  </span>
                </div>
                <p className="text-sm text-foreground">{currentImpact.text[lang]}</p>
              </div>
            )}

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
          </>
        )}

        {/* ── STEP 2: Payment Method ── */}
        {step === "payment" && (
          <>
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 mb-5 flex items-center justify-between">
              <span className="text-sm text-foreground font-medium">
                {lang === "ar" ? "مبلغ التبرع" : "Donation Amount"}
              </span>
              <span className="text-lg font-bold text-primary">{finalAmount} {t("common.egp")}</span>
            </div>

            <h2 className="text-base font-bold text-foreground mb-3">
              {lang === "ar" ? "اختر طريقة الدفع" : "Select Payment Method"}
            </h2>
            <div className="space-y-2 mb-6">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-start transition-colors ${
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5 shadow-card"
                      : "border-border bg-card shadow-card"
                  }`}
                >
                  {method.isComponent ? (
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <span className="text-xl">{method.icon as string}</span>
                  )}
                  <span className="text-sm text-foreground flex-1">{method.label[lang]}</span>
                  {paymentMethod === method.id && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
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
          </>
        )}

        {/* ── STEP 3: Confirm ── */}
        {step === "confirm" && (
          <>
            <div className="rounded-xl bg-card border border-border shadow-card p-4 mb-5 space-y-4">
              {/* Cause */}
              <div className="flex items-center gap-3">
                <img src={cause.image} alt={cause.title[lang]} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{lang === "ar" ? "التبرع لـ" : "Donating to"}</p>
                  <p className="text-sm font-semibold text-foreground truncate">{cause.title[lang]}</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Summary rows */}
              {[
                { label: { en: "Amount", ar: "المبلغ" }, value: `${finalAmount} ${t("common.egp")}` },
                { label: { en: "Frequency", ar: "التكرار" }, value: recurring ? (lang === "ar" ? "شهرياً" : "Monthly") : (lang === "ar" ? "مرة واحدة" : "One-time") },
                { label: { en: "Payment", ar: "الدفع" }, value: selectedPayment?.label[lang] || "" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{row.label[lang]}</span>
                  <span className="text-sm font-semibold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Impact */}
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {lang === "ar" ? "أثر تبرعك" : "Your Impact"}
                </span>
              </div>
              <p className="text-sm text-foreground">{currentImpact.text[lang]}</p>
            </div>

            {/* Trust */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                {lang === "ar"
                  ? "بالضغط على 'تأكيد التبرع' أنت توافق على شروط الاستخدام. جميع المعاملات آمنة ومشفرة."
                  : "By clicking 'Confirm Donation' you agree to the terms of service. All transactions are secure and encrypted."}
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
              {lang === "ar" ? "تم التبرع بنجاح!" : "Donation Successful!"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
              {lang === "ar"
                ? `شكراً لتبرعك بمبلغ ${finalAmount} ${t("common.egp")} لدعم "${cause.title[lang]}"`
                : `Thank you for donating ${finalAmount} ${t("common.egp")} to support "${cause.title[lang]}"`}
            </p>

            {/* Receipt card */}
            <div className="w-full rounded-xl bg-card border border-border shadow-card p-4 mb-6 text-start space-y-3">
              <p className="text-xs text-muted-foreground font-medium">{lang === "ar" ? "ملخص الإيصال" : "Receipt Summary"}</p>
              {[
                { label: { en: "Amount", ar: "المبلغ" }, value: `${finalAmount} ${t("common.egp")}` },
                { label: { en: "Frequency", ar: "التكرار" }, value: recurring ? (lang === "ar" ? "شهرياً" : "Monthly") : (lang === "ar" ? "مرة واحدة" : "One-time") },
                { label: { en: "Payment", ar: "الدفع" }, value: selectedPayment?.label[lang] || "" },
                { label: { en: "Reference", ar: "المرجع" }, value: `#DON-${Date.now().toString(36).toUpperCase().slice(-6)}` },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{row.label[lang]}</span>
                  <span className="text-xs font-semibold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Impact */}
            <div className="w-full rounded-xl bg-primary/5 border border-primary/20 p-4 mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  {lang === "ar" ? "أثرك" : "Your Impact"}
                </span>
              </div>
              <p className="text-sm text-foreground">{currentImpact.text[lang]}</p>
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

      {/* Sticky Bottom - hidden on success */}
      {step !== "success" && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
          <div>
            <span className="text-lg font-bold text-foreground">{finalAmount} {t("common.egp")}</span>
            <span className="text-xs text-muted-foreground block">
              {recurring ? (lang === "ar" ? "شهرياً" : "monthly") : (lang === "ar" ? "مرة واحدة" : "one-time")}
            </span>
          </div>
          {step === "amount" && (
            <button
              disabled={finalAmount <= 0}
              onClick={() => setStep("payment")}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-40 flex items-center gap-2"
            >
              {lang === "ar" ? "التالي" : "Next"} <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === "payment" && (
            <button
              disabled={!paymentMethod}
              onClick={() => setStep("confirm")}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-40 flex items-center gap-2"
            >
              {lang === "ar" ? "التالي" : "Next"} <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === "confirm" && (
            <button
              disabled={processing}
              onClick={handleDonate}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-70 flex items-center gap-2"
            >
              {processing
                ? (lang === "ar" ? "جاري المعالجة..." : "Processing...")
                : (lang === "ar" ? "تأكيد التبرع" : "Confirm Donation")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CauseSupportDonate;
