import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MessageUserButton from "@/components/MessageUserButton";

const SessionRequestsList = ({ accentText = "text-primary" }: { accentText?: string }) => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["incoming-session-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_requests")
        .select("id, status, preferred_date, message, contact_email, contact_phone, requester_id, created_at, meetup:meetups(id, title_en, title_ar)")
        .eq("expert_owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as any[];
      const ids = [...new Set(rows.map((r) => r.requester_id))];
      let names: Record<string, string> = {};
      if (ids.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", ids);
        names = Object.fromEntries((profiles ?? []).map((p: any) => [p.user_id, p.display_name]));
      }
      return rows.map((r) => ({ ...r, requester_name: names[r.requester_id] || null }));
    },
  });

  const setStatus = async (id: string, status: "accepted" | "declined") => {
    setSavingId(id);
    const { error } = await supabase.from("session_requests").update({ status }).eq("id", id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success(status === "accepted" ? (ar ? "تم القبول" : "Accepted") : ar ? "تم الرفض" : "Declined");
    queryClient.invalidateQueries({ queryKey: ["incoming-session-requests"] });
  };

  const pending = requests.filter((r: any) => r.status === "pending");

  if (!user) return null;

  return (
    <div className="rounded-xl bg-card p-4 shadow-card">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
        <CalendarClock className={`h-4 w-4 ${accentText}`} />
        {ar ? "طلبات الجلسات" : "Session Requests"}
        {pending.length > 0 && (
          <span className="ms-auto rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
            {pending.length} {ar ? "معلّق" : "pending"}
          </span>
        )}
      </h3>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">{ar ? "جاري التحميل..." : "Loading..."}</p>
      ) : pending.length === 0 ? (
        <p className="text-xs text-muted-foreground">{ar ? "لا توجد طلبات جديدة" : "No new requests"}</p>
      ) : (
        <div className="space-y-2">
          {pending.map((r: any) => (
            <div key={r.id} className="rounded-lg border border-border p-3">
              <p className="text-xs font-semibold text-foreground">
                {r.requester_name || r.contact_email || (ar ? "زائر" : "Visitor")}
              </p>
              <p className="text-[11px] text-muted-foreground">{ar ? r.meetup?.title_ar : r.meetup?.title_en}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {ar ? "التاريخ المفضل" : "Preferred"}: {r.preferred_date || (ar ? "مرن" : "Flexible")}
                {r.contact_phone ? ` · ${r.contact_phone}` : ""}
              </p>
              {r.message && <p className="mt-1 text-[11px] text-muted-foreground">{r.message}</p>}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setStatus(r.id, "accepted")}
                  disabled={savingId === r.id}
                  className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground disabled:opacity-60"
                >
                  <Check className="h-3 w-3" /> {ar ? "قبول" : "Accept"}
                </button>
                <button
                  onClick={() => setStatus(r.id, "declined")}
                  disabled={savingId === r.id}
                  className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-[10px] font-semibold text-foreground disabled:opacity-60"
                >
                  <X className="h-3 w-3" /> {ar ? "رفض" : "Decline"}
                </button>
                <MessageUserButton userId={r.requester_id} />

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionRequestsList;
