import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { showsBottomNav } from "@/lib/nav/tabs";
import { useIsImmersive } from "@/lib/nav/immersive";

/**
 * Mounts the one navigation bar app-wide. Pages never render it themselves,
 * so there is a single allowlist/denylist (see src/lib/nav/tabs.ts).
 * The body class adds bottom padding (plus the iOS safe area) so nothing
 * ever sits behind the bar.
 */
const AppChrome = () => {
  const { pathname } = useLocation();
  const immersive = useIsImmersive();
  const visible = showsBottomNav(pathname) && !immersive;

  useEffect(() => {
    document.body.classList.toggle("has-bottom-nav", visible);
    return () => document.body.classList.remove("has-bottom-nav");
  }, [visible]);

  if (!visible) return null;
  return <BottomNav />;
};

export default AppChrome;
