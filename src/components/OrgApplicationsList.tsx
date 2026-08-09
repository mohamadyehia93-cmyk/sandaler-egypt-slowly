import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { applicationStatusClasses, applicationStatusLabel } from "@/pages/MyApplications";

type OrgApplication = {
  id: string;
  status: string;
  full_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  message: string | null;
  availability: string | null;
  created_at: string;
  cause: { title_en: string; title_ar: string } | null;
  program: { title_en: string; title_ar: string } | null;
};

const TERMINAL = ["accepted", "declined", "withdrawn"];

const OrgApplicationsList = () => {
  const { lang } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ar = lang === "ar";
  const locale = ar ? "ar-EG" : "en-US";
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["org-volunteer-applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("volunteer_applications")
        .select(
          "id, status, full_name, contact_email, contact_phone, message, availability, created_at, cause:causes(title_en, title_ar), program:programs(title_en, title_ar)"
        )
        .eq("org_owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as OrgApplication[];
    },
  });

  const updateStatus = async (id: string, status: "accepted" | "declined") => {
    setSavingId(id);
    const { error } = await supabase.from("volunteer_applications").update({ status }).eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error(ar ? "تعذر تحديث الطلب" : "Could not update the application");
      return;
    }
    toast.success(
      status === "accepted"
        ? (ar ? "تم قبول المتطوع" : "Volunteer accepted")
        : (ar ? "تم رفض الطلب" : "Application declined")
    );
    queryClient.invalidateQueries({ queryKey: ["org-volunteer-applications", user?.id] });
  };

  return (
    <div className="bg-card rounded-xl shadow-card p-4">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <HeartHandshake className="w-4 h-4 text-role-organization" />
        {ar ? "طلبات التطوع" : "Volunteer Applications"}
      </h3>

      {isLoading ? (
        <p className="text-xs text-muted-foreground py-3">{ar ? "جاري التحميل..." : "Loading..."}</p>
      ) : applications.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3">{ar ? "لا توجد طلبات بعد" : "No applications yet"}</p>
      ) : (
        applications.map((a) => {
          const terminal = TERMINAL.includes(a.status);
          const target = a.cause ?? a.program;
          const title = target ? (ar ? target.title_ar : target.title_en) : "—";
          return (
            <div key={a.id} className="py-2.5 border-b border-border last:border-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">
                    {a.full_name || (ar ? "متطوع" : "Volunteer")}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                    {a.availability ? ` · ${a.availability}` : ""}
                  </p>
                  {(a.contact_email || a.contact_phone) && (
                    <p className="text-[10px] text-muted-foreground" dir="auto">
                      {a.contact_email}
                      {a.contact_email && a.contact_phone ? " · " : ""}
                      {a.contact_phone}
                    </p>
                  )}
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${applicationStatusClasses(a.status)}`}>
                  {applicationStatusLabel(a.status, ar)}
                </span>
              </div>

              {a.message && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-3">{a.message}</p>}

              {!terminal && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    disabled={savingId === a.id}
                    onClick={() => updateStatus(a.id, "accepted")}
                    className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-role-organization text-white flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" /> {ar ? "قبول" : "Accept"}
                  </button>
                  <button
                    disabled={savingId === a.id}
                    onClick={() => updateStatus(a.id, "declined")}
                    className="flex-1 text-[11px] font-semibold py-1.5 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" /> {ar ? "رفض" : "Decline"}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default OrgApplicationsList;
