import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, HandCoins, X } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { pledgeKindLabel, pledgeStatusClasses, pledgeStatusLabel } from "@/components/CausePledgesList";

type PledgeRow = {
  id: string;
  kind: string;
  amount: number | null;
  currency: string;
  message: string | null;
  status: string;
  created_at: string;
  cause: { id: string; slug: string | null; title_en: string; title_ar: string; image: string | null } | null;
};

const MyPledges = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ar = lang === "ar";
  const locale = ar ? "ar-EG" : "en-US";
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: pledges = [], isLoading } = useQuery({
    queryKey: ["my-pledges", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_pledges")
        .select("id, kind, amount, currency, message, status, created_at, cause:causes(id, slug, title_en, title_ar, image)")
        .eq("supporter_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as PledgeRow[];
    },
  });

  const cancel = async (id: string) => {
    setSavingId(id);
    const { error } = await supabase.from("support_pledges").update({ status: "cancelled" }).eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error(ar ? "تعذر إلغاء التعهد" : "Could not cancel the pledge");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["my-pledges", user?.id] });
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{ar ? "تعهداتي" : "My Pledges"}</h1>
      </header>

      <div className="px-4 py-5 space-y-3">
        <p className="text-[11px] text-muted-foreground">
          {ar
            ? "تعهدات الدعم لا تتضمن أي دفع داخل التطبيق. ستتواصل المنظمة معك لترتيب التفاصيل."
            : "Support pledges do not take any in-app payment. The organisation will contact you to arrange the details."}
        </p>

        {!user ? (
          <p className="text-center text-sm text-muted-foreground py-12">{ar ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
        ) : isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-12">{ar ? "جاري التحميل..." : "Loading..."}</p>
        ) : pledges.length === 0 ? (
          <div className="text-center py-16">
            <HandCoins className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{ar ? "لا توجد تعهدات بعد" : "No pledges yet"}</p>
          </div>
        ) : (
          pledges.map((p) => (
            <div key={p.id} className="bg-card rounded-xl shadow-card p-3">
              <div className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                  {p.cause?.image ? <img src={p.cause.image} alt="" className="w-full h-full object-cover" /> : <HandCoins className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">
                    {p.cause ? (ar ? p.cause.title_ar : p.cause.title_en) : "—"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {pledgeKindLabel(p.kind, ar)}
                    {p.amount ? ` · ${p.amount} ${p.currency}` : ""}
                    {" · "}
                    {new Date(p.created_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${pledgeStatusClasses(p.status)}`}>
                  {pledgeStatusLabel(p.status, ar)}
                </span>
              </div>
              {p.status === "pending" && (
                <button
                  disabled={savingId === p.id}
                  onClick={() => cancel(p.id)}
                  className="mt-2 text-[11px] font-semibold py-1.5 px-3 rounded-lg bg-destructive/10 text-destructive inline-flex items-center gap-1 disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" /> {ar ? "إلغاء" : "Cancel"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default MyPledges;
