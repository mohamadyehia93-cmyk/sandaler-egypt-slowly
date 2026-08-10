import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

/**
 * Real identity for the dashboard headers.
 *
 * Resolves the signed-in user's own `providers` row first (bilingual business
 * name + avatar) and falls back to `profiles`. Never returns a hardcoded
 * persona — if nothing is stored yet the caller gets an empty name and should
 * render a neutral label instead.
 */
export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export function useDashboardIdentity() {
  const { user } = useAuth();
  const { lang } = useI18n();

  const { data } = useQuery({
    queryKey: ["dashboard-identity", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: provider }, { data: profile }] = await Promise.all([
        supabase
          .from("providers")
          .select("id, name_en, name_ar, avatar, city_en, city_ar, region_en, region_ar")
          .eq("user_id", user!.id)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", user!.id)
          .maybeSingle(),
      ]);
      return { provider, profile };
    },
  });

  const provider = data?.provider ?? null;
  const profile = data?.profile ?? null;

  const name =
    (lang === "ar" ? provider?.name_ar : provider?.name_en) ||
    provider?.name_en ||
    profile?.display_name ||
    "";

  return {
    providerId: provider?.id ?? null,
    name,
    avatar: provider?.avatar || profile?.avatar_url || null,
    initials: name ? initialsOf(name) : "",
    location: (lang === "ar" ? provider?.city_ar || provider?.region_ar : provider?.city_en || provider?.region_en) || "",
  };
}
