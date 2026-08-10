import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, HandCoins, Phone } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type PledgeRow = {
  id: string;
  kind: string;
  amount: number | null;
  currency: string;
  message: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
  cause: { title_en: string; title_ar: string } | null;
};

export const pledgeKindLabel = (kind: string, ar: boolean) => {
  switch (kind) {
    case "donation": return ar ? "تبرع" : "Donation";
    case "gift": return ar ? "هدية" : "Gift";
    case "consult": return ar ? "استشارة" : "Consultation";
    default: return kind;
  }
};

export const pledgeStatusLabel = (status: string, ar: boolean) => {
  switch (status) {
    case "pending": return ar ? "بانتظار تواصل المنظمة" : "Awaiting contact";
    case "contacted": return ar ? "تم التواصل" : "Contacted";
    case "completed": return ar ? "مكتمل" : "Completed";
    case "declined": return ar ? "مرفوض" : "Declined";
    case "cancelled": return ar ? "ملغي" : "Cancelled";
    default: return status;
  }
};

export const pledgeStatusClasses = (status: string) => {
  if (status === "completed") return "bg-success/10 text-success";
  if (status === "contacted") return "bg-primary/10 text-primary";
  if (status === "pending") return "bg-warning/10 text-warning";
  if (status === "declined") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
};

const TERMINAL = ["completed", "declined", "cancelled"];

const CausePledgesList = () => {
  const { lang } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ar = lang === "ar";
  const locale = ar ? "ar-EG" : "en-US";
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: pledges = [], isLoading } = useQuery({
    queryKey: ["cause-pledges", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_pledges")
        .select(
          "id, kind, amount, currency, message, contact_name, contact_email, contact_phone, status, created_at, cause:causes(title_en, title_ar)"
        )
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as PledgeRow[];
    },
  });

  const updateStatus = async (id: string, status: "contacted" | "completed" | "declined") => {
    setSavingId(id);
    const { error } = await supabase.from("support_pledges").update({ status }).eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error(ar ? "تعذر تحديث التعهد" : "Could not update the pledge");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["cause-pledges", user?.id] });
  };

  return (
    <div className="bg-card rounded-xl shadow-card p-4">
      <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
        <HandCoins className="w-4 h-4 text-role-organization" />
        {ar ? "تعهدات الدعم" : "Support pledges"}
      </h3>
      <p className="text-[10px] text-muted-foreground mb-3">
        {ar
          ? "لم يتم تحصيل أي مبالغ — تواصل مع الداعم لترتيب الدفع أو التسليم."
          : "No money has been collected — contact the supporter to arrange payment or delivery."}
      </p>

      {isLoading ? (
        <p className="text-xs text-muted-foreground py-3">{ar ? "جاري التحميل..." : "Loading..."}</p>
      ) : pledges.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3">{ar ? "لا توجد تعهدات بعد" : "No pledges yet"}</p>
      ) : (
        pledges.map((p) => {
          const terminal = TERMINAL.includes(p.status);
          return (
            <div key={p.id} className="py-2.5 border-b border-border last:border-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">
                    {pledgeKindLabel(p.kind, ar)}
                    {p.amount ? ` · ${p.amount} ${p.currency}` : ""}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {p.cause ? (ar ? p.cause.title_ar : p.cause.title_en) : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {p.contact_name ? `${p.contact_name} · ` : ""}
                    {new Date(p.created_at).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                  </p>
                  {(p.contact_email || p.contact_phone) && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1" dir="auto">
                      <Phone className="w-3 h-3" />
                      {p.contact_email}
                      {p.contact_email && p.contact_phone ? " · " : ""}
                      {p.contact_phone}
                    </p>
                  )}
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${pledgeStatusClasses(p.status)}`}>
                  {pledgeStatusLabel(p.status, ar)}
                </span>
              </div>

              {p.message && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-3">{p.message}</p>}

              {!terminal && (
                <div className="flex items-center gap-2 mt-2">
                  {p.status === "pending" && (
                    <button
                      disabled={savingId === p.id}
                      onClick={() => updateStatus(p.id, "contacted")}
                      className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-primary/10 text-primary disabled:opacity-50"
                    >
                      {ar ? "تم التواصل" : "Mark contacted"}
                    </button>
                  )}
                  <button
                    disabled={savingId === p.id}
                    onClick={() => updateStatus(p.id, "completed")}
                    className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-role-organization text-white flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" /> {ar ? "مكتمل" : "Complete"}
                  </button>
                  <button
                    disabled={savingId === p.id}
                    onClick={() => updateStatus(p.id, "declined")}
                    className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" /> {ar ? "رفض" : "Decline"}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default CausePledgesList;
