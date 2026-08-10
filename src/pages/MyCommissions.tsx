import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import {
  commissionKindLabel,
  commissionStatusClasses,
  commissionStatusLabel,
  feeDisclaimer,
} from "@/lib/commissions";

const MyCommissions = () => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["my-commissions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commissions")
        .select("id, kind, title, brief, proposed_fee, currency, deadline, status, decline_reason, deliverable_url, deliverable_post_id, actor:culture_actors(id, slug, name_en, name_ar, image)")
        .eq("commissioner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const update = async (id: string, patch: { status?: string }, okMsg: string) => {
    setBusyId(id);
    const { error } = await supabase.from("commissions").update(patch).eq("id", id);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success(okMsg);
    queryClient.invalidateQueries({ queryKey: ["my-commissions"] });
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-card border-b border-border px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <h1 className="text-base font-bold text-foreground flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" />
          {ar ? "التكليفات التي أرسلتها" : "Commissions I've sent"}
        </h1>
      </header>

      <div className="px-4 py-4 space-y-3">
        <p className="text-[11px] text-muted-foreground bg-card rounded-lg p-3 shadow-card">{feeDisclaimer(ar)}</p>

        {!user ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            {ar ? "سجّل الدخول لعرض تكليفاتك" : "Sign in to see your commissions"}
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-10">{ar ? "جارٍ التحميل..." : "Loading..."}</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            {ar ? "لم ترسل أي تكليف بعد." : "You haven't sent any commissions yet."}
          </p>
        ) : (
          rows.map((c) => (
            <div key={c.id} className="bg-card rounded-xl shadow-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {commissionKindLabel(c.kind, ar)}
                    {c.actor && (
                      <>
                        {" · "}
                        <button
                          onClick={() => navigate(`/culture-actor/${c.actor.slug ?? c.actor.id}`)}
                          className="text-primary underline"
                        >
                          {ar ? c.actor.name_ar : c.actor.name_en}
                        </button>
                      </>
                    )}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${commissionStatusClasses(c.status)}`}>
                  {commissionStatusLabel(c.status, ar)}
                </span>
              </div>

              {c.brief && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{c.brief}</p>}

              <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                {c.proposed_fee != null && (
                  <span>{ar ? "رسوم استرشادية: " : "Indicative fee: "}{c.proposed_fee} {c.currency ?? "EGP"}</span>
                )}
                {c.deadline && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{c.deadline}</span>}
              </div>

              {c.status === "declined" && c.decline_reason && (
                <p className="text-[11px] text-destructive mt-2">{ar ? "السبب: " : "Reason: "}{c.decline_reason}</p>
              )}

              {(c.deliverable_url || c.deliverable_post_id) && (
                <p className="mt-2 text-[11px] truncate">
                  {ar ? "التسليم: " : "Deliverable: "}
                  {c.deliverable_url ? (
                    <a href={c.deliverable_url} target="_blank" rel="noreferrer" className="text-primary underline">{c.deliverable_url}</a>
                  ) : (
                    <a href={`/post/${c.deliverable_post_id}`} className="text-primary underline">
                      {ar ? "مقال داخل التطبيق" : "On-platform article"}
                    </a>
                  )}
                </p>
              )}

              <div className="flex gap-2 mt-3">
                {c.status === "pending" && (
                  <button
                    disabled={busyId === c.id}
                    onClick={() => update(c.id, { status: "cancelled" }, ar ? "تم إلغاء التكليف" : "Commission cancelled")}
                    className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-foreground disabled:opacity-60"
                  >
                    {ar ? "إلغاء الطلب" : "Cancel request"}
                  </button>
                )}
                {c.status === "delivered" && (
                  <button
                    disabled={busyId === c.id}
                    onClick={() => update(c.id, { status: "completed" }, ar ? "تم وضع علامة مكتمل" : "Marked complete")}
                    className="flex-1 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {ar ? "تم الاستلام — إكمال" : "Mark complete"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyCommissions;
