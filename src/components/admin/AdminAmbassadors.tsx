import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

/**
 * Ambassador is a CAPABILITY, not a role: it is granted per account in
 * `user_roles` and can sit on top of any provider role (or none at all).
 * Only admins can grant or revoke it — enforced by RLS, not by this UI.
 */
const AdminAmbassadors = () => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: people = [], isLoading } = useQuery({
    queryKey: ["admin-people"],
    queryFn: async () => {
      const [{ data: profiles, error }, { data: roles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role").eq("role", "ambassador"),
      ]);
      if (error) throw error;
      const amb = new Set((roles ?? []).map((r) => r.user_id));
      return (profiles ?? []).map((p) => ({ ...p, isAmbassador: amb.has(p.user_id) }));
    },
  });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return people;
    return people.filter(
      (p) =>
        (p.display_name ?? "").toLowerCase().includes(needle) ||
        p.user_id.toLowerCase().includes(needle),
    );
  }, [people, q]);

  const ambassadorCount = people.filter((p) => p.isAmbassador).length;

  const toggle = async (userId: string, currentlyAmbassador: boolean) => {
    setBusyId(userId);
    const { error } = currentlyAmbassador
      ? await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "ambassador")
      : await supabase.from("user_roles").insert({ user_id: userId, role: "ambassador" });
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      currentlyAmbassador
        ? ar ? "تم سحب صفة السفير." : "Ambassador capability revoked."
        : ar ? "تم منح صفة السفير." : "Ambassador capability granted.",
    );
    queryClient.invalidateQueries({ queryKey: ["admin-people"] });
    queryClient.invalidateQueries({ queryKey: ["is-ambassador"] });
  };

  return (
    <div className="space-y-3">
      <div className="bg-background rounded-xl border border-border p-3">
        <p className="text-xs text-muted-foreground">
          {ar
            ? `${ambassadorCount} سفير. السفير ليس دوراً بل صفة تُمنح لأي حساب وتتيح الإبلاغ عن المشكلات.`
            : `${ambassadorCount} ambassador${ambassadorCount === 1 ? "" : "s"}. Ambassador is a capability, not a role — it can be granted to any account and unlocks flag reporting.`}
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 start-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={ar ? "ابحث بالاسم" : "Search by name"}
          className="w-full bg-background border border-border rounded-xl ps-9 pe-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">{ar ? "جارٍ التحميل…" : "Loading…"}</p>}
      {!isLoading && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">{ar ? "لا توجد حسابات." : "No accounts found."}</p>
      )}

      {filtered.map((p) => (
        <div key={p.user_id} className="bg-background rounded-xl border border-border p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground">
            {p.avatar_url ? (
              <img src={p.avatar_url} alt={p.display_name ?? ""} className="w-full h-full object-cover" />
            ) : (
              (p.display_name ?? "?").slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">
              {p.display_name || (ar ? "بدون اسم" : "Unnamed")}
            </p>
            {p.isAmbassador && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-dark bg-primary/10 px-2 py-0.5 rounded-full mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                {ar ? "سفير" : "Ambassador"}
              </span>
            )}
          </div>
          <button
            onClick={() => toggle(p.user_id, p.isAmbassador)}
            disabled={busyId === p.user_id}
            className={`text-[11px] font-semibold px-3 py-2 rounded-lg border inline-flex items-center gap-1.5 disabled:opacity-60 ${
              p.isAmbassador
                ? "border-destructive/40 text-destructive"
                : "border-primary text-primary"
            }`}
          >
            {busyId === p.user_id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : p.isAmbassador ? (
              <UserMinus className="w-3.5 h-3.5" />
            ) : (
              <UserPlus className="w-3.5 h-3.5" />
            )}
            {p.isAmbassador ? (ar ? "سحب" : "Revoke") : ar ? "منح" : "Grant"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminAmbassadors;
