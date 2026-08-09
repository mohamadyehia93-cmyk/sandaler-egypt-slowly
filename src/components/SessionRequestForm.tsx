import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  meetupId: string;
  meetupTitle: string;
  onDone?: () => void;
};

const SessionRequestForm = ({ meetupId, meetupTitle, onDone }: Props) => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [preferredDate, setPreferredDate] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user) {
      toast.error(ar ? "يرجى تسجيل الدخول أولاً" : "Please sign in first");
      navigate("/login");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("session_requests").insert({
      meetup_id: meetupId,
      requester_id: user.id,
      preferred_date: preferredDate || null,
      message: message || null,
      contact_email: email || null,
      contact_phone: phone || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(ar ? "تم إرسال طلبك" : "Request sent", {
      description: ar ? "تابع حالة الطلب في طلبات الجلسات" : "Track it in My Session Requests",
      action: {
        label: ar ? "عرض" : "View",
        onClick: () => navigate("/session-requests"),
      },
    });
    onDone?.();
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{meetupTitle}</p>
      <div>
        <label className="text-xs font-semibold text-foreground">{ar ? "التاريخ المفضل" : "Preferred date"}</label>
        <input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} className={`${inputClass} mt-1`} />
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground">{ar ? "البريد الإلكتروني" : "Contact email"}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} mt-1`} placeholder="you@example.com" />
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground">{ar ? "رقم الهاتف" : "Contact phone"}</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputClass} mt-1`} placeholder="+20…" />
      </div>
      <div>
        <label className="text-xs font-semibold text-foreground">{ar ? "رسالتك" : "Message"}</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className={`${inputClass} mt-1 resize-none`}
          placeholder={ar ? "ما الذي تريد مناقشته؟" : "What would you like to discuss?"}
        />
      </div>
      <button
        onClick={submit}
        disabled={saving}
        className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {saving ? (ar ? "جاري الإرسال…" : "Sending…") : ar ? "إرسال الطلب" : "Send request"}
      </button>
    </div>
  );
};

export default SessionRequestForm;
