import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, ShieldAlert, ShieldCheck, LogIn, Flag, CalendarCheck,
  CheckCircle2, XCircle, Eye, EyeOff, Loader2, BookOpen, Plus, Pencil, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { eventStatusClasses, eventStatusLabel } from "@/lib/eventSort";

type FlagReport = {
  id: string;
  reporter_id: string;
  issue_type: string;
  priority: string;
  provider_name: string | null;
  location: string | null;
  description: string;
  status: string;
  resolution_note: string | null;
  reviewed_at: string | null;
  created_at: string;
};

type PendingEvent = {
  id: string;
  title_en: string;
  title_ar: string;
  start_date: string;
  status: string;
  organizer_id: string | null;
  location_en: string | null;
  location_ar: string | null;
};

type EditorialRow = {
  id: string;
  slug: string | null;
  name_en: string;
  name_ar: string | null;
  status: string | null;
  city_id: string | null;
  kind: "stay" | "ride";
};

const REPORT_STATUSES = ["pending", "reviewing", "resolved", "dismissed"] as const;

const reportStatusLabel = (s: string, lang: string) => {
  const map: Record<string, { en: string; ar: string }> = {
    pending: { en: "Pending", ar: "قيد الانتظار" },
    reviewing: { en: "Reviewing", ar: "قيد المراجعة" },
    resolved: { en: "Resolved", ar: "تم الحل" },
    dismissed: { en: "Dismissed", ar: "مرفوض" },
  };
  const e = map[s] ?? { en: s, ar: s };
  return lang === "ar" ? e.ar : e.en;
};

const reportStatusClasses = (s: string) =>
  ({
    pending: "bg-amber-100 text-amber-800",
    reviewing: "bg-primary/10 text-primary-dark",
    resolved: "bg-emerald-100 text-emerald-800",
    dismissed: "bg-muted text-muted-foreground",
  }[s] ?? "bg-muted text-muted-foreground");

