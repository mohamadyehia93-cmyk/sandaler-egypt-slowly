import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Package, Heart, Star, ChevronRight, Check, Truck, MapPin, Camera, Clock, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { causes } from "@/lib/sampleData";
import { useState } from "react";
import NotFoundView from "@/components/NotFound";

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

const itemCategories = [
  { id: "furniture", emoji: "🪑", label: { en: "Furniture", ar: "أثاث" }, examples: { en: "Chairs, tables, shelves, beds", ar: "كراسي، طاولات، رفوف، أسرّة" } },
  { id: "electronics", emoji: "💻", label: { en: "Electronics", ar: "إلكترونيات" }, examples: { en: "Laptops, phones, tablets", ar: "لابتوبات، هواتف، تابلت" } },
  { id: "clothing", emoji: "👕", label: { en: "Clothing", ar: "ملابس" }, examples: { en: "Clean, gently used clothes", ar: "ملابس نظيفة مستعملة بحالة جيدة" } },
  { id: "books", emoji: "📚", label: { en: "Books & Supplies", ar: "كتب ومستلزمات" }, examples: { en: "Books, stationery, art supplies", ar: "كتب، قرطاسية، أدوات فنية" } },
  { id: "appliances", emoji: "🏠", label: { en: "Home Appliances", ar: "أجهزة منزلية" }, examples: { en: "Fans, heaters, kitchen tools", ar: "مراوح، سخانات، أدوات مطبخ" } },
  { id: "other", emoji: "📦", label: { en: "Other", ar: "أخرى" }, examples: { en: "Anything useful for the community", ar: "أي شيء مفيد للمجتمع" } },
];

type GiftMode = "buy" | "donate-own";
type Step = "choose" | "package-confirm" | "own-form" | "own-review" | "success";

