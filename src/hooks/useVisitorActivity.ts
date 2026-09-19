import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * One unified, read-only view of everything the signed-in visitor has started:
 * bookings, orders, reservation requests (stays / rides), event tickets,
 * session requests, pledges, volunteer applications and commissions.
 *
 * Every field comes from a real row. Nothing here is fabricated: when a source
 * has no rows, the unified list simply has fewer items.
 */
export type ActivityKind =
  | "booking"
  | "order"
  | "reservation"
  | "ticket"
  | "session"
  | "pledge"
  | "application"
  | "commission";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  title_en: string;
  title_ar: string;
  image: string | null;
  status: string;
  created_at: string;
  /** The date the thing actually happens, when the row carries one. */
  date: string | null;
  /** Amount in EGP when the row records one. */
  amount: number | null;
  note_en?: string | null;
  note_ar?: string | null;
  /** Where tapping the card goes. */
  path: string | null;
};

const OPEN_STATUSES = ["pending", "pending_payment", "requested", "accepted", "confirmed", "paid"];
const DEAD_STATUSES = ["cancelled", "declined", "expired", "refunded", "rejected", "withdrawn"];

export const isOpenStatus = (s: string) => OPEN_STATUSES.includes(s);
export const isDeadStatus = (s: string) => DEAD_STATUSES.includes(s);

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Upcoming = happens today or later and not cancelled/declined. */
export const isUpcoming = (item: ActivityItem) => {
  if (isDeadStatus(item.status)) return false;
  if (!item.date) return false;
  return new Date(item.date) >= startOfToday();
};

/** Waiting = no date yet (or date passed) but the request is still open. */
export const isWaiting = (item: ActivityItem) => !isUpcoming(item) && isOpenStatus(item.status) && !item.date;

export const RESERVATION_ITEM_PATH: Record<string, string> = {
  accommodation: "/accommodation",
  transport: "/transport",
  experience: "/experience",
  trip: "/trip",
};

