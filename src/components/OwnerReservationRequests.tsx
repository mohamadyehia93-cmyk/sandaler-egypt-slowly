import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { itemTypeLabel, reservationStatusClasses, reservationStatusLabel } from "@/components/ReservationRequestsList";
import MessageUserButton from "@/components/MessageUserButton";

type OwnerRequest = {
  id: string;
  item_type: string;
  item_id: string;
  guests: number | null;
  start_date: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  note: string | null;
  status: string;
  requester_id: string | null;
  created_at: string;
};


const TERMINAL = ["confirmed", "declined", "cancelled"];

type Props = {
  /** Restrict the list to the item types this dashboard is responsible for. */
  itemTypes?: string[];
  accentBg?: string;
};

const OwnerReservationRequests = ({ itemTypes, accentBg = "bg-primary" }: Props) => {
  const { lang } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ar = lang === "ar";
  const locale = ar ? "ar-EG" : "en-US";
  const [savingId, setSavingId] = useState<string | null>(null);
  const queryKey = ["owner-reservation-requests", user?.id, (itemTypes || []).join(",")];

  const { data: requests = [], isLoading } = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("reservation_requests")
        .select("id, item_type, item_id, guests, start_date, contact_name, contact_phone, note, status, requester_id, created_at")
        .eq("owner_id", user!.id);
      if (itemTypes && itemTypes.length > 0) query = query.in("item_type", itemTypes);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as OwnerRequest[];
    },
  });

  const updateStatus = async (id: string, status: "confirmed" | "declined") => {
    setSavingId(id);
    const { error } = await supabase.from("reservation_requests").update({ status }).eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error(ar ? "تعذر تحديث الطلب" : "Could not update the request");
      return;
    }
    toast.success(
      status === "confirmed"
        ? (ar ? "تم تأكيد الطلب" : "Request confirmed")
        : (ar ? "تم رفض الطلب" : "Request declined")
    );
    queryClient.invalidateQueries({ queryKey });
  };

  return (
    <div className="bg-card rounded-xl shadow-card p-4">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <CalendarClock className="w-4 h-4 text-primary" />
        {ar ? "طلبات الحجز" : "Reservation requests"}
      </h3>

      {isLoading ? (
        <p className="text-xs text-muted-foreground py-3">{ar ? "جاري التحميل..." : "Loading..."}</p>
      ) : requests.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3">{ar ? "لا توجد طلبات بعد" : "No requests yet"}</p>
      ) : (
        requests.map((r) => {
          const terminal = TERMINAL.includes(r.status);
          return (
            <div key={r.id} className="py-2.5 border-b border-border last:border-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">
                    {r.contact_name || (ar ? "زائر" : "Visitor")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {itemTypeLabel(r.item_type, ar)}
                    {" · "}
                    {new Date(r.created_at).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                    {r.start_date ? ` · ${r.start_date}` : ""}
                    {r.guests ? ` · ${r.guests}` : ""}
                  </p>
                  {r.contact_phone && (
                    <p className="text-[10px] text-muted-foreground" dir="ltr">{r.contact_phone}</p>
                  )}
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${reservationStatusClasses(r.status)}`}>
                  {reservationStatusLabel(r.status, ar)}
                </span>
              </div>

              {r.note && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-3">{r.note}</p>}

              <div className="flex items-center gap-2 mt-2">
                {!terminal && (
                  <>
                    <button
                      disabled={savingId === r.id}
                      onClick={() => updateStatus(r.id, "confirmed")}
                      className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg ${accentBg} text-white flex items-center justify-center gap-1 disabled:opacity-50`}
                    >
                      <Check className="w-3.5 h-3.5" /> {ar ? "تأكيد" : "Confirm"}
                    </button>
                    <button
                      disabled={savingId === r.id}
                      onClick={() => updateStatus(r.id, "declined")}
                      className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" /> {ar ? "رفض" : "Decline"}
                    </button>
                  </>
                )}
                <MessageUserButton userId={r.requester_id} />
              </div>

            </div>
          );
        })
      )}
    </div>
  );
};

export default OwnerReservationRequests;
