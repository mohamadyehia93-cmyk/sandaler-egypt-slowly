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
 * One page for all four program actions. Every action inserts a real
 * volunteer_applications row (org_owner_id and status are set by the insert
 * trigger, never by the client) so the organisation can follow up.
 *
 * Donate and gift collect pledge specifics (amount / preferred payment method,
 * or item, quantity and hand-over method) and state plainly that nothing is
 * charged or collected in the app — the organisation arranges it with the
 * supporter.
 */
const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

const PAY_METHODS = [
  { id: "cash", en: "Cash / in person", ar: "نقداً / باليد" },
  { id: "wallet", en: "Mobile wallet (Vodafone Cash, Fawry)", ar: "محفظة إلكترونية (فودافون كاش، فوري)" },
  { id: "bank", en: "Bank transfer", ar: "تحويل بنكي" },
  { id: "other", en: "Other — discuss with the organisation", ar: "أخرى — بالتنسيق مع المنظمة" },
];

const HANDOVER = [
  { id: "dropoff", en: "I will drop it off", ar: "سأقوم بتوصيلها" },
  { id: "pickup", en: "Organisation picks it up", ar: "المنظمة تستلمها" },
  { id: "courier", en: "Courier / shipping", ar: "شركة توصيل" },
];

const ProgramSupport = () => {
  const { id, action } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { user } = useAuth();
  const ar = lang === "ar";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");
  // Donate specifics
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [payMethod, setPayMethod] = useState("cash");
  const [recurring, setRecurring] = useState(false);
  // Gift specifics
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [handover, setHandover] = useState("dropoff");
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
  const title = ar ? (program.title_ar || program.title_en) : program.title_en;
  const ownerId: string | null = program.owner_id ?? null;
  const isConsult = config.key === "consult";
  const isDonate = config.key === "donate";
  const isGift = config.key === "gift";
  const noPayment = isDonate || isGift;
  const finalAmount = useCustom ? parseInt(customAmount) || 0 : amount;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = ar ? "مطلوب" : "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = ar ? "بريد إلكتروني غير صالح" : "Invalid email";
    if (phone.trim().length < 8) e.phone = ar ? "رقم غير صالح" : "Invalid number";
    if (isDonate && finalAmount < 1) e.amount = ar ? "أدخل مبلغاً صحيحاً" : "Enter a valid amount";
    if (isGift && itemName.trim().length < 3) e.itemName = ar ? "اذكر ما تريد التبرع به" : "Describe what you want to give";
    if (!noPayment && message.trim().length < 10) e.message = ar ? "10 أحرف على الأقل" : "At least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildMessage = () => {
    if (isDonate) {
      const method = PAY_METHODS.find((m) => m.id === payMethod);
      const lines = [
        `Donation pledge: ${finalAmount} EGP${recurring ? " / month" : ""}`,
        `Preferred method: ${method?.en ?? payMethod}`,
      ];
      if (message.trim()) lines.push(`Note: ${message.trim()}`);
      return lines.join("\n");
    }
    if (isGift) {
      const method = HANDOVER.find((m) => m.id === handover);
      const lines = [
        `Gift offer: ${itemName.trim()} × ${quantity || "1"}`,
        `Hand-over: ${method?.en ?? handover}`,
      ];
      if (message.trim()) lines.push(`Note: ${message.trim()}`);
      return lines.join("\n");
    }
    return `${config.label.en}: ${message.trim()}`;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error(ar ? "يرجى تسجيل الدخول أولاً" : "Please sign in first");
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
      message: buildMessage(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(ar ? "تعذر إرسال الطلب" : "Could not submit your request");
      return;
    }
    toast.success(ar ? "تم إرسال طلبك" : "Your request was sent");
    setSent(true);
  };

  const inputClass = (key: string) =>
    `w-full rounded-xl border-2 bg-card p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground ${
      errors[key] ? "border-destructive" : "border-border focus:border-primary"
    }`;

  const chipClass = (active: boolean) =>
    `w-full rounded-xl border-2 p-3 text-start text-xs font-medium transition-colors ${
      active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground"
    }`;

  return (
    <div className="min-h-screen bg-surface pb-16">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <button onClick={() => navigate(`/program/${id}`)} className="rounded-full p-1.5 hover:bg-secondary" aria-label={ar ? "رجوع" : "Back"}>
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
              {ar
                ? "لا توجد جهة يمكنها استقبال هذا الطلب لهذا البرنامج حالياً."
                : "No organisation can currently receive this request for this program."}
            </p>
          </div>
        ) : sent ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-primary" />
            <p className="text-sm font-bold text-foreground">
              {noPayment ? (ar ? "تم تسجيل تعهدك" : "Your pledge was registered") : (ar ? "تم إرسال طلبك" : "Your request was sent")}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {noPayment
                ? (ar
                  ? "لم يتم تحصيل أي مبلغ في التطبيق. ستتواصل معك المنظمة لترتيب التفاصيل."
                  : "Nothing was charged in the app. The organisation will contact you to arrange the details.")
                : (ar
                  ? "ستتواصل معك المنظمة عبر الرسائل داخل التطبيق أو بيانات الاتصال التي أدخلتها."
                  : "The organisation will reply through in-app messages or the contact details you provided.")}
            </p>
            <button onClick={() => navigate(`/program/${id}`)} className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
              {ar ? "رجوع للبرنامج" : "Back to program"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {noPayment && (
              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-4">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {ar
                    ? "لا يوجد دفع أو تسليم داخل التطبيق. املأ التفاصيل أدناه وستتواصل معك المنظمة لترتيبها."
                    : "There is no in-app payment or delivery. Fill in the details below and the organisation will contact you to arrange it."}
                </p>
              </div>
            )}

            {isDonate && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">{ar ? "المبلغ" : "Amount"} *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((a) => (
                      <button key={a} onClick={() => { setAmount(a); setUseCustom(false); }} className={chipClass(!useCustom && amount === a)}>
                        {a} {ar ? "ج.م" : "EGP"}
                      </button>
                    ))}
                    <button onClick={() => setUseCustom(true)} className={chipClass(useCustom)}>
                      {ar ? "مبلغ آخر" : "Other"}
                    </button>
                  </div>
                  {useCustom && (
                    <input
                      type="number"
                      min={1}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className={`${inputClass("amount")} mt-2`}
                      placeholder={ar ? "أدخل المبلغ بالجنيه" : "Enter amount in EGP"}
                    />
                  )}
                  {errors.amount && <p className="mt-1 text-[10px] text-destructive">{errors.amount}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">{ar ? "الطريقة المفضلة" : "Preferred method"}</label>
                  <div className="space-y-2">
                    {PAY_METHODS.map((m) => (
                      <button key={m.id} onClick={() => setPayMethod(m.id)} className={chipClass(payMethod === m.id)}>
                        {ar ? m.ar : m.en}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center justify-between rounded-xl border-2 border-border bg-card p-3">
                  <span className="text-xs font-medium text-foreground">{ar ? "تعهد شهري متكرر" : "Repeat this monthly"}</span>
                  <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                </label>
              </>
            )}

            {isGift && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">{ar ? "ما الذي تريد التبرع به؟" : "What are you giving?"} *</label>
                  <input value={itemName} onChange={(e) => setItemName(e.target.value)} maxLength={120} className={inputClass("itemName")} placeholder={ar ? "مثال: 20 حقيبة مدرسية" : "e.g. 20 school backpacks"} />
                  {errors.itemName && <p className="mt-1 text-[10px] text-destructive">{errors.itemName}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">{ar ? "الكمية" : "Quantity"}</label>
                  <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass("quantity")} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">{ar ? "طريقة التسليم" : "Hand-over"}</label>
                  <div className="space-y-2">
                    {HANDOVER.map((m) => (
                      <button key={m.id} onClick={() => setHandover(m.id)} className={chipClass(handover === m.id)}>
                        {ar ? m.ar : m.en}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">{ar ? "الاسم الكامل" : "Full Name"} *</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} className={inputClass("fullName")} placeholder={ar ? "أدخل اسمك" : "Enter your name"} />
              {errors.fullName && <p className="mt-1 text-[10px] text-destructive">{errors.fullName}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">{ar ? "البريد الإلكتروني" : "Email"} *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className={inputClass("email")} placeholder="example@email.com" />
              {errors.email && <p className="mt-1 text-[10px] text-destructive">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">{ar ? "رقم الهاتف" : "Phone Number"} *</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className={inputClass("phone")} placeholder="+20 1xx xxx xxxx" />
              {errors.phone && <p className="mt-1 text-[10px] text-destructive">{errors.phone}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                {noPayment
                  ? (ar ? "التاريخ المفضل (اختياري)" : "Preferred date (optional)")
                  : isConsult
                    ? (ar ? "التوفر (اختياري)" : "Availability (optional)")
                    : (ar ? "تاريخ البدء المفضل" : "Preferred start date")}
              </label>
              <input type="date" value={availability} onChange={(e) => setAvailability(e.target.value)} className={inputClass("availability")} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                {noPayment
                  ? (ar ? "ملاحظة للمنظمة (اختياري)" : "Note to the organisation (optional)")
                  : isConsult
                    ? (ar ? "خبرتك وكيف يمكنك المساعدة" : "Your expertise and how you can help")
                    : (ar ? "لماذا تريد التطوع؟" : "Why do you want to volunteer?")}
                {!noPayment && " *"}
              </label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={4} className={`${inputClass("message")} resize-none`} placeholder={ar ? "اكتب هنا..." : "Tell the organisation more..."} />
              {errors.message && <p className="mt-1 text-[10px] text-destructive">{errors.message}</p>}
            </div>

            <button onClick={handleSubmit} disabled={submitting} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {submitting
                ? (ar ? "جارٍ الإرسال..." : "Sending...")
                : noPayment
                  ? (ar ? "تسجيل التعهد" : "Register pledge")
                  : (ar ? "إرسال الطلب" : "Send request")}
            </button>

            <MessageOwnerButton ownerId={ownerId} kind="auto" label={ar ? "مراسلة المنظمة" : "Message organization"} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramSupport;
