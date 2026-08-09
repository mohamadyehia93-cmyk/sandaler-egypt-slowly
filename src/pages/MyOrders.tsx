import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Package } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

type OrderRow = {
  id: string;
  quantity: number;
  unit_price_egp: number | null;
  total_egp: number | null;
  status: string;
  buyer_note: string | null;
  created_at: string;
  product: { id: string; slug: string | null; name_en: string; name_ar: string; image: string | null } | null;
};

export const orderStatusLabel = (status: string, ar: boolean) => {
  switch (status) {
    case "pending": return ar ? "بانتظار التأكيد" : "Pending";
    case "confirmed": return ar ? "مؤكد" : "Confirmed";
    case "shipped": return ar ? "تم الشحن" : "Shipped";
    case "completed": return ar ? "مكتمل" : "Completed";
    case "cancelled": return ar ? "ملغي" : "Cancelled";
    default: return status;
  }
};

export const orderStatusClasses = (status: string) => {
  if (status === "confirmed" || status === "completed") return "bg-success/10 text-success";
  if (status === "shipped") return "bg-primary/10 text-primary";
  if (status === "pending") return "bg-warning/10 text-warning";
  return "bg-muted text-muted-foreground";
};

const MyOrders = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { user } = useAuth();
  const ar = lang === "ar";
  const locale = ar ? "ar-EG" : "en-US";

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, quantity, unit_price_egp, total_egp, status, buyer_note, created_at, product:products(id, slug, name_en, name_ar, image)")
        .eq("buyer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as OrderRow[];
    },
  });

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">{ar ? "طلباتي" : "My Orders"}</h1>
      </header>

      <div className="px-4 py-5 space-y-3">
        {!user ? (
          <p className="text-center text-sm text-muted-foreground py-12">{ar ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
        ) : isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-12">{ar ? "جاري التحميل..." : "Loading..."}</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{ar ? "لا توجد طلبات بعد" : "No orders yet"}</p>
            <button onClick={() => navigate("/market")} className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold">
              {ar ? "تسوّق المنتجات" : "Browse products"}
            </button>
          </div>
        ) : (
          orders.map((o) => {
            const name = o.product ? (ar ? o.product.name_ar : o.product.name_en) : "—";
            return (
              <div key={o.id} className="bg-card rounded-xl shadow-card p-3 flex gap-3 items-start">
                <button
                  onClick={() => o.product && navigate(`/product/${o.product.slug || o.product.id}`)}
                  className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center"
                >
                  {o.product?.image ? (
                    <img src={o.product.image} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-semibold text-foreground line-clamp-1 flex-1">{name}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${orderStatusClasses(o.status)}`}>
                      {orderStatusLabel(o.status, ar)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {o.quantity} × {(o.unit_price_egp ?? 0).toLocaleString(locale)} {ar ? "ج.م" : "EGP"}
                  </p>
                  <p className="text-xs font-bold text-primary-dark mt-0.5">
                    {(o.total_egp ?? 0).toLocaleString(locale)} {ar ? "ج.م" : "EGP"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(o.created_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}
                    {ar ? "غير مدفوع" : "Unpaid"}
                  </p>
                  {o.buyer_note && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{o.buyer_note}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyOrders;
