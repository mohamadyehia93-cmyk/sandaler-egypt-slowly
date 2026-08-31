import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import DashboardGate from "@/components/DashboardGate";

/** Routes that providers can always access regardless of mode */
const allowedProviderRoutes = [
  "/inbox",
  "/profile",
  "/profile/impact",
  "/profile/badges",
  "/profile/settings",
  "/profile/help",
  "/edit-profile",
  
  "/welcome",
  // Invitation claim links must open for anyone, including existing providers.
  "/claim",
  "/dashboard",
  "/admin",
  "/flag-issue",
  "/booking",
  // Read-only public events calendar — linked from provider dashboards.
  "/calendar",
  "/.lovable/oauth/consent",
];


/**
 * Redirects provider users away from visitor-only pages
 * when they are NOT in visitor mode.
 */
const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { isProvider, isVisitorMode, dashboardPath } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isProvider || isVisitorMode || !dashboardPath) return;

    // Dashboard "Preview" opens public pages with ?preview=1 — never bounce those.
    if (new URLSearchParams(location.search).get("preview") === "1") return;

    const path = location.pathname;

    // Allow dashboard routes and allowed shared routes
    const isAllowed =
      path.startsWith("/dashboard") ||
      allowedProviderRoutes.some((r) => path === r || path.startsWith(r + "/"));


    if (!isAllowed) {
      navigate(dashboardPath, { replace: true });
    }
  }, [isProvider, isVisitorMode, dashboardPath, location.pathname, location.search, navigate]);

  // Every /dashboard/* route is gated here, once, rather than per page.
  return <DashboardGate>{children}</DashboardGate>;
};

export default RouteGuard;