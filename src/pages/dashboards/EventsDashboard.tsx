import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Pencil, Trash2, Calendar, Users, MapPin, Clock, CalendarCheck, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { EventRow, isPastEvent, sortEventsUpcomingFirst, eventCategoryKey } from "@/lib/eventSort";

const EventsDashboard = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const locale = lang === "ar" ? "ar-EG" : "en-US";

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

  const sorted = useMemo(() => sortEventsUpcomingFirst(events), [events]);

  const stats = useMemo(() => {
    const upcoming = events.filter((e) => !isPastEvent(e));
    const totalCapacity = events.reduce((sum, e) => sum + (e.capacity ?? 0), 0);
    return {
      total: events.length,
      upcoming: upcoming.length,
      past: events.length - upcoming.length,
      capacity: totalCapacity,
    };
  }, [events]);

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

  const overview = [
    { value: stats.total, label: lang === "ar" ? "إجمالي الفعاليات" : "Total Events", icon: Calendar },
    { value: stats.upcoming, label: lang === "ar" ? "قادمة" : "Upcoming", icon: CalendarClock },
    { value: stats.past, label: lang === "ar" ? "منتهية" : "Past", icon: CalendarCheck },
    { value: stats.capacity, label: lang === "ar" ? "إجمالي السعة" : "Total Capacity", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-trip-organizer text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate("/dashboard/trip-organizer")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "إدارة الفعاليات" : "Events Manager"}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        {/* Overview stats */}
        <div className="grid grid-cols-2 gap-3">
          {overview.map((o, i) => {
            const Icon = o.icon;
            return (
              <div key={i} className="bg-card rounded-xl shadow-card p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-role-trip-organizer/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-role-trip-organizer" />
                </div>
                <div className="min-w-0">
                  <span className="text-lg font-bold text-foreground block leading-none">{o.value.toLocaleString(locale)}</span>
                  <span className="text-[10px] text-muted-foreground">{o.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => navigate("/dashboard/trip-organizer/new-event")} className="w-full bg-role-trip-organizer text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> {lang === "ar" ? "إنشاء فعالية" : "Create Event"}
        </button>

        {/* Events list */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">{lang === "ar" ? "كل الفعاليات" : "All Events"}</h2>

          {!user ? (
            <p className="text-center text-sm text-muted-foreground py-12">{lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
          ) : isLoading ? (
            <p className="text-center text-sm text-muted-foreground py-12">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</p>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t("event.noEvents")}</p>
            </div>
          ) : (
            sorted.map((e) => {
              const past = isPastEvent(e);
              const venue = lang === "ar" ? e.venue_ar : e.venue_en;
              return (
                <div key={e.id} className="bg-card rounded-xl shadow-card p-3 flex gap-3 items-start">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                    {e.image ? <img src={e.image} alt="" className="w-full h-full object-cover" /> : <Calendar className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{lang === "ar" ? e.title_ar : e.title_en}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(e.start_date).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                      {e.event_time ? ` · ${e.event_time}` : ""}
                    </p>
                    {venue && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 line-clamp-1">
                        <MapPin className="w-3 h-3 shrink-0" /> {venue}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-medium ${past ? "text-muted-foreground" : "text-success"}`}>
                        {past ? t("events.past") : t("events.upcoming")}
                      </span>
                      {e.capacity != null && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Users className="w-3 h-3" /> {e.capacity.toLocaleString(locale)}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">· {t(eventCategoryKey(e.category))}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => navigate(`/dashboard/trip-organizer/new-event?id=${e.id}`)} className="p-2 rounded-lg bg-role-trip-organizer/10 text-role-trip-organizer">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsDashboard;
