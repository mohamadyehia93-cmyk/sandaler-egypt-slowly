import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProviderId } from "@/lib/providerRecord";
import { useDashboardIdentity } from "@/hooks/useDashboardIdentity";
import { ArrowLeft, Bell, Plus, AlertTriangle, ChevronRight } from "lucide-react";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";
import EditProfileHeaderButton from "@/components/dashboard/EditProfileHeaderButton";
import DailyStatusCard from "@/components/DailyStatusCard";
import SellerOrdersList from "@/components/SellerOrdersList";
import OwnerReservationRequests from "@/components/OwnerReservationRequests";

const LOW_STOCK_THRESHOLD = 3;

const ProductSellerDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const identity = useDashboardIdentity();

  const { data: products = [] } = useQuery({
    queryKey: ["ps-products", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // products.seller_id holds providers.id; legacy rows may hold the auth user id
      const providerId = await fetchMyProviderId(user!.id);
      const owners = [user!.id, ...(providerId ? [providerId] : [])];
      const { data, error } = await supabase
        .from("products")
        .select("id, name_en, name_ar, status, stock")
        .in("seller_id", owners);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["ps-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const providerId = await fetchMyProviderId(user!.id);
      const owners = [user!.id, ...(providerId ? [providerId] : [])];
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total_egp, created_at")
        .in("seller_id", owners);
      if (error) throw error;
      return data ?? [];
    },
  });

  const published = products.filter((p) => p.status === "published").length;
  const lowStock = products.filter((p) => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const ordersThisWeek = orders.filter((o) => new Date(o.created_at).getTime() >= weekAgo).length;
  const revenue = orders
    .filter((o) => o.status === "confirmed" || o.status === "fulfilled")
    .reduce((sum, o) => sum + Number(o.total_egp || 0), 0);

  const overview = [
    { value: String(published), label: lang === "ar" ? "منتجات منشورة" : "Published Products", path: "/dashboard/product-seller/my-products" },
    { value: String(ordersThisWeek), label: lang === "ar" ? "طلبات هذا الأسبوع" : "Orders This Week", path: "/dashboard/product-seller" },
    { value: revenue.toLocaleString(), label: lang === "ar" ? "إيرادات مؤكدة" : "Confirmed Revenue", suffix: lang === "ar" ? "ج.م" : "EGP", path: "/dashboard/product-seller" },
    { value: String(lowStock.length), label: lang === "ar" ? "مخزون منخفض" : "Low Stock", path: "/dashboard/product-seller/my-products" },
  ];

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "🏠", active: true, path: "/dashboard/product-seller" },
    { label: lang === "ar" ? "منتجاتي" : "My Products", icon: "🛍️", active: false, path: "/dashboard/product-seller/my-products" },
    { label: lang === "ar" ? "الطلبات" : "Orders", icon: "📦", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-product-seller text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/profile")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <EditProfileHeaderButton />
            <VisitorModeHeaderToggle />
            <button onClick={() => navigate("/inbox")} className="p-1" aria-label={lang === "ar" ? "الرسائل" : "Inbox"}><Bell className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 overflow-hidden flex items-center justify-center text-sm font-bold">
            {identity.avatar ? <img src={identity.avatar} alt="" className="w-full h-full object-cover" /> : identity.initials || "🛍️"}
          </div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "بائع منتجات" : "Product Seller"}</p>
            <h1 className="text-lg font-bold">{identity.name || (lang === "ar" ? "لوحة التحكم" : "Dashboard")}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <DailyStatusCard accentBg="bg-role-product-seller" accentText="text-role-product-seller" />

        <div className="grid grid-cols-2 gap-3">
          {overview.map((o, i) => (
            <div key={i} onClick={() => navigate(o.path)} className="bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <span className="text-xl font-bold text-foreground block">{o.value}{o.suffix && <span className="text-xs ml-1">{o.suffix}</span>}</span>
              <span className="text-[10px] text-muted-foreground">{o.label}</span>
            </div>
          ))}
        </div>

        {/* Low Stock Alerts — real product rows only */}
        {lowStock.length > 0 && (
          <div onClick={() => navigate("/dashboard/product-seller/my-products")} className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              {lang === "ar" ? "تنبيه مخزون منخفض" : "Low Stock Alerts"}
              <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
            </h3>
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-destructive/10 last:border-0">
                <span className="text-xs text-foreground">{lang === "ar" ? p.name_ar : p.name_en}</span>
                <span className="text-[10px] font-bold text-destructive">{p.stock ?? 0} {lang === "ar" ? "متبقي" : "left"}</span>
              </div>
            ))}
          </div>
        )}

        <SellerOrdersList />

        <OwnerReservationRequests itemTypes={["product"]} accentBg="bg-role-product-seller" />

        <button onClick={() => navigate("/dashboard/product-seller/new-product")} className="w-full bg-role-product-seller text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> {lang === "ar" ? "إضافة منتج" : "Add Product"}
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-role-product-seller flex justify-around py-2 z-50">
        {bottomNav.map((item, i) => (
          <button key={i} onClick={() => navigate(item.path)} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${item.active ? "opacity-100" : "opacity-60"}`}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] text-white font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProductSellerDashboard;
