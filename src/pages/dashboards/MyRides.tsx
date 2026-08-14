import PreviewButton from "@/components/dashboard/PreviewButton";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProviderId } from "@/lib/providerRecord";
import { TRANSPORT_EMOJI, transportTypeLabel } from "@/lib/listingTaxonomy";
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, Pencil, Route } from "lucide-react";
import { toast } from "sonner";

/** transport.provider_id holds providers.id (see src/lib/providerRecord.ts). */
const MyRides = () => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["my-rides", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const providerId = await fetchMyProviderId(user!.id);
      if (!providerId) return [];
      const { data, error } = await supabase
        .from("transport")
        .select("id, slug, name_en, name_ar, image, price, currency, transport_type, status, created_at")
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["my-rides"] });
    queryClient.invalidateQueries({ queryKey: ["transport"] });
  };

  const toggleStatus = async (id: string, status: string | null) => {
    const next = status === "published" ? "draft" : "published";
    const { error } = await supabase.from("transport").update({ status: next }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(next === "published" ? (ar ? "تم النشر" : "Published") : (ar ? "تم التحويل لمسودة" : "Moved to draft"));
    invalidate();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(ar ? "حذف خدمة النقل؟" : "Delete this ride?")) return;
    const { error } = await supabase.from("transport").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(ar ? "تم الحذف" : "Deleted");
    invalidate();
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-service-provider text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{ar ? "خدمات النقل" : "My Transport"}</h1>
      </header>

      <div className="px-4 py-5 space-y-3">
        {!user ? (
          <p className="text-center text-sm text-muted-foreground py-12">{ar ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
        ) : isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-12">{ar ? "جاري التحميل..." : "Loading..."}</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Route className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{ar ? "لا توجد خدمات نقل بعد" : "No transport yet"}</p>
          </div>
        ) : (
          items.map((e: Record<string, unknown> & { id: string }) => (
            <div key={e.id} className="bg-card rounded-xl shadow-card p-3 space-y-3">
              <div className="flex gap-3 items-center">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                  {e.image ? <img src={e.image} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">{TRANSPORT_EMOJI[e.transport_type] || "🚐"}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{ar ? (e.name_ar || e.name_en) : e.name_en}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {e.price ? `${e.price} ${(e.currency || "EGP") === "EGP" && ar ? "ج.م" : e.currency || "EGP"}` : "—"}
                    {e.transport_type ? ` · ${transportTypeLabel(e.transport_type, lang)}` : ""}
                  </p>
                  <span className={`text-[10px] font-medium ${e.status === "published" ? "text-success" : "text-muted-foreground"}`}>
                    {e.status === "published" ? (ar ? "منشور" : "published") : (ar ? "مسودة" : "draft")}
                  </span>
                </div>
                <PreviewButton path={`/transport/${e.slug || e.id}`} className="bg-role-service-provider/10 text-role-service-provider" />
                <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive" aria-label={ar ? "حذف" : "Delete"}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/dashboard/service-provider/edit-transport/${e.id}`)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-border text-[11px] font-semibold text-foreground">
                  <Pencil className="w-3.5 h-3.5" /> {ar ? "تعديل" : "Edit"}
                </button>
                <button onClick={() => toggleStatus(e.id, e.status)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-border text-[11px] font-semibold text-foreground">
                  {e.status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {e.status === "published" ? (ar ? "إخفاء" : "Unpublish") : (ar ? "نشر" : "Publish")}
                </button>
              </div>
            </div>
          ))
        )}

        <button onClick={() => navigate("/dashboard/service-provider/new-transport")} className="w-full bg-role-service-provider text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 mt-2">
          <Plus className="w-4 h-4" /> {ar ? "خدمة نقل جديدة" : "New Transport"}
        </button>
      </div>
    </div>
  );
};

export default MyRides;
