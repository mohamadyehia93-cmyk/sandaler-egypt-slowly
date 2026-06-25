import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2, Flag, CheckCircle2, Circle, ClipboardList, Pencil } from "lucide-react";
import { toast } from "sonner";

const MyTasks = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["my-tasks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ambassador_tasks")
        .select("id, title_en, title_ar, status, due_date")
        .eq("ambassador_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["my-reports", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flag_reports")
        .select("id, issue_type, priority, provider_name, status, created_at")
        .eq("reporter_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleTask = async (id: string, status: string) => {
    const next = status === "done" ? "pending" : "done";
    const { error } = await supabase.from("ambassador_tasks").update({ status: next }).eq("id", id);
    if (error) return toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
  };

  const deleteReport = async (id: string) => {
    if (!window.confirm(lang === "ar" ? "حذف هذا البلاغ؟" : "Delete this report?")) return;
    const { error } = await supabase.from("flag_reports").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(lang === "ar" ? "تم الحذف" : "Deleted");
    queryClient.invalidateQueries({ queryKey: ["my-reports"] });
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-ambassador text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "مهامي وبلاغاتي" : "My Tasks & Reports"}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        {!user ? (
          <p className="text-center text-sm text-muted-foreground py-12">{lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
        ) : (
          <>
            {/* Assigned tasks */}
            <div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" /> {lang === "ar" ? "المهام الموكلة" : "Assigned Tasks"}
              </h2>
              {tasks.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3">{lang === "ar" ? "لا توجد مهام موكلة بعد" : "No assigned tasks yet"}</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <div key={t.id} className="bg-card rounded-xl shadow-card p-3 flex gap-3 items-center">
                      <button onClick={() => toggleTask(t.id, t.status)} className="shrink-0">
                        {t.status === "done" ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold line-clamp-1 ${t.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>{lang === "ar" ? (t.title_ar || t.title_en) : t.title_en}</p>
                        {t.due_date && <p className="text-[11px] text-muted-foreground">{t.due_date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submitted reports */}
            <div>
              <h2 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5" /> {lang === "ar" ? "بلاغاتي" : "My Reports"}
              </h2>
              {isLoading ? (
                <p className="text-xs text-muted-foreground py-3">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
              ) : reports.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3">{lang === "ar" ? "لا توجد بلاغات بعد" : "No reports yet"}</p>
              ) : (
                <div className="space-y-2">
                  {reports.map((r) => (
                    <div key={r.id} className="bg-card rounded-xl shadow-card p-3 flex gap-3 items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">{r.issue_type}{r.provider_name ? ` · ${r.provider_name}` : ""}</p>
                        <p className="text-[11px] text-muted-foreground">{lang === "ar" ? "الأولوية" : "Priority"}: {r.priority}</p>
                        <span className="text-[10px] font-medium text-warning">{r.status}</span>
                      </div>
                      <button onClick={() => navigate(`/dashboard/ambassador/edit-report/${r.id}`)} className="p-2 rounded-lg bg-role-ambassador/10 text-role-ambassador">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteReport(r.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <button onClick={() => navigate("/dashboard/ambassador/flag-issue")} className="w-full bg-role-ambassador text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 mt-2">
          <Plus className="w-4 h-4" /> {lang === "ar" ? "إبلاغ عن مشكلة" : "Flag an Issue"}
        </button>
      </div>
    </div>
  );
};

export default MyTasks;
