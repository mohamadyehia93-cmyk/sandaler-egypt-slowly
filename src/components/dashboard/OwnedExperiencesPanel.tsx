import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CalendarClock, Compass, Pencil, Inbox, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyProviderId } from "@/lib/providerRecord";

/**
 * Rule: any provider can manage any listing they own, whatever their primary
 * role. Dashboards for roles other than service-provider render this panel; it
 * shows nothing unless the signed-in provider actually owns an experience.
 * Ownership is enforced by RLS (owns_provider_record / is_experience_provider).
 */
const OwnedExperiencesPanel = () => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["owned-experiences-panel", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const providerId = await fetchMyProviderId(user!.id);
      if (!providerId) return { experiences: [], pending: 0 };
      const { data: experiences, error } = await supabase
        .from("experiences")
        .select("id, title_en, title_ar, status")
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const { count } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("provider_id", user!.id)
        .in("status", ["pending", "pending_payment"]);
      return { experiences: experiences ?? [], pending: count ?? 0 };
    },
  });

  if (!data || data.experiences.length === 0) return null;

  return (
    <section className="bg-card rounded-xl shadow-card p-4 space-y-3" aria-label={ar ? "تجاربي" : "My experiences"}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-primary" />
          {ar ? "تجاربي" : "My experiences"}
        </h2>
        <button
          onClick={() => navigate("/dashboard/service-provider/my-listings")}
          className="text-[11px] font-semibold text-primary flex items-center gap-0.5"
        >
          {ar ? "إدارة الكل" : "Manage all"} <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>
      </div>

      {data.pending > 0 && (
        <p className="text-[11px] text-foreground bg-primary/10 rounded-lg px-3 py-2 flex items-center gap-1.5">
          <Inbox className="w-3.5 h-3.5 text-primary" />
          {ar
            ? `${data.pending} طلب حجز بانتظار ردك — ستجدها في "إدارة الكل" وفي الرسائل.`
            : `${data.pending} booking request(s) awaiting your reply — see "Manage all" and your inbox.`}
        </p>
      )}

      <div className="space-y-2">
        {data.experiences.map((e) => (
          <div key={e.id} className="border border-border rounded-lg p-2.5">
            <p className="text-xs font-semibold text-foreground line-clamp-1">
              {ar ? e.title_ar || e.title_en : e.title_en}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => navigate(`/dashboard/service-provider/edit-experience/${e.id}`)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border text-[11px] font-semibold text-foreground"
              >
                <Pencil className="w-3.5 h-3.5" /> {ar ? "تعديل" : "Edit"}
              </button>
              <button
                onClick={() => navigate(`/dashboard/service-provider/listing/${e.id}/slots`)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border text-[11px] font-semibold text-foreground"
              >
                <CalendarClock className="w-3.5 h-3.5" /> {ar ? "المواعيد" : "Availability"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OwnedExperiencesPanel;
