import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

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
  "/dashboard",
  "/admin",
  "/booking",
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
  }, [isProvider, isVisitorMode, dashboardPath, location.pathname, navigate]);

  return <>{children}</>;
};

export default RouteGuard;