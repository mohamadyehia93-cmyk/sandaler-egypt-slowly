import { useNavigate } from "react-router-dom";
import { ArrowLeft, Award } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useVisitorStats } from "@/hooks/useVisitorStats";
import { computeBadges, nextAction } from "@/lib/visitorBadges";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * HONESTY RULE: this page used to render six invented badges and three "quests"
 * with made-up progress. Everything here is now derived from the signed-in
 * visitor's real counts (see src/lib/visitorBadges.ts). The quest concept is gone
 * — a locked badge already states its own real next action, which is the only
 * measurable nudge the data supports.
 */
const BadgesQuests = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const { user } = useAuth();
  const { data: stats, isLoading } = useVisitorStats();

  const badges = stats ? computeBadges(stats) : [];
  const earned = badges.filter((b) => b.earned);
  const next = nextAction(badges);

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground rtl:rotate-180" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{ar ? "شاراتك" : "Your badges"}</h1>
      </header>

      <div className="px-4 pt-5">
        {!user ? (
          <div className="text-center py-16">
            <Award className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              {ar ? "سجّل الدخول لعرض شاراتك." : "Sign in to see your badges."}
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
            >
              {ar ? "تسجيل الدخول" : "Sign in"}
            </button>
          </div>
        ) : isLoading || !stats ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-card border border-border mb-5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {earned.length}/{badges.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ar ? "شارات مكتسبة" : "Badges earned"}
                </p>
              </div>
            </div>

            {next && (
              <button
                onClick={() => navigate(next.key === "first-step" ? "/edit-profile" : "/")}
                className="w-full text-left bg-card rounded-xl shadow-card p-4 mb-5"
              >
                <p className="text-xs text-muted-foreground">{ar ? "الخطوة التالية" : "Next step"}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {ar ? next.unlock.ar : next.unlock.en}
                </p>
              </button>
            )}

            <div className="grid grid-cols-2 gap-3">
              {badges.map((b) => (
                <div
                  key={b.key}
                  className={`rounded-xl p-3 border ${
                    b.earned ? "bg-card border-primary/30 shadow-card" : "bg-secondary/40 border-border"
                  }`}
                >
                  <div className={`text-2xl ${b.earned ? "" : "opacity-40 grayscale"}`}>{b.emoji}</div>
                  <p className="text-sm font-semibold text-foreground mt-1.5">
                    {ar ? b.name.ar : b.name.en}
                  </p>
                  {b.earned ? (
                    <p className="text-[11px] text-primary mt-0.5">{ar ? "مكتسبة" : "Earned"}</p>
                  ) : (
                    <>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {ar ? b.unlock.ar : b.unlock.en}
                      </p>
                      {b.progress && b.progress.current > 0 && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {ar
                            ? `${b.progress.current} من ${b.progress.target}`
                            : `${b.progress.current} of ${b.progress.target}`}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground mt-5 leading-relaxed">
              {ar
                ? "الشارات تُحسب من نشاطك الفعلي على سندل، ولا شيء منها مُقدَّر."
                : "Badges are counted from what you actually did on Sandal. Nothing here is estimated."}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default BadgesQuests;