export function useVisitorActivity() {
  const { user } = useAuth();
  const uid = user?.id;

  return useQuery({
    queryKey: ["visitor-activity", uid],
    enabled: !!uid,
    queryFn: async (): Promise<ActivityItem[]> => {
      const [bookings, orders, reservations, tickets, sessions, pledges, applications, commissions] =
        await Promise.all([
          supabase
            .from("bookings")
            .select(
              "id, guests, total_amount_egp, status, payment_status, created_at, experience:experiences(id, slug, title_en, title_ar, image), slot:experience_slots(slot_date)",
            )
            .eq("visitor_id", uid!)
            .order("created_at", { ascending: false }),
          supabase
            .from("orders")
            .select(
              "id, quantity, total_egp, status, created_at, product:products(id, slug, name_en, name_ar, image)",
            )
            .eq("buyer_id", uid!)
            .order("created_at", { ascending: false }),
          supabase
            .from("reservation_requests")
            .select("id, item_type, item_id, guests, start_date, end_date, status, created_at")
            .eq("requester_id", uid!)
            .order("created_at", { ascending: false }),
          supabase
            .from("event_tickets")
            .select(
              "id, quantity, total_egp, status, created_at, event:events(id, slug, title_en, title_ar, image, start_date)",
            )
            .eq("user_id", uid!)
            .order("created_at", { ascending: false }),
          supabase
            .from("session_requests")
            .select(
              "id, preferred_date, status, created_at, meetup:meetups(id, slug, title_en, title_ar, image)",
            )
            .eq("requester_id", uid!)
            .order("created_at", { ascending: false }),
          supabase
            .from("support_pledges")
            .select(
              "id, kind, amount, currency, status, created_at, cause:causes(id, slug, title_en, title_ar, image)",
            )
            .eq("supporter_id", uid!)
            .order("created_at", { ascending: false }),
          supabase
            .from("volunteer_applications")
            .select(
              "id, status, created_at, program:programs(id, slug, title_en, title_ar, image), cause:causes(id, slug, title_en, title_ar, image)",
            )
            .eq("applicant_id", uid!)
            .order("created_at", { ascending: false }),
          supabase
            .from("commissions")
            .select("id, title, kind, status, deadline, proposed_fee, created_at")
            .eq("commissioner_id", uid!)
            .order("created_at", { ascending: false }),
        ]);

      const items: ActivityItem[] = [];

      for (const b of bookings.data || []) {
        const exp = b.experience as { slug: string | null; id: string; title_en: string; title_ar: string; image: string | null } | null;
        items.push({
          id: b.id,
          kind: "booking",
          title_en: exp?.title_en || "Experience",
          title_ar: exp?.title_ar || exp?.title_en || "تجربة",
          image: exp?.image ?? null,
          status: b.status,
          created_at: b.created_at,
          date: (b.slot as { slot_date: string } | null)?.slot_date ?? null,
          amount: b.total_amount_egp,
          note_en: `${b.guests} guests`,
          note_ar: `${b.guests} أشخاص`,
          path: exp ? `/experience/${exp.slug || exp.id}` : null,
        });
      }

      for (const o of orders.data || []) {
        const p = o.product as { slug: string | null; id: string; name_en: string; name_ar: string; image: string | null } | null;
        items.push({
          id: o.id,
          kind: "order",
          title_en: p?.name_en || "Product",
          title_ar: p?.name_ar || p?.name_en || "منتج",
          image: p?.image ?? null,
          status: o.status,
          created_at: o.created_at,
          date: null,
          amount: o.total_egp === null ? null : Number(o.total_egp),
          note_en: `${o.quantity} item(s)`,
          note_ar: `${o.quantity} قطعة`,
          path: p ? `/product/${p.slug || p.id}` : null,
        });
      }

      for (const r of reservations.data || []) {
        const kindEn: Record<string, string> = {
          accommodation: "Stay request",
          transport: "Ride request",
          experience: "Experience request",
          trip: "Trip request",
        };
        const kindAr: Record<string, string> = {
          accommodation: "طلب إقامة",
          transport: "طلب مواصلات",
          experience: "طلب تجربة",
          trip: "طلب رحلة",
        };
        const base = RESERVATION_ITEM_PATH[r.item_type];
        items.push({
          id: r.id,
          kind: "reservation",
          title_en: kindEn[r.item_type] || "Request",
          title_ar: kindAr[r.item_type] || "طلب",
          image: null,
          status: r.status,
          created_at: r.created_at,
          date: r.start_date,
          amount: null,
          note_en: r.guests ? `${r.guests} guests` : null,
          note_ar: r.guests ? `${r.guests} أشخاص` : null,
          path: base ? `${base}/${r.item_id}` : null,
        });
      }

      for (const t of tickets.data || []) {
        const e = t.event as { slug: string | null; id: string; title_en: string; title_ar: string; image: string | null; start_date: string } | null;
        items.push({
          id: t.id,
          kind: "ticket",
          title_en: e?.title_en || "Event",
          title_ar: e?.title_ar || e?.title_en || "حدث",
          image: e?.image ?? null,
          status: t.status,
          created_at: t.created_at,
          date: e?.start_date ?? null,
          amount: t.total_egp,
          note_en: `${t.quantity} ticket(s)`,
          note_ar: `${t.quantity} تذكرة`,
          path: `/ticket/${t.id}`,
        });
      }

      for (const s of sessions.data || []) {
        const m = s.meetup as { slug: string | null; id: string; title_en: string; title_ar: string; image: string | null } | null;
        items.push({
          id: s.id,
          kind: "session",
          title_en: m?.title_en || "Session",
          title_ar: m?.title_ar || m?.title_en || "جلسة",
          image: m?.image ?? null,
          status: s.status,
          created_at: s.created_at,
          date: s.preferred_date || null,
          amount: null,
          path: m ? `/meetup/${m.slug || m.id}` : null,
        });
      }

      for (const p of pledges.data || []) {
        const c = p.cause as { slug: string | null; id: string; title_en: string; title_ar: string; image: string | null } | null;
        items.push({
          id: p.id,
          kind: "pledge",
          title_en: c?.title_en || "Cause",
          title_ar: c?.title_ar || c?.title_en || "قضية",
          image: c?.image ?? null,
          status: p.status,
          created_at: p.created_at,
          date: null,
          amount: p.amount === null ? null : Number(p.amount),
          note_en: p.kind,
          note_ar: p.kind,
          path: c ? `/cause/${c.slug || c.id}` : null,
        });
      }

      for (const a of applications.data || []) {
        const target = (a.program || a.cause) as
          | { slug: string | null; id: string; title_en: string; title_ar: string; image: string | null }
          | null;
        items.push({
          id: a.id,
          kind: "application",
          title_en: target?.title_en || "Volunteering",
          title_ar: target?.title_ar || target?.title_en || "تطوع",
          image: target?.image ?? null,
          status: a.status,
          created_at: a.created_at,
          date: null,
          amount: null,
          path: target ? (a.program ? `/program/${target.slug || target.id}` : `/cause/${target.slug || target.id}`) : null,
        });
      }

      for (const c of commissions.data || []) {
        items.push({
          id: c.id,
          kind: "commission",
          title_en: c.title,
          title_ar: c.title,
          image: null,
          status: c.status,
          created_at: c.created_at,
          date: c.deadline,
          amount: c.proposed_fee === null ? null : Number(c.proposed_fee),
          note_en: c.kind,
          note_ar: c.kind,
          path: "/commissions",
        });
      }

      return items;
    },
  });
}
