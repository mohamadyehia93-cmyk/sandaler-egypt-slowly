import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Sandal has six roles. `subject-expert` and `narrator` were merged into
 * `culture-actor` (one place to publish articles, audio tours and collections)
 * and `ambassador` became an admin-granted capability in `user_roles`, not a
 * role. Legacy strings are simply not recognised any more: a provider row that
 * still held one would resolve to "visitor" rather than break — the accounts
 * themselves were migrated.
 *
 * `whos-who` is INVITATION-ONLY and deliberately absent from public onboarding
 * (Splash.tsx renders PROVIDER_INTENTS, which has no whos-who statement).
 * Sandal curates the directory: an admin creates or adopts the profile in
 * /admin → Assisted signup and hands the person a claim link. Being listed is a
 * recognition, not a signup — do NOT add it back to the onboarding role cards.
 */

export type LocalRole =
  | "culture-actor"
  | "service-provider"
  | "whos-who"
  | "organization"
  | "product-seller"
  | "trip-organizer";

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
  "product-seller": "/dashboard/product-seller",
  "trip-organizer": "/dashboard/trip-organizer",
};

export const roleLabels: Record<UserRole, { en: string; ar: string }> = {
  visitor: { en: "Visitor", ar: "زائر" },
  "culture-actor": { en: "Culture Actor", ar: "فاعل ثقافي" },
  "service-provider": { en: "Service Provider", ar: "مقدم خدمة" },
  "whos-who": { en: "Who's Who", ar: "شخصية بارزة" },
  organization: { en: "Organization", ar: "مؤسسة" },
  "product-seller": { en: "Product Seller", ar: "بائع منتجات" },
  "trip-organizer": { en: "Trip Organizer", ar: "منظم رحلات" },
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