import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { recordRoute } from "@/lib/diagnostics";

/** Records every route change into the diagnostics buffer. */
const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    recordRoute(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
};

export default RouteTracker;
