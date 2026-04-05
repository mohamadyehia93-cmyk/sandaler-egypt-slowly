import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Plus, Eye, Package, MoreVertical, Search, Filter, MapPin } from "lucide-react";
import { useState } from "react";

const MyProducts = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"active" | "out" | "drafts">("active");

  const tabs = [
    { key: "active" as const, label: lang === "ar" ? "متاح" : "In Stock", count: 15 },
    { key: "out" as const, label: lang === "ar" ? "نفذ" : "Sold Out", count: 3 },
    { key: "drafts" as const, label: lang === "ar" ? "مسودات" : "Drafts", count: 2 },
  ];

  const products = {
    active: [
      { id: "p1", title: lang === "ar" ? "مجوهرات يدوية مستوحاة من البحر" : "Sea-Inspired Handmade Jewelry", stock: 24, sold: 48, price: "600 EGP", image: "https://images.unsplash.com/photo-1515562141589-67f0d569b6c4?w=100&q=80" },
      { id: "p4", title: lang === "ar" ? "نسيج نوبي يدوي" : "Nubian Hand-woven Textile", stock: 8, sold: 32, price: "450 EGP", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=100&q=80" },
      { id: "p5", title: lang === "ar" ? "زيت زيتون سيوة" : "Siwa Olive Oil", stock: 50, sold: 120, price: "180 EGP", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&q=80" },
    ],
    out: [
      { id: "p2", title: lang === "ar" ? "كرسي تراثي من النخيل" : "Palm Tree Heritage Chair", stock: 0, sold: 15, price: "1000 EGP", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80" },
    ],
    drafts: [
      { id: "d1", title: lang === "ar" ? "سلال الواحة" : "Oasis Baskets", stock: 0, sold: 0, price: "250 EGP", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=80" },
    ],
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-product-seller text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/dashboard/product-seller")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => navigate("/dashboard/product-seller/new-product")} className="flex items-center gap-1 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "جديد" : "New"}
          </button>
        </div>
        <h1 className="text-lg font-bold">{lang === "ar" ? "منتجاتي" : "My Products"}</h1>
      </header>

      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder={lang === "ar" ? "ابحث..." : "Search..."} className="bg-transparent text-sm flex-1 outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <button className="p-2 bg-card rounded-lg border border-border"><Filter className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      </div>

      <div className="flex gap-1 px-4 pb-3">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab.key ? "bg-role-product-seller text-white" : "bg-card text-muted-foreground border border-border"}`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {products[activeTab].map((product) => (
          <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="bg-card rounded-xl shadow-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex gap-3 p-3">
              <img src={product.image} alt={product.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1">{product.title}</h3>
                  <button onClick={(e) => e.stopPropagation()} className="p-0.5 text-muted-foreground"><MoreVertical className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Package className="w-3 h-3" /> {product.stock} {lang === "ar" ? "في المخزون" : "in stock"}</span>
                  <span>{product.sold} {lang === "ar" ? "مباع" : "sold"}</span>
                  <span className="font-semibold text-foreground">{product.price}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyProducts;