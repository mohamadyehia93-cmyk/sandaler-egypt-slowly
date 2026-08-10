import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Server-verified admin check. Reads the user's own row from user_roles
 * (RLS restricts the read to auth.uid()), never localStorage.
 */
export const useIsAdmin = () => {
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  return {
    isAdmin: !!data,
    // never keep spinning when signed out — the query is simply disabled
    loading: authLoading || (!!user && isLoading),
    user,
  };
};
