import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Bell, Plus, Package, AlertTriangle, TrendingUp, ShoppingCart, ChevronRight } from "lucide-react";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";

const ProductSellerDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const overview = [
    { value: "8", label: lang === "ar" ? "منتجات نشطة" : "Active Products", path: "/dashboard/product-seller/my-products" },
    { value: "5", label: lang === "ar" ? "طلبات هذا الأسبوع" : "Orders This Week", path: "/inbox" },
    { value: "3,100", label: lang === "ar" ? "إيرادات الشهر" : "Revenue This Month", suffix: lang === "ar" ? "ج.م" : "EGP", path: "/profile/impact" },
    { value: "2", label: lang === "ar" ? "مخزون منخفض" : "Low Stock", path: "/dashboard/product-seller/my-products" },
  ];

  const lowStock = [
    { name: lang === "ar" ? "مجوهرات بحرية يدوية" : "Sea-Inspired Handmade Jewelry", stock: 2 },
    { name: lang === "ar" ? "كرسي نخيل تراثي" : "Palm Tree Heritage Chair", stock: 1 },
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
          <button onClick={() => navigate("/inbox")} className="relative p-1"><Bell className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">🛍️</div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "بائع منتجات" : "Product Seller"}</p>
            <h1 className="text-lg font-bold">{lang === "ar" ? "فاطمة عبدالله" : "Fatma Abdullah"}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {overview.map((o, i) => (
            <div key={i} onClick={() => navigate(o.path)} className="bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <span className="text-xl font-bold text-foreground block">{o.value}{o.suffix && <span className="text-xs ml-1">{o.suffix}</span>}</span>
              <span className="text-[10px] text-muted-foreground">{o.label}</span>
            </div>
          ))}
        </div>

        {/* Low Stock Alerts */}
        <div onClick={() => navigate("/dashboard/product-seller/my-products")} className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            {lang === "ar" ? "تنبيه مخزون منخفض" : "Low Stock Alerts"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          {lowStock.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-destructive/10 last:border-0">
              <span className="text-xs text-foreground">{p.name}</span>
              <span className="text-[10px] font-bold text-destructive">{p.stock} {lang === "ar" ? "متبقي" : "left"}</span>
            </div>
          ))}
        </div>

        {/* New Orders */}
        <div onClick={() => navigate("/inbox")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-role-product-seller" />
            {lang === "ar" ? "طلبات جديدة" : "New Orders"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          <div className="border border-border rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground">{lang === "ar" ? "مجوهرات بحرية × ٢" : "Sea Jewelry × 2"}</p>
            <p className="text-[10px] text-muted-foreground">Mohamed Yehia · {lang === "ar" ? "استلام: ٣٠ ديسمبر" : "Pickup: Dec 30"}</p>
          </div>
        </div>

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