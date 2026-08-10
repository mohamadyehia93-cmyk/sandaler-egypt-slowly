import { supabase } from "@/integrations/supabase/client";

/**
 * Ownership convention (platform-wide):
 *   listing owner columns (experiences.provider_id, accommodations.host_id,
 *   transport.provider_id, trips.organizer_id, products.seller_id)
 *   hold `providers.id` — the provider RECORD id, not the auth user id.
 *
 * Only `bookings.provider_id` holds an auth user id, because it has a FK to
 * auth.users; the booking flow resolves `providers.user_id` when writing it.
 *
 * Use this helper anywhere the signed-in user's listings are read or written.
 */
export async function fetchMyProviderId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}
