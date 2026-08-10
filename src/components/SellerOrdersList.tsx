import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProviderId } from "@/lib/providerRecord";
import { ShoppingCart, Check, X } from "lucide-react";
import { toast } from "sonner";
import { orderStatusLabel, orderStatusClasses } from "@/pages/MyOrders";
import MessageUserButton from "@/components/MessageUserButton";

type SellerOrder = {
  id: string;
  quantity: number;
  unit_price_egp: number | null;
  total_egp: number | null;
  status: string;
  buyer_note: string | null;
  buyer_id: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  created_at: string;
  product: { name_en: string; name_ar: string } | null;
};


const TERMINAL = ["declined", "fulfilled", "cancelled", "completed"];

const SellerOrdersList = () => {
  const { lang } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ar = lang === "ar";
  const locale = ar ? "ar-EG" : "en-US";
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["seller-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // orders.seller_id mirrors products.seller_id (providers.id); legacy rows hold the auth user id
      const providerId = await fetchMyProviderId(user!.id);
      const owners = [user!.id, ...(providerId ? [providerId] : [])];
      const { data, error } = await supabase
        .from("orders")
        .select("id, quantity, unit_price_egp, total_egp, status, buyer_note, buyer_id, contact_name, contact_phone, created_at, product:products(name_en, name_ar)")
        .in("seller_id", owners)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as unknown as SellerOrder[];
    },
  });

  const updateStatus = async (id: string, status: "confirmed" | "declined" | "fulfilled") => {
    setSavingId(id);
    const { error } = await supabase.from("orders").update({ status } as never).eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error(ar ? "تعذر تحديث الطلب" : "Could not update order");
      return;
    }
    toast.success(
      status === "confirmed"
        ? (ar ? "تم تأكيد الطلب" : "Order confirmed")
        : status === "fulfilled"
          ? (ar ? "تم تسليم الطلب" : "Order marked fulfilled")
          : (ar ? "تم رفض الطلب" : "Order declined")
    );
    queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
  };


  return (
    <div className="bg-card rounded-xl shadow-card p-4">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <ShoppingCart className="w-4 h-4 text-role-product-seller" />
        {ar ? "الطلبات الواردة" : "Incoming Orders"}
      </h3>

      {!user ? (
        <p className="text-xs text-muted-foreground py-3">{ar ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
      ) : isLoading ? (
        <p className="text-xs text-muted-foreground py-3">{ar ? "جاري التحميل..." : "Loading..."}</p>
      ) : orders.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3">{ar ? "لا توجد طلبات بعد" : "No orders yet"}</p>
      ) : (
        orders.map((o) => {
          const terminal = TERMINAL.includes(o.status);
          const name = o.product ? (ar ? o.product.name_ar : o.product.name_en) : "—";
          return (
            <div key={o.id} className="py-2.5 border-b border-border last:border-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">{name} × {o.quantity}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {(o.total_egp ?? 0).toLocaleString(locale)} {ar ? "ج.م" : "EGP"} ·{" "}
                    {new Date(o.created_at).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                  </p>
                  {(o.contact_name || o.contact_phone) && (
                    <p className="text-[10px] text-muted-foreground" dir={o.contact_phone ? "auto" : undefined}>
                      {o.contact_name}
                      {o.contact_name && o.contact_phone ? " · " : ""}
                      {o.contact_phone}
                    </p>
                  )}
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${orderStatusClasses(o.status)}`}>
                  {orderStatusLabel(o.status, ar)}
                </span>
              </div>

              {o.buyer_note && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{o.buyer_note}</p>}

              <div className="flex items-center gap-2 mt-2">
                {!terminal && (
                  o.status === "pending" ? (
                    <>
                      <button
                        disabled={savingId === o.id}
                        onClick={() => updateStatus(o.id, "confirmed")}
                        className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> {ar ? "تأكيد" : "Confirm"}
                      </button>
                      <button
                        disabled={savingId === o.id}
                        onClick={() => updateStatus(o.id, "declined")}
                        className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" /> {ar ? "رفض" : "Decline"}
                      </button>
                    </>
                  ) : (
                    <button
                      disabled={savingId === o.id}
                      onClick={() => updateStatus(o.id, "fulfilled")}
                      className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" /> {ar ? "تم التسليم" : "Mark fulfilled"}
                    </button>
                  )
                )}
                <MessageUserButton userId={o.buyer_id} />
              </div>

            </div>
          );
        })

      )}
    </div>
  );
};

export default SellerOrdersList;
