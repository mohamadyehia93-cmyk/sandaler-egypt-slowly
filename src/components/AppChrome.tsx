import { useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { showsBottomNav } from "@/lib/nav/tabs";

/**
 * Mounts the one navigation bar app-wide. Pages never render it themselves,
 * so there is a single allowlist/denylist (see src/lib/nav/tabs.ts).
 * The spacer keeps page content clear of the bar and the iOS safe area.
 */
const AppChrome = () => {
  const { pathname } = useLocation();
  if (!showsBottomNav(pathname)) return null;
  return (
    <>
      <div aria-hidden="true" className="h-[68px] safe-bottom" />
      <BottomNav />
    </>
  );
};

export default AppChrome;
