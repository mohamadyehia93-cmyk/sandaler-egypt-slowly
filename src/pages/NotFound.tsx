import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import NotFoundView from "@/components/NotFound";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return <NotFoundView context="generic" />;
};

export default NotFound;
