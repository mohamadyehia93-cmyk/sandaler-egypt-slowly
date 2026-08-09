import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

type ApplicationRow = {
  id: string;
  status: string;
  message: string | null;
  availability: string | null;
  created_at: string;
  cause: { id: string; slug: string | null; title_en: string; title_ar: string; image: string | null } | null;
  program: { id: string; slug: string | null; title_en: string; title_ar: string; image: string | null } | null;
};

export const applicationStatusLabel = (status: string, ar: boolean) => {
  switch (status) {
    case "pending": return ar ? "قيد المراجعة" : "Under review";
    case "accepted": return ar ? "مقبول" : "Accepted";
    case "declined": return ar ? "مرفوض" : "Declined";
    case "withdrawn": return ar ? "تم الانسحاب" : "Withdrawn";
    default: return status;
  }
};

export const applicationStatusClasses = (status: string) => {
  if (status === "accepted") return "bg-success/10 text-success";
  if (status === "pending") return "bg-warning/10 text-warning";
  if (status === "declined") return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
};

const MyApplications = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ar = lang === "ar";
  const locale = ar ? "ar-EG" : "en-US";
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["my-volunteer-applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("volunteer_applications")
        .select(
          "id, status, message, availability, created_at, cause:causes(id, slug, title_en, title_ar, image), program:programs(id, slug, title_en, title_ar, image)"
        )
        .eq("applicant_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as ApplicationRow[];
    },
  });

  const withdraw = async (id: string) => {
    setSavingId(id);
    const { error } = await supabase
      .from("volunteer_applications")
      .update({ status: "withdrawn" })
      .eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error(ar ? "تعذر الانسحاب" : "Could not withdraw");
      return;
    }
    toast.success(ar ? "تم الانسحاب من الطلب" : "Application withdrawn");
    queryClient.invalidateQueries({ queryKey: ["my-volunteer-applications", user?.id] });
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">{ar ? "طلبات التطوع" : "My Applications"}</h1>
      </header>

      <div className="px-4 py-5 space-y-3">
        {!user ? (
          <p className="text-center text-sm text-muted-foreground py-12">{ar ? "يرجى تسجيل الدخول" : "Please sign in"}</p>
        ) : isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-12">{ar ? "جاري التحميل..." : "Loading..."}</p>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <HeartHandshake className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{ar ? "لا توجد طلبات تطوع بعد" : "No volunteer applications yet"}</p>
            <button
              onClick={() => navigate("/causes")}
              className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
            >
              {ar ? "استكشف القضايا" : "Browse causes"}
            </button>
          </div>
        ) : (
          applications.map((a) => {
            const target = a.cause ?? a.program;
            const title = target ? (ar ? target.title_ar : target.title_en) : "—";
            // Programs have no public detail route yet, so only causes are linkable.
            const link = a.cause ? `/cause/${a.cause.slug || a.cause.id}` : null;
            return (
              <div key={a.id} className="bg-card rounded-xl shadow-card p-3 flex gap-3 items-start">
                <button
                  onClick={() => link && navigate(link)}
                  className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0 flex items-center justify-center"
                >
                  {target?.image ? (
                    <img src={target.image} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <HeartHandshake className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <p className="text-sm font-semibold text-foreground line-clamp-1 flex-1">{title}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${applicationStatusClasses(a.status)}`}>
                      {applicationStatusLabel(a.status, ar)}
                    </span>
                  </div>
                  {a.availability && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {ar ? "التوفر: " : "Availability: "}{a.availability}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(a.created_at).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  {a.message && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{a.message}</p>}
                  {a.status === "pending" && (
                    <button
                      disabled={savingId === a.id}
                      onClick={() => withdraw(a.id)}
                      className="mt-2 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive disabled:opacity-50"
                    >
                      {ar ? "انسحاب" : "Withdraw"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyApplications;
