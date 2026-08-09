import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Plus, Pencil, Trash2, Calendar, Users, MapPin, Clock,
  CalendarCheck, CalendarClock, Send, CheckCircle2, XCircle, FileEdit, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  EventRow, isPastEvent, sortEventsUpcomingFirst, eventCategoryKey,
  eventStatusClasses, eventStatusLabel,
} from "@/lib/eventSort";
import EventAttendees from "@/components/EventAttendees";

type Filter = "all" | "draft" | "pending" | "published" | "rejected";


const EventsDashboard = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  const [filter, setFilter] = useState<Filter>("all");

  const { data: isAdmin = false } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["my-events", user?.id, isAdmin],
    queryFn: async () => {
      let query = supabase.from("events").select("*").order("start_date", { ascending: false });
      if (!isAdmin) query = query.eq("organizer_id", user!.id);
      const { data, error } = await query;
      if (error) throw error;
      return data as EventRow[];
    },
    enabled: !!user,
  });

  const visible = useMemo(
    () => (filter === "all" ? events : events.filter((e) => (e.status || "draft") === filter)),
    [events, filter]
  );
  const sorted = useMemo(() => sortEventsUpcomingFirst(visible), [visible]);

  const stats = useMemo(() => {
    const upcoming = events.filter((e) => !isPastEvent(e));
    return {
      total: events.length,
      upcoming: upcoming.length,
      pending: events.filter((e) => (e.status || "draft") === "pending").length,
      capacity: events.reduce((sum, e) => sum + (e.capacity ?? 0), 0),
    };
  }, [events]);

  const counts = useMemo(() => {
    const by = (s: string) => events.filter((e) => (e.status || "draft") === s).length;
    return { all: events.length, draft: by("draft"), pending: by("pending"), published: by("published"), rejected: by("rejected") };
  }, [events]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["my-events"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  const setStatus = async (id: string, status: string, notes?: string | null) => {
    const patch: Record<string, unknown> = { status };
    if (notes !== undefined) patch.review_notes = notes;
    const { error } = await supabase.from("events").update(patch as never).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      lang === "ar" ? `تم التحديث: ${eventStatusLabel(status, lang)}` : `Updated: ${eventStatusLabel(status, lang)}`
    );
    refresh();
  };

  const handleReject = async (id: string) => {
    const notes = window.prompt(lang === "ar" ? "سبب الرفض (اختياري)" : "Reason for rejection (optional)") ?? "";
    await setStatus(id, "rejected", notes.trim() || null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(lang === "ar" ? "حذف هذه الفعالية؟" : "Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(lang === "ar" ? "تم الحذف" : "Deleted");
    refresh();
  };

  const overview = [
    { value: stats.total, label: lang === "ar" ? "إجمالي الفعاليات" : "Total Events", icon: Calendar },
    { value: stats.upcoming, label: lang === "ar" ? "قادمة" : "Upcoming", icon: CalendarClock },
    { value: stats.pending, label: lang === "ar" ? "قيد المراجعة" : "Pending Review", icon: CalendarCheck },
    { value: stats.capacity, label: lang === "ar" ? "إجمالي السعة" : "Total Capacity", icon: Users },
  ];

  const filters: Filter[] = ["all", "draft", "pending", "published", "rejected"];

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-trip-organizer text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate("/dashboard/trip-organizer")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "إدارة الفعاليات" : "Events Manager"}</h1>
        {isAdmin && (
          <span className="ms-auto text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
            {lang === "ar" ? "مراجع" : "Reviewer"}
          </span>
        )}
      </header>

      <div className="px-4 py-5 space-y-5">
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

        {/* Status filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-role-trip-organizer text-white border-role-trip-organizer"
                  : "bg-card text-foreground border-border"
              }`}
            >
              {f === "all" ? (lang === "ar" ? "الكل" : "All") : eventStatusLabel(f, lang)} ({counts[f]})
            </button>
          ))}
        </div>

        <div className="space-y-3">
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
              const status = e.status || "draft";
              return (
                <div key={e.id} className="bg-card rounded-xl shadow-card p-3 space-y-2">
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center">
                      {e.image ? <img src={e.image} alt="" className="w-full h-full object-cover" /> : <Calendar className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className="text-sm font-semibold text-foreground line-clamp-1 flex-1">{lang === "ar" ? e.title_ar : e.title_en}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${eventStatusClasses(status)}`}>
                          {eventStatusLabel(status, lang)}
                        </span>
                      </div>
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
                      {e.review_notes && (
                        <p className="text-[11px] text-destructive mt-1">
                          {lang === "ar" ? "ملاحظات المراجعة: " : "Review notes: "}{e.review_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
                    <button onClick={() => navigate(`/dashboard/trip-organizer/new-event?id=${e.id}`)} className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-role-trip-organizer/10 text-role-trip-organizer flex items-center gap-1">
                      <Pencil className="w-3.5 h-3.5" /> {lang === "ar" ? "تعديل" : "Edit"}
                    </button>

                    {(status === "draft" || status === "rejected") && (
                      <button onClick={() => setStatus(e.id, "pending", null)} className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary flex items-center gap-1">
                        <Send className="w-3.5 h-3.5" /> {lang === "ar" ? "إرسال للمراجعة" : "Submit for Review"}
                      </button>
                    )}
                    {status === "pending" && !isAdmin && (
                      <button onClick={() => setStatus(e.id, "draft")} className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground flex items-center gap-1">
                        <FileEdit className="w-3.5 h-3.5" /> {lang === "ar" ? "سحب الطلب" : "Withdraw"}
                      </button>
                    )}
                    {isAdmin && status !== "published" && (
                      <button onClick={() => setStatus(e.id, "published", null)} className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-success/10 text-success flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {lang === "ar" ? "موافقة" : "Approve"}
                      </button>
                    )}
                    {isAdmin && status !== "rejected" && (
                      <button onClick={() => handleReject(e.id)} className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> {lang === "ar" ? "رفض" : "Reject"}
                      </button>
                    )}

                    <button onClick={() => handleDelete(e.id)} className="ms-auto p-2 rounded-lg bg-destructive/10 text-destructive">
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