const Admin = () => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin, loading, user } = useIsAdmin();
  const [tab, setTab] = useState<"reports" | "events" | "editorial">("reports");
  const [claiming, setClaiming] = useState(false);

  // A signed-in non-admin cannot read other users' rows in user_roles (RLS is
  // scoped to auth.uid()), so we ask the DB for a single boolean instead.
  const { data: adminExists } = useQuery({
    queryKey: ["admin-exists"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_exists");
      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !isAdmin && !loading,
    staleTime: 30_000,
  });
  const noAdminYet = adminExists === false;

  const claimAdmin = async () => {
    setClaiming(true);
    const { error } = await supabase.rpc("claim_first_admin");
    setClaiming(false);
    if (error) {
      const already = /already/i.test(error.message);
      toast.error(
        already
          ? ar
            ? "يوجد مشرف بالفعل. لا يمكن طلب الصلاحية مرة أخرى."
            : "An administrator already exists. Admin access can no longer be claimed."
          : ar
            ? `تعذّر طلب صلاحية الإدارة: ${error.message}`
            : `Could not claim admin access: ${error.message}`,
      );
      queryClient.invalidateQueries({ queryKey: ["admin-exists"] });
      return;
    }
    toast.success(
      ar ? "تم منحك صلاحية الإدارة." : "You are now the administrator.",
    );
    await queryClient.invalidateQueries({ queryKey: ["admin-exists"] });
    await queryClient.invalidateQueries({ queryKey: ["is-admin"] });
  };

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["admin-flag-reports"],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("flag_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as FlagReport[];
    },
    enabled: isAdmin,
  });

  const { data: pendingEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["admin-pending-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title_en, title_ar, start_date, status, organizer_id, location_en, location_ar")
        .eq("status", "pending")
        .order("start_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as PendingEvent[];
    },
    enabled: isAdmin,
  });

  // Editorial entries are Sandal's own reference information: no owner, no
  // booking. Admin RLS allows write only where listing_kind = 'editorial'.
  const { data: editorial = [], isLoading: editorialLoading } = useQuery({
    queryKey: ["admin-editorial-listings"],
    queryFn: async () => {
      const [stays, rides] = await Promise.all([
        supabase
          .from("accommodations")
          .select("id, slug, name_en, name_ar, status, city_id")
          .eq("listing_kind", "editorial")
          .order("created_at", { ascending: false }),
        supabase
          .from("transport")
          .select("id, slug, name_en, name_ar, status, city_id")
          .eq("listing_kind", "editorial")
          .order("created_at", { ascending: false }),
      ]);
      if (stays.error) throw stays.error;
      if (rides.error) throw rides.error;
      return [
        ...(stays.data ?? []).map((r) => ({ ...r, kind: "stay" as const })),
        ...(rides.data ?? []).map((r) => ({ ...r, kind: "ride" as const })),
      ] as unknown as EditorialRow[];
    },
    enabled: isAdmin,
  });

  const editorialTable = (kind: "stay" | "ride") => (kind === "stay" ? "accommodations" : "transport");

  const toggleEditorialStatus = async (row: EditorialRow) => {
    const next = row.status === "published" ? "draft" : "published";
    const { error } = await supabase
      .from(editorialTable(row.kind))
      .update({ status: next } as never)
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(next === "published" ? (ar ? "تم النشر" : "Published") : (ar ? "تم التحويل لمسودة" : "Moved to draft"));
    queryClient.invalidateQueries({ queryKey: ["admin-editorial-listings"] });
  };

  const deleteEditorial = async (row: EditorialRow) => {
    if (!window.confirm(ar ? "حذف هذا المدخل؟" : "Delete this entry?")) return;
    const { error } = await supabase.from(editorialTable(row.kind)).delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(ar ? "تم الحذف" : "Deleted");
    queryClient.invalidateQueries({ queryKey: ["admin-editorial-listings"] });
  };

  const openReports = useMemo(
    () => reports.filter((r) => r.status === "pending" || r.status === "reviewing").length,
    [reports]
  );

  const setReportStatus = async (id: string, status: string) => {
    let note: string | null = null;
    if (status === "resolved" || status === "dismissed") {
      note = window.prompt(ar ? "ملاحظة (اختياري)" : "Resolution note (optional)") ?? "";
      note = note.trim() || null;
    }
    const patch: Record<string, unknown> = { status };
    if (note !== null) patch.resolution_note = note;
    const { error } = await supabase.from("flag_reports").update(patch as never).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(ar ? `تم التحديث: ${reportStatusLabel(status, lang)}` : `Updated: ${reportStatusLabel(status, lang)}`);
    queryClient.invalidateQueries({ queryKey: ["admin-flag-reports"] });
  };

  const setEventStatus = async (id: string, status: string) => {
    const patch: Record<string, unknown> = { status };
    if (status === "rejected") {
      const notes = window.prompt(ar ? "سبب الرفض (اختياري)" : "Reason for rejection (optional)") ?? "";
      patch.review_notes = notes.trim() || null;
    }
    const { error } = await supabase.from("events").update(patch as never).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(ar ? `تم التحديث: ${eventStatusLabel(status, lang)}` : `Updated: ${eventStatusLabel(status, lang)}`);
    queryClient.invalidateQueries({ queryKey: ["admin-pending-events"] });
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  // ---- gate states (never an infinite spinner) ----
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {ar ? "سجّل الدخول للوصول إلى لوحة الإدارة" : "Sign in to access the admin panel"}
        </h2>
        <Button onClick={() => navigate("/login")} className="gap-2">
          <LogIn className="w-4 h-4" />
          {ar ? "تسجيل الدخول" : "Sign in"}
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{ar ? "غير مصرّح" : "Not authorised"}</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          {ar
            ? "هذه الصفحة مخصّصة للمشرفين فقط."
            : "This page is only available to administrators."}
        </p>

        {noAdminYet && (
          <div className="w-full max-w-sm rounded-xl border border-primary/30 bg-primary/5 p-4 text-start" dir={ar ? "rtl" : "ltr"}>
            <p className="text-sm text-foreground">
              {ar
                ? "لم يتم تعيين أي مشرف بعد. سيؤدي طلب صلاحية الإدارة إلى جعل هذا الحساب هو المشرف. يمكن تنفيذ ذلك مرة واحدة فقط."
                : "No administrator has been set up yet. Claiming admin access will make this account the administrator. This can only be done once."}
            </p>
            <Button className="mt-3 w-full gap-2" onClick={claimAdmin} disabled={claiming}>
              {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {ar ? "طلب صلاحية الإدارة" : "Claim admin access"}
            </Button>
          </div>
        )}

        <Button variant="outline" onClick={() => navigate("/profile")}>
          {ar ? "العودة إلى الملف الشخصي" : "Back to profile"}
        </Button>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-primary-dark text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate("/profile")} className="p-1" aria-label={ar ? "رجوع" : "Back"}>
          <ArrowLeft className={`w-5 h-5 ${ar ? "rotate-180" : ""}`} />
        </button>
        <h1 className="text-lg font-bold">{ar ? "لوحة الإدارة" : "Admin"}</h1>
        <span className="ms-auto inline-flex items-center gap-1 text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
          <ShieldCheck className="w-3 h-3" />
          {ar ? "مشرف" : "Admin"}
        </span>
      </header>

      <div className="px-4 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background rounded-xl p-3 border border-border">
            <Flag className="w-4 h-4 text-primary mb-1" />
            <p className="text-xl font-bold text-foreground">{openReports}</p>
            <p className="text-xs text-muted-foreground">{ar ? "تقارير مفتوحة" : "Open reports"}</p>
          </div>
          <div className="bg-background rounded-xl p-3 border border-border">
            <CalendarCheck className="w-4 h-4 text-primary mb-1" />
            <p className="text-xl font-bold text-foreground">{pendingEvents.length}</p>
            <p className="text-xs text-muted-foreground">{ar ? "فعاليات للمراجعة" : "Events awaiting review"}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(["reports", "events", "editorial"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex-1 text-xs font-semibold py-2 rounded-full border transition-colors ${
                tab === k
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border"
              }`}
            >
              {k === "reports"
                ? ar ? "التقارير" : "Flag reports"
                : k === "events"
                  ? ar ? "الفعاليات" : "Pending events"
                  : ar ? "معلومات دليلية" : "Editorial"}
            </button>
          ))}
        </div>

        {tab === "reports" && (
          <div className="space-y-3">
            {reportsLoading && (
              <p className="text-sm text-muted-foreground">{ar ? "جارٍ التحميل…" : "Loading…"}</p>
            )}
            {!reportsLoading && reports.length === 0 && (
              <p className="text-sm text-muted-foreground">{ar ? "لا توجد تقارير." : "No reports."}</p>
            )}
            {reports.map((r) => (
              <div key={r.id} className="bg-background rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {r.provider_name || (ar ? "بدون اسم" : "Unnamed subject")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.issue_type} · {r.priority}
                      {r.location ? ` · ${r.location}` : ""}
                    </p>
                  </div>
                  <span
                    className={`ms-auto shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${reportStatusClasses(r.status)}`}
                  >
                    {reportStatusLabel(r.status, lang)}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{r.description}</p>
                <p className="text-[11px] text-muted-foreground">
                  {ar ? "المُبلِّغ" : "Reporter"}: {r.reporter_id.slice(0, 8)}… ·{" "}
                  {new Date(r.created_at).toLocaleDateString(ar ? "ar-EG" : "en-US")}
                </p>
                {r.resolution_note && (
                  <p className="text-xs bg-muted rounded-lg p-2 text-foreground/80">
                    {ar ? "ملاحظة" : "Note"}: {r.resolution_note}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {REPORT_STATUSES.filter((s) => s !== r.status && s !== "pending").map((s) => (
                    <button
                      key={s}
                      onClick={() => setReportStatus(r.id, s)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors"
                    >
                      {s === "reviewing" && <Eye className="w-3.5 h-3.5" />}
                      {s === "resolved" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {s === "dismissed" && <XCircle className="w-3.5 h-3.5 text-muted-foreground" />}
                      {reportStatusLabel(s, lang)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "events" && (
          <div className="space-y-3">
            {eventsLoading && (
              <p className="text-sm text-muted-foreground">{ar ? "جارٍ التحميل…" : "Loading…"}</p>
            )}
            {!eventsLoading && pendingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {ar ? "لا توجد فعاليات في انتظار الموافقة." : "No events awaiting approval."}
              </p>
            )}
            {pendingEvents.map((e) => (
              <div key={e.id} className="bg-background rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {ar ? e.title_ar || e.title_en : e.title_en || e.title_ar}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.start_date).toLocaleDateString(ar ? "ar-EG" : "en-US")}
                      {(ar ? e.location_ar : e.location_en) ? ` · ${ar ? e.location_ar : e.location_en}` : ""}
                    </p>
                  </div>
                  <span
                    className={`ms-auto shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${eventStatusClasses(e.status)}`}
                  >
                    {eventStatusLabel(e.status, lang)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => setEventStatus(e.id, "published")}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-primary text-primary-foreground"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {ar ? "نشر" : "Approve"}
                  </button>
                  <button
                    onClick={() => setEventStatus(e.id, "rejected")}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {ar ? "رفض" : "Reject"}
                  </button>
                  <button
                    onClick={() => navigate(`/event/${e.id}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {ar ? "عرض" : "View"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "editorial" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {ar
                ? "مدخلات دليلية من إعداد سندال: معلومات عملية بلا مالك ولا حجز — مثل معدية بورسعيد."
                : "Sandal's own reference entries: practical information with no owner and no booking — like the Port Said ferry."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/admin/editorial/stay/new")}
                className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold py-2.5 rounded-xl bg-primary text-primary-foreground"
              >
                <Plus className="w-3.5 h-3.5" />
                {ar ? "مكان إقامة" : "New stay"}
              </button>
              <button
                onClick={() => navigate("/admin/editorial/ride/new")}
                className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold py-2.5 rounded-xl bg-primary text-primary-foreground"
              >
                <Plus className="w-3.5 h-3.5" />
                {ar ? "خدمة نقل" : "New ride"}
              </button>
            </div>

            {editorialLoading && (
              <p className="text-sm text-muted-foreground">{ar ? "جارٍ التحميل…" : "Loading…"}</p>
            )}
            {!editorialLoading && editorial.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {ar ? "لا توجد مدخلات دليلية بعد." : "No editorial entries yet."}
              </p>
            )}
            {editorial.map((row) => (
              <div key={`${row.kind}-${row.id}`} className="bg-background rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {ar ? row.name_ar || row.name_en : row.name_en}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.kind === "stay" ? (ar ? "إقامة" : "Stay") : ar ? "نقل" : "Transport"}
                      {row.city_id ? ` · ${row.city_id}` : ""}
                    </p>
                  </div>
                  <span
                    className={`ms-auto shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      row.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {row.status === "published" ? (ar ? "منشور" : "Published") : ar ? "مسودة" : "Draft"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/admin/editorial/${row.kind}/${row.id}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {ar ? "تعديل" : "Edit"}
                  </button>
                  <button
                    onClick={() => toggleEditorialStatus(row)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors"
                  >
                    {row.status === "published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {row.status === "published" ? (ar ? "إخفاء" : "Unpublish") : ar ? "نشر" : "Publish"}
                  </button>
                  <button
                    onClick={() => navigate(row.kind === "stay" ? `/stay/${row.slug || row.id}` : `/transport/${row.slug || row.id}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:bg-accent transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {ar ? "عرض" : "View"}
                  </button>
                  <button
                    onClick={() => deleteEditorial(row)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {ar ? "حذف" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
