import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Briefcase, CalendarDays } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  commissionKindLabel,
  commissionStatusClasses,
  commissionStatusLabel,
  feeDisclaimer,
} from "@/lib/commissions";

type Commission = {
  id: string;
  kind: string;
  title: string;
  brief: string | null;
  proposed_fee: number | null;
  currency: string | null;
  deadline: string | null;
  status: string;
  commissioner_id: string;
  deliverable_url: string | null;
  deliverable_post_id: string | null;
};

const ActorCommissionsList = () => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deliverFor, setDeliverFor] = useState<string | null>(null);
  const [deliverUrl, setDeliverUrl] = useState("");
  const [deliverPostId, setDeliverPostId] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["actor-commissions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("commissions")
        .select("id, kind, title, brief, proposed_fee, currency, deadline, status, commissioner_id, deliverable_url, deliverable_post_id")
        .eq("actor_user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const list = (rows ?? []) as Commission[];
      const ids = [...new Set(list.map((c) => c.commissioner_id))];
      let names: Record<string, string> = {};
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", ids);
        names = Object.fromEntries((profs ?? []).map((p) => [p.user_id, p.display_name ?? ""]));
      }
      return { list, names };
    },
  });

  const { data: myPosts = [] } = useQuery({
    queryKey: ["actor-published-posts", user?.id],
    enabled: !!user && !!deliverFor,
    queryFn: async () => {
      const { data: rows } = await supabase
        .from("posts")
        .select("id, title_en, title_ar")
        .eq("author_id", user!.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(50);
      return rows ?? [];
    },
  });

  type CommissionPatch = {
    status?: string;
    decline_reason?: string | null;
    deliverable_url?: string | null;
    deliverable_post_id?: string | null;
  };

  const update = async (id: string, patch: CommissionPatch, okMsg: string) => {
    setBusyId(id);
    const { error } = await supabase.from("commissions").update(patch).eq("id", id);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success(okMsg);
    queryClient.invalidateQueries({ queryKey: ["actor-commissions"] });
    queryClient.invalidateQueries({ queryKey: ["culture-actor-stats"] });
  };

  const decline = (id: string) => {
    const reason = window.prompt(ar ? "سبب الرفض (اختياري)" : "Reason for declining (optional)") ?? "";
    update(id, { status: "declined", decline_reason: reason || null }, ar ? "تم الرفض" : "Declined");
  };

  const deliver = (id: string) => {
    if (!deliverUrl.trim() && !deliverPostId) {
      toast.error(ar ? "أضف رابطاً أو اختر مقالاً" : "Add a link or pick an article");
      return;
    }
    update(
      id,
      {
        status: "delivered",
        deliverable_url: deliverUrl.trim() || null,
        deliverable_post_id: deliverPostId || null,
      },
      ar ? "تم تسجيل التسليم" : "Delivery recorded",
    ).then(() => {
      setDeliverFor(null);
      setDeliverUrl("");
      setDeliverPostId("");
    });
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

  const list = data?.list ?? [];

  return (
    <div className="bg-card rounded-xl shadow-card p-4">
      <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-role-culture-actor" />
        {ar ? "طلبات التكليف" : "Commissions"}
      </h3>
      <p className="text-[11px] text-muted-foreground mb-3">{feeDisclaimer(ar)}</p>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">{ar ? "جارٍ التحميل..." : "Loading..."}</p>
      ) : list.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {ar ? "لا توجد طلبات تكليف بعد." : "No commissions yet."}
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <div key={c.id} className="rounded-lg border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {commissionKindLabel(c.kind, ar)}
                    {" · "}
                    {data?.names[c.commissioner_id] || (ar ? "عضو" : "Member")}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${commissionStatusClasses(c.status)}`}>
                  {commissionStatusLabel(c.status, ar)}
                </span>
              </div>

              {c.brief && <p className="text-[11px] text-muted-foreground mt-2 line-clamp-3">{c.brief}</p>}

              <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                {c.proposed_fee != null && (
                  <span>
                    {ar ? "رسوم استرشادية: " : "Indicative fee: "}
                    {c.proposed_fee} {c.currency ?? "EGP"}
                  </span>
                )}
                {c.deadline && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {c.deadline}
                  </span>
                )}
              </div>

              {c.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <button
                    disabled={busyId === c.id}
                    onClick={() => update(c.id, { status: "accepted" }, ar ? "تم القبول" : "Accepted")}
                    className="flex-1 rounded-lg bg-role-culture-actor py-2 text-[11px] font-semibold text-white disabled:opacity-60"
                  >
                    {ar ? "قبول" : "Accept"}
                  </button>
                  <button
                    disabled={busyId === c.id}
                    onClick={() => decline(c.id)}
                    className="flex-1 rounded-lg border border-border py-2 text-[11px] font-semibold text-foreground disabled:opacity-60"
                  >
                    {ar ? "رفض" : "Decline"}
                  </button>
                </div>
              )}

              {c.status === "accepted" && (
                <div className="mt-3">
                  {deliverFor === c.id ? (
                    <div className="space-y-2">
                      <input
                        value={deliverUrl}
                        onChange={(e) => setDeliverUrl(e.target.value)}
                        className={inputClass}
                        placeholder={ar ? "رابط التسليم" : "Deliverable URL"}
                      />
                      <select value={deliverPostId} onChange={(e) => setDeliverPostId(e.target.value)} className={inputClass}>
                        <option value="">{ar ? "أو اختر أحد مقالاتك" : "…or pick one of your articles"}</option>
                        {myPosts.map((p: any) => (
                          <option key={p.id} value={p.id}>{ar ? p.title_ar : p.title_en}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          disabled={busyId === c.id}
                          onClick={() => deliver(c.id)}
                          className="flex-1 rounded-lg bg-role-culture-actor py-2 text-[11px] font-semibold text-white disabled:opacity-60"
                        >
                          {ar ? "تأكيد التسليم" : "Confirm delivery"}
                        </button>
                        <button
                          onClick={() => setDeliverFor(null)}
                          className="rounded-lg border border-border px-3 py-2 text-[11px] font-semibold text-foreground"
                        >
                          {ar ? "إلغاء" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeliverFor(c.id)}
                      className="w-full rounded-lg border-2 border-role-culture-actor py-2 text-[11px] font-semibold text-role-culture-actor"
                    >
                      {ar ? "تسليم العمل" : "Deliver"}
                    </button>
                  )}
                </div>
              )}

              {(c.deliverable_url || c.deliverable_post_id) && (
                <p className="mt-2 text-[10px] text-muted-foreground truncate">
                  {ar ? "التسليم: " : "Delivered: "}
                  {c.deliverable_url ? (
                    <a href={c.deliverable_url} target="_blank" rel="noreferrer" className="text-primary underline">
                      {c.deliverable_url}
                    </a>
                  ) : (
                    <a href={`/post/${c.deliverable_post_id}`} className="text-primary underline">
                      {ar ? "مقال داخل التطبيق" : "On-platform article"}
                    </a>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActorCommissionsList;
