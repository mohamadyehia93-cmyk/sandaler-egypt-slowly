import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, X } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type ReservationRow = {
  id: string;
  item_type: string;
  item_id: string;
  guests: number | null;
  start_date: string | null;
  status: string;
  note: string | null;
  created_at: string;
};

export const reservationStatusLabel = (status: string, ar: boolean) => {
  switch (status) {
    case "pending": return ar ? "بانتظار تأكيد المضيف" : "Awaiting confirmation";
    case "confirmed": return ar ? "مؤكد" : "Confirmed";
    case "declined": return ar ? "مرفوض" : "Declined";
    case "cancelled": return ar ? "ملغي" : "Cancelled";
    default: return status;
  }
};

export const reservationStatusClasses = (status: string) => {
  if (status === "confirmed") return "bg-success/10 text-success";
  if (status === "pending") return "bg-warning/10 text-warning";
  if (status === "declined") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
};

export const itemTypeLabel = (itemType: string, ar: boolean) => {
  switch (itemType) {
    case "trip": return ar ? "رحلة" : "Trip";
    case "accommodation": return ar ? "إقامة" : "Stay";
    case "transport": return ar ? "مواصلات" : "Transport";
    case "product": return ar ? "منتج" : "Product";
    default: return itemType;
  }
};

const ReservationRequestsList = () => {
  const { lang } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ar = lang === "ar";
  const locale = ar ? "ar-EG" : "en-US";
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["my-reservation-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservation_requests")
        .select("id, item_type, item_id, guests, start_date, status, note, created_at")
        .eq("requester_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ReservationRow[];
    },
  });

  const cancel = async (id: string) => {
    setSavingId(id);
    const { error } = await supabase.from("reservation_requests").update({ status: "cancelled" }).eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error(ar ? "تعذر إلغاء الطلب" : "Could not cancel the request");
      return;
    }
    toast.success(ar ? "تم إلغاء الطلب" : "Request cancelled");
    queryClient.invalidateQueries({ queryKey: ["my-reservation-requests", user?.id] });
  };

  if (!user || (!isLoading && requests.length === 0)) return null;

  return (
    <div className="bg-card rounded-xl shadow-card p-4">
      <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
        <CalendarClock className="w-4 h-4 text-primary" />
        {ar ? "طلبات الحجز" : "Reservation requests"}
      </h3>
      <p className="text-[10px] text-muted-foreground mb-3">
        {ar
          ? "رحلات وإقامات ومواصلات ومنتجات — لم يتم دفع أي مبلغ."
          : "Trips, stays, transport and products — no payment has been taken."}
      </p>

      {isLoading ? (
        <p className="text-xs text-muted-foreground py-3">{ar ? "جاري التحميل..." : "Loading..."}</p>
      ) : (
        requests.map((r) => (
          <div key={r.id} className="py-2.5 border-b border-border last:border-0">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{itemTypeLabel(r.item_type, ar)}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                  {r.start_date ? ` · ${r.start_date}` : ""}
                  {r.guests ? ` · ${r.guests}` : ""}
                </p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${reservationStatusClasses(r.status)}`}>
                {reservationStatusLabel(r.status, ar)}
              </span>
            </div>
            {r.note && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{r.note}</p>}
            {r.status === "pending" && (
              <button
                disabled={savingId === r.id}
                onClick={() => cancel(r.id)}
                className="mt-2 text-[11px] font-semibold py-1.5 px-3 rounded-lg bg-destructive/10 text-destructive inline-flex items-center gap-1 disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" /> {ar ? "إلغاء الطلب" : "Cancel request"}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ReservationRequestsList;
