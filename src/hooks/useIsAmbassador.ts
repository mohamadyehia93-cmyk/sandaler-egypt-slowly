import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Server-verified ambassador capability check.
 *
 * Ambassador is no longer a provider role — it is a capability an admin grants
 * in `user_roles`, exactly like `admin`. Any account can hold it, whatever its
 * provider role, and it unlocks flag reporting. RLS restricts the read to
 * auth.uid(), so this cannot be faked from the client.
 */
export const useIsAmbassador = () => {
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["is-ambassador", user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "ambassador")
        .maybeSingle();
      return !!data;
    },
  });

  return {
    isAmbassador: !!data,
    loading: authLoading || (!!user && isLoading),
    user,
  };
};
