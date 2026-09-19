import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Every number a visitor sees about themselves comes from here, and every one of
 * them is a real count of their own rows. Nothing on this path is estimated,
 * seeded or hardcoded — if a query can't back a number, the caller drops the tile.
 */
export type VisitorStats = {
  reviews: number;
  itineraries: number;
  wishlist: number;
  followers: number;
  following: number;
  /** Any request the visitor has initiated (booking, order, stay/ride, session, ticket). */
  requests: number;
  /** Requests that actually went through (paid booking or confirmed order). */
  confirmed: number;
  /** Donations / volunteer applications recorded on the account. */
  support: number;
  posts: number;
  comments: number;
  profile: {
    hasAvatar: boolean;
    hasBio: boolean;
    hasPlaces: boolean;
  };
};

const countOf = async (
  table: string,
  column: string,
  userId: string,
): Promise<number> => {
  const { count, error } = await supabase
    .from(table as never)
    .select("id", { count: "exact", head: true })
    .eq(column, userId);
  if (error) return 0;
  return count ?? 0;
};

export function useVisitorStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["visitor-stats", user?.id ?? null],
    enabled: !!user,
    queryFn: async (): Promise<VisitorStats> => {
      const uid = user!.id;

      const [
        reviews,
        itineraries,
        wishlist,
        following,
        orders,
        reservations,
        sessionRequests,
        tickets,
        pledges,
        applications,
        posts,
        comments,
      ] = await Promise.all([
        countOf("experience_reviews", "user_id", uid),
        countOf("saved_itineraries", "user_id", uid),
        countOf("wishlists", "user_id", uid),
        countOf("follows", "user_id", uid),
        countOf("orders", "buyer_id", uid),
        countOf("reservation_requests", "requester_id", uid),
        countOf("session_requests", "requester_id", uid),
        countOf("event_tickets", "user_id", uid),
        countOf("support_pledges", "supporter_id", uid),
        countOf("volunteer_applications", "applicant_id", uid),
        countOf("community_posts", "author_id", uid),
        countOf("post_comments", "user_id", uid),
      ]);

      // `interests` and `cities` carry no client SELECT grant on purpose, so the
      // caller's own preferences come back through get_my_preferences() instead.
      const [
        { data: followerCount },
        { data: bookingRows },
        { data: orderRows },
        { data: profileRow },
        { data: prefRows },
      ] = await Promise.all([
        supabase.rpc("get_follower_count", { _target_type: "visitor", _target_id: uid }),
        supabase.from("bookings").select("id, status, payment_status").eq("visitor_id", uid),
        supabase.from("orders").select("id, status").eq("buyer_id", uid),
        supabase.from("profiles").select("bio, avatar_url").eq("user_id", uid).maybeSingle(),
        supabase.rpc("get_my_preferences"),
      ]);
      const prefs = Array.isArray(prefRows) ? prefRows[0] : prefRows;

      const bookings = bookingRows ?? [];
      const paidBookings = bookings.filter(
        (b) => b.payment_status === "paid" || b.status === "confirmed" || b.status === "paid",
      ).length;
      const confirmedOrders = (orderRows ?? []).filter((o) =>
        ["confirmed", "completed", "shipped", "delivered"].includes(String(o.status)),
      ).length;

      return {
        reviews,
        itineraries,
        wishlist,
        followers: Number(followerCount ?? 0),
        following,
        requests: bookings.length + orders + reservations + sessionRequests + tickets,
        confirmed: paidBookings + confirmedOrders,
        support: pledges + applications,
        posts,
        comments,
        profile: {
          hasAvatar: !!profileRow?.avatar_url,
          hasBio: !!profileRow?.bio?.trim(),
          hasPlaces: (prefs?.cities?.length ?? 0) > 0 || (prefs?.interests?.length ?? 0) > 0,
        },
      };
    },
  });
}
