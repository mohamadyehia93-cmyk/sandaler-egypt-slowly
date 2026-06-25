import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2, Eye, ShoppingBag, Pencil } from "lucide-react";
import { toast } from "sonner";

const MyProducts = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["my-products", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name_en, name_ar, image, price, stock, status, created_at")
        .eq("seller_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === "ar" ? "حذف هذا المنتج؟" : "Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(lang === "ar" ? "تم الحذف" : "Deleted");
    queryClient.invalidateQueries({ queryKey: ["my-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-product-seller text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "منتجاتي" : "My Products"}</h1>
      </header>

      <div className="px-4 py-5 space-y-3">
        {!user ? (
          <p className="text-center text-sm text-muted-foreground py-12">{lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
        ) : isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-12">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا توجد منتجات بعد" : "No products yet"}</p>
          </div>
        ) : (
          items.map((e) => (
            <div key={e.id} className="bg-card rounded-xl shadow-card p-3 flex gap-3 items-center">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                {e.image ? <img src={e.image} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-6 h-6 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground line-clamp-1">{lang === "ar" ? e.name_ar : e.name_en}</p>
                <p className="text-[11px] text-muted-foreground">{e.price ? `${e.price} ${lang === "ar" ? "ج.م" : "EGP"}` : "—"} · {lang === "ar" ? "المخزون" : "Stock"}: {e.stock ?? 0}</p>
                <span className="text-[10px] font-medium text-success">{e.status}</span>
              </div>
              <button onClick={() => navigate(`/product/${e.id}`)} className="p-2 rounded-lg bg-role-product-seller/10 text-role-product-seller">
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={() => navigate(`/dashboard/product-seller/edit-product/${e.id}`)} className="p-2 rounded-lg bg-role-product-seller/10 text-role-product-seller">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}

        <button onClick={() => navigate("/dashboard/product-seller/new-product")} className="w-full bg-role-product-seller text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 mt-2">
          <Plus className="w-4 h-4" /> {lang === "ar" ? "إضافة منتج" : "Add Product"}
        </button>
      </div>
    </div>
  );
};

export default MyProducts;
