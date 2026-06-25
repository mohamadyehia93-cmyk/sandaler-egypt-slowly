import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2, Eye, FileText, Pencil } from "lucide-react";
import { toast } from "sonner";

const MyContent = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["my-posts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title_en, title_ar, image, category, status, created_at")
        .eq("author_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === "ar" ? "حذف هذا المقال؟" : "Delete this article?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(lang === "ar" ? "تم الحذف" : "Deleted");
    queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-culture-actor text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "محتواي" : "My Content"}</h1>
      </header>

      <div className="px-4 py-5 space-y-3">
        {!user ? (
          <p className="text-center text-sm text-muted-foreground py-12">{lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
        ) : isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-12">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{lang === "ar" ? "لا يوجد محتوى بعد" : "No content yet"}</p>
          </div>
        ) : (
          items.map((e) => (
            <div key={e.id} className="bg-card rounded-xl shadow-card p-3 flex gap-3 items-center">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                {e.image ? <img src={e.image} alt="" className="w-full h-full object-cover" /> : <FileText className="w-6 h-6 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground line-clamp-1">{lang === "ar" ? e.title_ar : e.title_en}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{e.category}</p>
                <span className="text-[10px] font-medium text-success">{e.status}</span>
              </div>
              <button onClick={() => navigate(`/post/${e.id}`)} className="p-2 rounded-lg bg-role-culture-actor/10 text-role-culture-actor">
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={() => navigate(`/dashboard/culture-actor/edit-article/${e.id}`)} className="p-2 rounded-lg bg-role-culture-actor/10 text-role-culture-actor">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}

        <button onClick={() => navigate("/dashboard/culture-actor/new-article")} className="w-full bg-role-culture-actor text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 mt-2">
          <Plus className="w-4 h-4" /> {lang === "ar" ? "مقال جديد" : "New Article"}
        </button>
      </div>
    </div>
  );
};

export default MyContent;
