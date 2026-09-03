import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, roleDashboardPaths, roleLabels, type LocalRole } from "@/hooks/useUserRole";
import { useIsAdmin } from "@/hooks/useIsAdmin";

/**
 * Provider dashboards are private surfaces. This gate is applied once, at the
 * router level (see RouteGuard), so no dashboard page needs its own check.
 *
 *  - signed out            → redirect to /login?next=<path>
 *  - signed in, wrong role → bilingual "not for your account" card + /welcome
 *  - signed in, right role → children, unchanged
 *  - admins                → always allowed (assisted onboarding / support)
 */

/** Longest-prefix match wins, so /dashboard/culture-actor/... resolves correctly. */
const ROUTE_ROLES: { prefix: string; role: LocalRole }[] = (
  Object.entries(roleDashboardPaths) as [LocalRole, string][]
).map(([role, path]) => ({ prefix: path, role }));

/** Role-neutral dashboard routes: any provider role may use them. */
const ANY_PROVIDER_PREFIXES = ["/dashboard/events", "/dashboard/new-event"];

export const requiredRoleForPath = (path: string): LocalRole | "any-provider" | null => {
  if (!path.startsWith("/dashboard")) return null;
  if (ANY_PROVIDER_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
    return "any-provider";
  }
  const match = ROUTE_ROLES.filter((r) => path === r.prefix || path.startsWith(r.prefix + "/")).sort(
    (a, b) => b.prefix.length - a.prefix.length
  )[0];
  return match ? match.role : "any-provider";
};

const Spinner = () => (
  <div className="min-h-screen bg-surface flex items-center justify-center">
    <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

const DashboardGate = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { role, isProvider, roleLoading, dashboardPath } = useUserRole();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  const path = location.pathname;
  const required = requiredRoleForPath(path);
  const ready = !authLoading && !roleLoading && !adminLoading;
  const signedOut = !authLoading && !user;

  useEffect(() => {
    if (required && signedOut) {
      navigate(`/login?next=${encodeURIComponent(path + location.search)}`, { replace: true });
    }
  }, [required, signedOut, path, location.search, navigate]);

  if (!required) return <>{children}</>;
  if (signedOut) return <Spinner />; // momentary, the effect above redirects
  if (!ready) return <Spinner />;
  if (isAdmin) return <>{children}</>;

  const allowed =
    required === "any-provider" ? isProvider : isProvider && role === required;

  if (allowed) return <>{children}</>;

  const roleName = required === "any-provider" ? null : roleLabels[required];

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-bold text-foreground mb-2">
          {lang === "ar" ? "هذه اللوحة ليست لحسابك" : "This dashboard isn't for your account"}
        </h1>
        <p className="text-sm text-muted-foreground mb-5">
          {lang === "ar"
            ? roleName
              ? `هذه اللوحة مخصصة لحسابات "${roleName.ar}". حسابك الحالي لا يملك هذه الصفة.`
              : "هذه اللوحة مخصصة لمقدمي الخدمات على سندل. حسابك الحالي زائر."
            : roleName
              ? `This area is for ${roleName.en} accounts. Your account doesn't have that role.`
              : "This area is for Sandal providers. Your account is a visitor account."}
        </p>
        <div className="space-y-2">
          {/* An existing provider can resolve this in one tap — no re-onboarding.
              whos-who is invitation-only and never offered as a switch target. */}
          {isProvider && required !== "any-provider" && required !== "whos-who" && (
            <Link
              to={`/switch-role?to=${required}`}
              className="block w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
            >
              {lang === "ar" ? "غيّر دوري إلى هذا" : "Switch my role to this"}
            </Link>
          )}
          {dashboardPath && (
            <Link
              to={dashboardPath}
              className={`block w-full py-3 rounded-xl font-semibold text-sm ${
                isProvider && required !== "any-provider" && required !== "whos-who"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {lang === "ar" ? "اذهب إلى لوحتي" : "Go to my dashboard"}
            </Link>
          )}
          <Link
            to={isProvider ? "/switch-role" : "/welcome"}
            className="block w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm"
          >
            {isProvider
              ? lang === "ar"
                ? "اختر دورًا آخر"
                : "Choose another role"
              : lang === "ar"
                ? "سجّل كمقدم خدمة"
                : "Become a provider"}
          </Link>
          <Link to="/" className="block w-full py-3 text-sm text-muted-foreground">
            {lang === "ar" ? "العودة للرئيسية" : "Back to home"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardGate;
