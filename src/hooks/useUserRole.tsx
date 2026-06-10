import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type LocalRole =
  | "culture-actor"
  | "service-provider"
  | "whos-who"
  | "organization"
  | "ambassador"
  | "product-seller"
  | "trip-organizer"
  | "subject-expert";

export type UserRole = "visitor" | LocalRole;

interface UserRoleContextType {
  role: UserRole;
  isProvider: boolean;
  isVisitorMode: boolean;
  setRole: (role: UserRole) => void;
  toggleVisitorMode: () => void;
  enterVisitorMode: () => void;
  exitVisitorMode: () => void;
  dashboardPath: string | null;
}

const roleDashboardPaths: Record<LocalRole, string> = {
  "culture-actor": "/dashboard/culture-actor",
  "service-provider": "/dashboard/service-provider",
  "whos-who": "/dashboard/whos-who",
  "organization": "/dashboard/organization",
  "ambassador": "/dashboard/ambassador",
  "product-seller": "/dashboard/product-seller",
  "trip-organizer": "/dashboard/trip-organizer",
  "subject-expert": "/dashboard/subject-expert",
};

export const roleLabels: Record<UserRole, { en: string; ar: string }> = {
  visitor: { en: "Visitor", ar: "زائر" },
  "culture-actor": { en: "Culture Actor", ar: "فاعل ثقافي" },
  "service-provider": { en: "Service Provider", ar: "مقدم خدمة" },
  "whos-who": { en: "Who's Who", ar: "شخصية بارزة" },
  organization: { en: "Organization", ar: "مؤسسة" },
  ambassador: { en: "Ambassador", ar: "سفير" },
  "product-seller": { en: "Product Seller", ar: "بائع منتجات" },
  "trip-organizer": { en: "Trip Organizer", ar: "منظم رحلات" },
  "subject-expert": { en: "Subject Expert", ar: "خبير متخصص" },
};

const UserRoleContext = createContext<UserRoleContextType | null>(null);

const VALID_LOCAL_ROLES = Object.keys(roleDashboardPaths) as LocalRole[];

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [role, setRoleState] = useState<UserRole>("visitor");
  const [visitorMode, setVisitorMode] = useState(
    () => localStorage.getItem("sandal-visitor-mode") === "true"
  );

  // Source of truth for the user's role is the server (providers table),
  // verified against the authenticated user id. localStorage is never trusted
  // as an authorization gate — it only holds the visitor-mode UI preference.
  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setRoleState("visitor");
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      const dbRole = data?.role as LocalRole | undefined;
      if (!error && dbRole && VALID_LOCAL_ROLES.includes(dbRole)) {
        setRoleState(dbRole);
      } else {
        setRoleState("visitor");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const isProvider = role !== "visitor";
  const isVisitorMode = isProvider && visitorMode;

  // Role can no longer be set from the client as an authorization source;
  // it is derived from the server. This setter only handles the visitor reset.
  const setRole = useCallback((newRole: UserRole) => {
    if (newRole === "visitor") {
      setVisitorMode(false);
      localStorage.removeItem("sandal-visitor-mode");
    }
  }, []);


  const enterVisitorMode = useCallback(() => {
    setVisitorMode(true);
    localStorage.setItem("sandal-visitor-mode", "true");
  }, []);

  const exitVisitorMode = useCallback(() => {
    setVisitorMode(false);
    localStorage.setItem("sandal-visitor-mode", "false");
  }, []);

  const toggleVisitorMode = useCallback(() => {
    if (visitorMode) exitVisitorMode();
    else enterVisitorMode();
  }, [visitorMode, enterVisitorMode, exitVisitorMode]);

  const dashboardPath = isProvider ? roleDashboardPaths[role as LocalRole] : null;

  return (
    <UserRoleContext.Provider
      value={{ role, isProvider, isVisitorMode, setRole, toggleVisitorMode, enterVisitorMode, exitVisitorMode, dashboardPath }}
    >
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => {
  const ctx = useContext(UserRoleContext);
  if (!ctx) throw new Error("useUserRole must be used within UserRoleProvider");
  return ctx;
};

export { roleDashboardPaths };