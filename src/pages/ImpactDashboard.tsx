import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, HandHeart, Leaf } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * HONESTY RULE: this page shows only the signed-in visitor's own recorded support.
 * It used to render invented CO₂ savings, kilometres walked, "communities supported"
 * counts and a hardcoded list of causes with hardcoded amounts — none of which the
 * app measures. Those blocks are gone; nothing here is estimated or filled in.
 */
const ImpactDashboard = () => {
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const ar = lang === "ar";

  const { data: pledges = [], isLoading } = useQuery({
    queryKey: ["my-impact-pledges", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_pledges")
        .select("id, kind, amount, currency, status, created_at, cause_id, causes(title_en, title_ar, slug)")
        .eq("supporter_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const donations = (pledges as any[]).filter((p) => Number(p.amount) > 0);
  const totalDonated = donations.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const causesSupported = new Set((pledges as any[]).map((p) => p.cause_id).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{ar ? "لوحة التأثير" : "Impact Dashboard"}</h1>
      </header>

      <div className="px-4 pt-5">
        {!user ? (
          <div className="text-center py-16">
            <Leaf className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              {ar ? "سجّل الدخول لعرض دعمك المسجَّل." : "Sign in to see the support recorded on your account."}
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
            >
              {ar ? "تسجيل الدخول" : "Sign in"}
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : pledges.length === 0 ? (
          <div className="text-center py-16">
            <HandHeart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              {ar
                ? "لا يوجد دعم مسجَّل بعد. عندما تدعم قضية محلية سيظهر هنا."
                : "No support recorded yet. Once you support a local cause it will appear here."}
            </p>
            <button
              onClick={() => navigate("/causes")}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
            >
              {ar ? "استكشف القضايا" : "Explore causes"}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-card shadow-card border border-border">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <HandHeart className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground">
                  {totalDonated} {t("common.egp")}
                </p>
                <p className="text-xs font-medium text-foreground mt-0.5">
                  {ar ? "إجمالي تبرعاتك المسجَّلة" : "Recorded donations"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card shadow-card border border-border">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground">{causesSupported}</p>
                <p className="text-xs font-medium text-foreground mt-0.5">
                  {ar ? "قضايا دعمتها" : "Causes supported"}
                </p>
              </div>
            </div>

            <h2 className="text-base font-bold text-foreground mb-3">
              {ar ? "سجل دعمك" : "Your support history"}
            </h2>
            <div className="space-y-2">
              {(pledges as any[]).map((p) => {
                const title = ar ? p.causes?.title_ar || p.causes?.title_en : p.causes?.title_en;
                return (
                  <button
                    key={p.id}
                    onClick={() => p.causes?.slug && navigate(`/cause/${p.causes.slug}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-card shadow-card border border-border text-start"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {title && <p className="text-sm font-semibold text-foreground truncate">{title}</p>}
                      <p className="text-xs text-muted-foreground">
                        {p.kind} · {new Date(p.created_at).toLocaleDateString(ar ? "ar-EG" : "en-GB")}
                        {p.status ? ` · ${p.status}` : ""}
                      </p>
                    </div>
                    {Number(p.amount) > 0 && (
                      <span className="text-sm font-bold text-primary-dark flex-shrink-0">
                        {p.amount} {p.currency || t("common.egp")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImpactDashboard;