const CauseSupportGift = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const cause = causes.find((c) => c.id === id);

  const [step, setStep] = useState<Step>("choose");
  const [mode, setMode] = useState<GiftMode>("buy");
  const [selectedPkg, setSelectedPkg] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Own gift form
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [itemDescription, setItemDescription] = useState("");
  const [itemCondition, setItemCondition] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<"shipping" | "pickup" | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!cause) return <NotFoundView context="cause" />;

  const pkg = selectedPkg !== null ? giftPackages[selectedPkg] : null;

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (selectedCategories.length === 0) e.categories = lang === "ar" ? "اختر فئة واحدة على الأقل" : "Select at least one category";
    if (!itemDescription.trim() || itemDescription.trim().length < 10) e.itemDescription = lang === "ar" ? "10 أحرف على الأقل" : "At least 10 characters";
    if (!itemCondition) e.itemCondition = lang === "ar" ? "مطلوب" : "Required";
    if (!deliveryMethod) e.deliveryMethod = lang === "ar" ? "مطلوب" : "Required";
    if (!fullName.trim()) e.fullName = lang === "ar" ? "مطلوب" : "Required";
    if (!phone.trim() || phone.trim().length < 8) e.phone = lang === "ar" ? "رقم غير صالح" : "Invalid number";
    if (!address.trim()) e.address = lang === "ar" ? "مطلوب" : "Required";
    if (!preferredDate) e.preferredDate = lang === "ar" ? "مطلوب" : "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOwnSubmit = () => {
    if (!validate()) return;
    setStep("own-review");
  };

  const handleConfirm = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setStep("success"); }, 2000);
  };

  const handleBack = () => {
    if (step === "package-confirm") setStep("choose");
    else if (step === "own-form") setStep("choose");
    else if (step === "own-review") setStep("own-form");
    else navigate(-1);
  };

  const stepTitles: Record<Step, { en: string; ar: string }> = {
    choose: { en: "Send a Gift", ar: "أرسل هدية" },
    "package-confirm": { en: "Confirm Gift", ar: "تأكيد الهدية" },
    "own-form": { en: "Donate Your Items", ar: "تبرّع بأغراضك" },
    "own-review": { en: "Review", ar: "مراجعة" },
    success: { en: "Thank You!", ar: "شكراً لك!" },
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
        {(step === "own-form" || step === "own-review") && (
          <div className="flex gap-1.5 ms-auto">
            {(["own-form", "own-review"] as Step[]).map((s, i) => (
              <div key={s} className={`w-2 h-2 rounded-full transition-colors ${
                s === step ? "bg-primary" : (["own-form", "own-review"].indexOf(step) > i ? "bg-primary/40" : "bg-border")
              }`} />
            ))}
          </div>
        )}
      </header>

      <div className="px-4 pt-5">
        {/* ── STEP: Choose Mode ── */}
        {step === "choose" && (
          <>
            {/* Cause Context */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card shadow-card border border-border mb-5">
              <img src={cause.image} alt={cause.title[lang]} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{cause.title[lang]}</p>
                <p className="text-xs text-muted-foreground">{cause.category[lang]}</p>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => setMode("buy")}
                className={`p-4 rounded-xl border-2 text-center transition-colors ${
                  mode === "buy" ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <Gift className={`w-6 h-6 mx-auto mb-2 ${mode === "buy" ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-xs font-bold text-foreground">{lang === "ar" ? "اشترِ حزمة هدية" : "Buy Gift Package"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{lang === "ar" ? "حزم جاهزة للمستفيدين" : "Ready-made packages"}</p>
              </button>
              <button
                onClick={() => setMode("donate-own")}
                className={`p-4 rounded-xl border-2 text-center transition-colors ${
                  mode === "donate-own" ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <Package className={`w-6 h-6 mx-auto mb-2 ${mode === "donate-own" ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-xs font-bold text-foreground">{lang === "ar" ? "تبرّع بأغراضك" : "Donate Your Items"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{lang === "ar" ? "أثاث، إلكترونيات، ملابس..." : "Furniture, electronics, clothes..."}</p>
              </button>
            </div>

            {/* ── BUY MODE ── */}
            {mode === "buy" && (
              <>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-5">
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

                <div className="space-y-3 mb-6">
                  {giftPackages.map((p, i) => (
                    <div key={i} className="p-4 rounded-xl bg-card shadow-card border border-border">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{p.emoji}</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground">{p.name[lang]}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.desc[lang]}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Heart className="w-3 h-3 text-primary" />
                            <span className="text-[10px] text-primary font-medium">{p.impact[lang]}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                        <span className="text-base font-bold text-foreground">{p.price} {t("common.egp")}</span>
                        <button
                          onClick={() => { setSelectedPkg(i); setStep("package-confirm"); }}
                          className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1"
                        >
                          {lang === "ar" ? "أرسل هدية" : "Send Gift"} <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── DONATE OWN MODE ── */}
            {mode === "donate-own" && (
              <>
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 mb-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-semibold text-foreground">
                      {lang === "ar" ? "تبرّع بأغراضك المستعملة" : "Donate Your Pre-Owned Items"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lang === "ar"
                      ? "أرسل أثاثك أو أجهزتك أو ملابسك للمنظمة. يمكنك شحنها أو ترتيب استلام من موقعك."
                      : "Send your furniture, appliances, or clothes to the organization. Ship them or arrange a pickup from your location."}
                  </p>
                </div>

                {/* Delivery method preview */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="p-3 rounded-xl bg-card border border-border text-center">
                    <Truck className="w-5 h-5 text-primary mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-foreground">{lang === "ar" ? "شحن بنفسك" : "Ship It Yourself"}</p>
                    <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "أرسلها لعنوان المنظمة" : "Send to org address"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border text-center">
                    <MapPin className="w-5 h-5 text-primary mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-foreground">{lang === "ar" ? "استلام من موقعك" : "Schedule Pickup"}</p>
                    <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "نأتي لاستلامها" : "We come to you"}</p>
                  </div>
                </div>

                {/* Item categories preview */}
                <h2 className="text-base font-bold text-foreground mb-2">{lang === "ar" ? "ماذا يمكنك التبرع به؟" : "What Can You Donate?"}</h2>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {itemCategories.map((cat) => (
                    <div key={cat.id} className="p-3 rounded-xl bg-card border border-border text-center">
                      <span className="text-xl block mb-1">{cat.emoji}</span>
                      <p className="text-[10px] font-semibold text-foreground">{cat.label[lang]}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep("own-form")}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated flex items-center justify-center gap-2"
                >
                  {lang === "ar" ? "ابدأ التسجيل" : "Start Donation Form"} <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </>
        )}

        {/* ── Package Confirm (Buy mode) ── */}
        {step === "package-confirm" && pkg && (
          <>
            <div className="rounded-xl bg-card border border-border shadow-card p-4 mb-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{pkg.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{pkg.name[lang]}</p>
                  <p className="text-xs text-muted-foreground mt-1">{pkg.desc[lang]}</p>
                </div>
              </div>
              <div className="h-px bg-border my-3" />
              {[
                { label: { en: "Price", ar: "السعر" }, value: `${pkg.price} ${t("common.egp")}` },
                { label: { en: "Impact", ar: "الأثر" }, value: pkg.impact[lang] },
                { label: { en: "Delivery", ar: "التوصيل" }, value: lang === "ar" ? "مباشرة للمستفيدين" : "Direct to beneficiaries" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-muted-foreground">{row.label[lang]}</span>
                  <span className="text-xs font-semibold text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">{lang === "ar" ? "أثر هديتك" : "Your Gift's Impact"}</span>
              </div>
              <p className="text-sm text-foreground">{pkg.impact[lang]}</p>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                {lang === "ar"
                  ? "ستتلقى إيصال تأكيد وصور من التسليم خلال 7 أيام عمل."
                  : "You'll receive a confirmation receipt and delivery photos within 7 business days."}
              </p>
            </div>
          </>
        )}

        {/* ── Own Items Form ── */}
        {step === "own-form" && (
          <>
            {/* Categories */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                {lang === "ar" ? "نوع الأغراض" : "Item Category"} *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {itemCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                      className={`p-2.5 rounded-xl border-2 text-center transition-colors relative ${
                        isSelected ? "border-primary bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 end-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-2 h-2 text-primary-foreground" />
                        </div>
                      )}
                      <span className="text-lg block">{cat.emoji}</span>
                      <p className="text-[10px] font-semibold text-foreground mt-0.5">{cat.label[lang]}</p>
                    </button>
                  );
                })}
              </div>
              {errors.categories && <p className="text-[10px] text-destructive mt-1">{errors.categories}</p>}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                {lang === "ar" ? "وصف الأغراض" : "Describe Your Items"} *
              </label>
              <textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} maxLength={500} rows={3}
                placeholder={lang === "ar" ? "مثال: 4 كراسي خشبية، طاولة طعام، خزانة ملابس..." : "e.g., 4 wooden chairs, dining table, wardrobe..."}
                className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground resize-none transition-colors ${
                  errors.itemDescription ? "border-destructive" : "border-border focus:border-primary"
                }`}
              />
              <div className="flex justify-between">
                {errors.itemDescription && <p className="text-[10px] text-destructive mt-1">{errors.itemDescription}</p>}
                <p className="text-[10px] text-muted-foreground mt-1 ms-auto">{itemDescription.length}/500</p>
              </div>
            </div>

            {/* Condition */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                {lang === "ar" ? "حالة الأغراض" : "Item Condition"} *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: "excellent", label: { en: "Excellent", ar: "ممتازة" }, emoji: "✨" },
                  { val: "good", label: { en: "Good", ar: "جيدة" }, emoji: "👍" },
                  { val: "fair", label: { en: "Fair", ar: "مقبولة" }, emoji: "👌" },
                ].map((c) => (
                  <button key={c.val} onClick={() => setItemCondition(c.val)}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-colors ${
                      itemCondition === c.val ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground"
                    }`}
                  >{c.emoji} {c.label[lang]}</button>
                ))}
              </div>
              {errors.itemCondition && <p className="text-[10px] text-destructive mt-1">{errors.itemCondition}</p>}
            </div>

            {/* Delivery Method */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                {lang === "ar" ? "طريقة التسليم" : "Delivery Method"} *
              </label>
              <div className="space-y-2">
                {[
                  { val: "shipping" as const, icon: Truck, label: { en: "I'll Ship It Myself", ar: "سأشحنها بنفسي" }, desc: { en: "Drop off at a courier or ship to the organization's address", ar: "أوصلها لشركة شحن أو أرسلها لعنوان المنظمة" } },
                  { val: "pickup" as const, icon: MapPin, label: { en: "Schedule a Pickup", ar: "ترتيب استلام من موقعي" }, desc: { en: "We'll send someone to collect from your location", ar: "سنرسل شخصاً لاستلامها من موقعك" } },
                ].map((m) => {
                  const isSelected = deliveryMethod === m.val;
                  return (
                    <button key={m.val} onClick={() => setDeliveryMethod(m.val)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-start transition-colors ${
                        isSelected ? "border-primary bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <m.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{m.label[lang]}</p>
                        <p className="text-[10px] text-muted-foreground">{m.desc[lang]}</p>
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
              {errors.deliveryMethod && <p className="text-[10px] text-destructive mt-1">{errors.deliveryMethod}</p>}
            </div>

            <div className="h-px bg-border my-5" />

            {/* Contact Info */}
            <h2 className="text-sm font-bold text-foreground mb-3">{lang === "ar" ? "بيانات التواصل" : "Contact Details"}</h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">{lang === "ar" ? "الاسم الكامل" : "Full Name"} *</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100}
                  placeholder={lang === "ar" ? "أدخل اسمك" : "Enter your name"}
                  className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors ${errors.fullName ? "border-destructive" : "border-border focus:border-primary"}`}
                />
                {errors.fullName && <p className="text-[10px] text-destructive mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">{lang === "ar" ? "رقم الهاتف" : "Phone Number"} *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20}
                  placeholder="+20 1xx xxx xxxx"
                  className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground transition-colors ${errors.phone ? "border-destructive" : "border-border focus:border-primary"}`}
                />
                {errors.phone && <p className="text-[10px] text-destructive mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {deliveryMethod === "pickup"
                    ? (lang === "ar" ? "عنوان الاستلام" : "Pickup Address")
                    : (lang === "ar" ? "عنوانك" : "Your Address")} *
                </label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} rows={2}
                  placeholder={lang === "ar" ? "المنطقة، الشارع، المبنى..." : "Area, street, building..."}
                  className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground resize-none transition-colors ${errors.address ? "border-destructive" : "border-border focus:border-primary"}`}
                />
                {errors.address && <p className="text-[10px] text-destructive mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {deliveryMethod === "pickup"
                    ? (lang === "ar" ? "التاريخ المفضل للاستلام" : "Preferred Pickup Date")
                    : (lang === "ar" ? "تاريخ الشحن المتوقع" : "Expected Shipping Date")} *
                </label>
                <input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)}
                  className={`w-full p-3 rounded-xl border-2 bg-card text-sm text-foreground outline-none transition-colors ${errors.preferredDate ? "border-destructive" : "border-border focus:border-primary"}`}
                />
                {errors.preferredDate && <p className="text-[10px] text-destructive mt-1">{errors.preferredDate}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">{lang === "ar" ? "ملاحظات إضافية" : "Additional Notes"}</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} rows={2}
                  placeholder={lang === "ar" ? "اختياري" : "Optional"}
                  className="w-full p-3 rounded-xl border-2 border-border bg-card text-sm text-foreground outline-none placeholder:text-muted-foreground resize-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </>
        )}

        {/* ── Own Items Review ── */}
        {step === "own-review" && (
          <>
            <div className="rounded-xl bg-card border border-border shadow-card p-4 mb-5 space-y-4">
              <div className="flex items-center gap-3">
                <img src={cause.image} alt={cause.title[lang]} className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="text-xs text-muted-foreground">{lang === "ar" ? "تبرع لـ" : "Donating to"}</p>
                  <p className="text-sm font-semibold text-foreground">{cause.title[lang]}</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div>
                <p className="text-xs text-muted-foreground mb-1.5">{lang === "ar" ? "نوع الأغراض" : "Item Categories"}</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCategories.map((id) => {
                    const cat = itemCategories.find((c) => c.id === id);
                    return cat ? (
                      <span key={id} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {cat.emoji} {cat.label[lang]}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="h-px bg-border" />

              {[
                { label: { en: "Description", ar: "الوصف" }, value: itemDescription },
                { label: { en: "Condition", ar: "الحالة" }, value: itemCondition === "excellent" ? (lang === "ar" ? "✨ ممتازة" : "✨ Excellent") : itemCondition === "good" ? (lang === "ar" ? "👍 جيدة" : "👍 Good") : (lang === "ar" ? "👌 مقبولة" : "👌 Fair") },
                { label: { en: "Delivery", ar: "التسليم" }, value: deliveryMethod === "pickup" ? (lang === "ar" ? "📍 استلام من الموقع" : "📍 Pickup") : (lang === "ar" ? "🚚 شحن ذاتي" : "🚚 Self-shipping") },
                { label: { en: "Name", ar: "الاسم" }, value: fullName },
                { label: { en: "Phone", ar: "الهاتف" }, value: phone },
                { label: { en: "Address", ar: "العنوان" }, value: address },
                { label: { en: "Date", ar: "التاريخ" }, value: preferredDate },
              ].map((row, i) => (
                <div key={i} className="flex items-start justify-between">
                  <span className="text-xs text-muted-foreground">{row.label[lang]}</span>
                  <span className="text-xs font-semibold text-foreground text-end max-w-[60%]">{row.value}</span>
                </div>
              ))}

              {notes && (
                <>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{lang === "ar" ? "ملاحظات" : "Notes"}</p>
                    <p className="text-xs text-foreground">{notes}</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                {deliveryMethod === "pickup"
                  ? (lang === "ar" ? "سيتم التواصل معك لتأكيد موعد الاستلام. تأكد من أن الأغراض جاهزة." : "We'll contact you to confirm the pickup time. Please have items ready.")
                  : (lang === "ar" ? "سيتم إرسال عنوان الشحن ورقم التتبع لبريدك بعد التأكيد." : "Shipping address and tracking details will be sent to you after confirmation.")}
              </p>
            </div>
          </>
        )}

        {/* ── Success ── */}
        {step === "success" && (
          <div className="flex flex-col items-center text-center pt-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {mode === "buy"
                ? (lang === "ar" ? "تم إرسال الهدية!" : "Gift Sent!")
                : (lang === "ar" ? "تم تسجيل تبرعك!" : "Donation Registered!")}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-[300px]">
              {mode === "buy"
                ? (lang === "ar" ? `شكراً! سيتم تسليم "${pkg?.name[lang]}" للمستفيدين وستتلقى تأكيداً.` : `Thank you! "${pkg?.name[lang]}" will be delivered to beneficiaries and you'll receive confirmation.`)
                : (lang === "ar" ? `شكراً ${fullName}! تم تسجيل تبرعك بأغراضك. سنتواصل معك قريباً.` : `Thank you ${fullName}! Your item donation has been registered. We'll be in touch.`)}
            </p>

            <div className="w-full rounded-xl bg-card border border-border shadow-card p-4 mb-6 text-start space-y-3">
              <p className="text-xs text-muted-foreground font-medium">{lang === "ar" ? "ملخص" : "Summary"}</p>
              {mode === "buy" && pkg ? (
                [
                  { label: { en: "Gift", ar: "الهدية" }, value: pkg.name[lang] },
                  { label: { en: "Amount", ar: "المبلغ" }, value: `${pkg.price} ${t("common.egp")}` },
                  { label: { en: "Reference", ar: "المرجع" }, value: `#GFT-${Date.now().toString(36).toUpperCase().slice(-6)}` },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{row.label[lang]}</span>
                    <span className="text-xs font-semibold text-foreground">{row.value}</span>
                  </div>
                ))
              ) : (
                [
                  { label: { en: "Items", ar: "الأغراض" }, value: selectedCategories.map((id) => itemCategories.find((c) => c.id === id)?.label[lang]).join(", ") },
                  { label: { en: "Delivery", ar: "التسليم" }, value: deliveryMethod === "pickup" ? (lang === "ar" ? "استلام" : "Pickup") : (lang === "ar" ? "شحن" : "Shipping") },
                  { label: { en: "Date", ar: "التاريخ" }, value: preferredDate },
                  { label: { en: "Reference", ar: "المرجع" }, value: `#DON-${Date.now().toString(36).toUpperCase().slice(-6)}` },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{row.label[lang]}</span>
                    <span className="text-xs font-semibold text-foreground">{row.value}</span>
                  </div>
                ))
              )}
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
      {step === "package-confirm" && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
          <div>
            <span className="text-lg font-bold text-foreground">{pkg?.price} {t("common.egp")}</span>
            <span className="text-[10px] text-muted-foreground block">{pkg?.name[lang]}</span>
          </div>
          <button disabled={submitting} onClick={handleConfirm}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-70"
          >
            {submitting ? (lang === "ar" ? "جاري الإرسال..." : "Processing...") : (lang === "ar" ? "تأكيد الهدية" : "Confirm Gift")}
          </button>
        </div>
      )}
      {(step === "own-form" || step === "own-review") && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
          <div>
            <span className="text-sm font-bold text-foreground">
              {selectedCategories.length} {lang === "ar" ? "فئات" : "categories"}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {deliveryMethod === "pickup" ? (lang === "ar" ? "استلام" : "Pickup") : deliveryMethod === "shipping" ? (lang === "ar" ? "شحن" : "Shipping") : "—"}
            </span>
          </div>
          {step === "own-form" && (
            <button onClick={handleOwnSubmit}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated flex items-center gap-2"
            >
              {lang === "ar" ? "مراجعة" : "Review"} <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === "own-review" && (
            <button disabled={submitting} onClick={handleConfirm}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-70"
            >
              {submitting ? (lang === "ar" ? "جاري الإرسال..." : "Submitting...") : (lang === "ar" ? "تأكيد التبرع" : "Confirm Donation")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CauseSupportGift;
