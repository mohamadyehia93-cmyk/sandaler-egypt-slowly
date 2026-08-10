import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { COMMISSION_KINDS, feeDisclaimer } from "@/lib/commissions";

type Props = {
  cultureActorId: string;
  actorName: string;
  /** null when the profile has not been claimed by a real account yet */
  actorUserId: string | null;
  onDone?: () => void;
};

const CommissionForm = ({ cultureActorId, actorName, actorUserId, onDone }: Props) => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuth();

  const [kind, setKind] = useState<string>("article");
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [fee, setFee] = useState("");
  const [currency, setCurrency] = useState("EGP");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

  if (!actorUserId) {
    return (
      <p className="text-xs text-muted-foreground leading-relaxed">
        {ar
          ? "لم يتم ربط هذا الملف بحساب بعد، لذا لا يمكنه استلام طلبات التكليف حالياً."
          : "This profile has not been claimed by an account yet, so it cannot receive commissions."}
      </p>
    );
  }

  const submit = async () => {
    if (!user) {
      toast.error(ar ? "يرجى تسجيل الدخول أولاً" : "Please sign in first");
      navigate("/login");
      return;
    }
    if (!title.trim()) {
      toast.error(ar ? "أضف عنواناً للتكليف" : "Add a title for the commission");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("commissions").insert({
      culture_actor_id: cultureActorId,
      commissioner_id: user.id,
      kind,
      title: title.trim(),
      brief: brief.trim() || null,
      proposed_fee: fee ? Number(fee) : null,
      currency,
      deadline: deadline || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(ar ? "تم إرسال طلب التكليف" : "Commission request sent", {
      description: ar
        ? "هذا طلب فقط ولم يتم تحصيل أي مبلغ. سيقوم الفاعل الثقافي بالرد."
        : "This is a request — no payment has been taken. The culture actor will respond.",
      action: { label: ar ? "عرض" : "View", onClick: () => navigate("/commissions") },
    });
    onDone?.();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{actorName}</p>

      <div>
        <label className="text-xs font-semibold text-foreground">{ar ? "نوع المساهمة" : "Kind of contribution"}</label>
        <select value={kind} onChange={(e) => setKind(e.target.value)} className={`${inputClass} mt-1`}>
          {COMMISSION_KINDS.map((k) => (
            <option key={k.value} value={k.value}>{ar ? k.ar : k.en}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground">{ar ? "العنوان" : "Title"}</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${inputClass} mt-1`}
          placeholder={ar ? "مثال: مقال عن حرف أسوان" : "e.g. An essay on Aswan crafts"}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground">{ar ? "الموجز" : "Brief"}</label>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={4}
          className={`${inputClass} mt-1 resize-none`}
          placeholder={ar ? "ما الذي تريده بالتحديد؟" : "What exactly are you asking for?"}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs font-semibold text-foreground">{ar ? "رسوم استرشادية" : "Indicative fee"}</label>
          <input
            type="number"
            min="0"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className={`${inputClass} mt-1`}
            placeholder="0"
          />
        </div>
        <div className="w-24">
          <label className="text-xs font-semibold text-foreground">{ar ? "العملة" : "Currency"}</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`${inputClass} mt-1`}>
            <option value="EGP">EGP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground">{ar ? "الموعد النهائي" : "Deadline"}</label>
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={`${inputClass} mt-1`} />
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed bg-secondary rounded-lg p-2.5">
        {feeDisclaimer(ar)}
      </p>

      <button
        onClick={submit}
        disabled={saving}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {saving ? (ar ? "جارٍ الإرسال..." : "Sending...") : ar ? "إرسال طلب التكليف" : "Send commission request"}
      </button>
    </div>
  );
};

export default CommissionForm;
