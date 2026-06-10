import { supabase } from "@/integrations/supabase/client";
import type { LocalRole } from "@/hooks/useUserRole";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48) || "provider";

/**
 * Creates (or updates) the current user's provider profile so that the
 * server-derived role in `useUserRole` resolves to the chosen provider role.
 *
 * The `providers` table is the single source of truth for a user's role,
 * guarded by RLS (`auth.uid() = user_id`). A partial unique index on
 * `user_id` lets us upsert safely so a user has exactly one profile.
 */
export async function becomeProvider(role: LocalRole): Promise<{ error: string | null }> {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { error: "not-authenticated" };

  // Resolve a display name for the required name_en / name_ar columns.
  let displayName: string | null = null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();
  displayName =
    profile?.display_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    (user.email ? user.email.split("@")[0] : null) ||
    "Provider";

  const slug = `${slugify(displayName)}-${user.id.slice(0, 6)}`;

  const { error } = await supabase
    .from("providers")
    .upsert(
      {
        user_id: user.id,
        role,
        name_en: displayName,
        name_ar: displayName,
        slug,
        status: "published",
      },
      { onConflict: "user_id" }
    );

  return { error: error?.message ?? null };
}
