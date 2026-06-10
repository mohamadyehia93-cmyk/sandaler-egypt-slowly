import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { EventRow, isPastEvent, eventCategoryKey } from "@/lib/eventSort";

const MyEvents = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["my-events", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user!.id)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data as EventRow[];
    },
    enabled: !!user,
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === "ar" ? "حذف هذه الفعالية؟" : "Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(lang === "ar" ? "تم الحذف" : "Deleted");
    queryClient.invalidateQueries({ queryKey: ["my-events"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  const locale = lang === "ar" ? "ar-EG" : "en-US";

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "فعالياتي" : "My Events"}</h1>
      </header>

      <div className="px-4 py-5 space-y-3">
        {!user ? (
          <p className="text-center text-sm text-muted-foreground py-12">{lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
        ) : isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-12">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{t("event.noEvents")}</p>
          </div>
        ) : (
          events.map((e) => {
            const past = isPastEvent(e);
            return (
              <div key={e.id} className="bg-card rounded-xl shadow-card p-3 flex gap-3 items-center">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                  {e.image ? <img src={e.image} alt="" className="w-full h-full object-cover" /> : <Calendar className="w-6 h-6 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{lang === "ar" ? e.title_ar : e.title_en}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(e.start_date).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })} · {t(eventCategoryKey(e.category))}
                  </p>
                  <span className={`text-[10px] font-medium ${past ? "text-muted-foreground" : "text-success"}`}>
                    {past ? t("events.past") : t("events.upcoming")}
                  </span>
                </div>
                <button onClick={() => navigate(`/dashboard/trip-organizer/new-event?id=${e.id}`)} className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}

        <button onClick={() => navigate("/dashboard/trip-organizer/new-event")} className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2 mt-2">
          <Plus className="w-4 h-4" /> {lang === "ar" ? "إنشاء فعالية" : "Create Event"}
        </button>
      </div>
    </div>
  );
};

export default MyEvents;
