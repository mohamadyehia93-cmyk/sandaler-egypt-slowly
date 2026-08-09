import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

export const requestStatusLabel = (status: string, ar: boolean) => {
  switch (status) {
    case "pending": return ar ? "قيد المراجعة" : "Pending";
    case "accepted": return ar ? "مقبول" : "Accepted";
    case "declined": return ar ? "مرفوض" : "Declined";
    case "cancelled": return ar ? "ملغي" : "Cancelled";
    default: return status;
  }
};

export const requestStatusClasses = (status: string) => {
  if (status === "accepted") return "bg-success/10 text-success";
  if (status === "pending") return "bg-warning/10 text-warning";
  if (status === "declined") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
};

const MySessionRequests = () => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["my-session-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_requests")
        .select("id, status, preferred_date, message, created_at, meetup:meetups(id, title_en, title_ar, image)")
        .eq("requester_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const cancel = async (id: string) => {
    setSavingId(id);
    const { error } = await supabase.from("session_requests").update({ status: "cancelled" }).eq("id", id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success(ar ? "تم إلغاء الطلب" : "Request cancelled");
    queryClient.invalidateQueries({ queryKey: ["my-session-requests"] });
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-background px-4 py-3">
        <button onClick={() => navigate(-1)} className="rounded-full p-1.5 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{ar ? "طلبات الجلسات" : "My Session Requests"}</h1>
      </header>

      <div className="space-y-3 px-4 py-4">
        {!user ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{ar ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
        ) : isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{ar ? "جاري التحميل..." : "Loading..."}</p>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarClock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{ar ? "لا توجد طلبات بعد" : "No requests yet"}</p>
            <button onClick={() => navigate("/sessions")} className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              {ar ? "استعرض الجلسات" : "Browse sessions"}
            </button>
          </div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-3 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <h2 className="line-clamp-2 text-sm font-semibold text-foreground">
                  {ar ? r.meetup?.title_ar : r.meetup?.title_en}
                </h2>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${requestStatusClasses(r.status)}`}>
                  {requestStatusLabel(r.status, ar)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {ar ? "التاريخ المفضل" : "Preferred"}: {r.preferred_date || (ar ? "مرن" : "Flexible")}
              </p>
              {r.message && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.message}</p>}
              {r.status === "pending" && (
                <button
                  onClick={() => cancel(r.id)}
                  disabled={savingId === r.id}
                  className="mt-3 w-full rounded-xl border border-border py-2 text-xs font-semibold text-foreground disabled:opacity-60"
                >
                  {ar ? "إلغاء الطلب" : "Cancel request"}
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

export default MySessionRequests;
