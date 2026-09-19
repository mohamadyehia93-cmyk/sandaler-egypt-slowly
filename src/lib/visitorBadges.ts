import type { VisitorStats } from "@/hooks/useVisitorStats";

/**
 * Badges are DERIVED, never stored. Each one is a predicate over the visitor's
 * real counts, so a badge can never drift away from what actually happened on
 * the account. A badge with a progress bar must expose a real numerator.
 */
export type VisitorBadge = {
  key: string;
  emoji: string;
  name: { en: string; ar: string };
  /** What unlocks it — shown while locked, so a locked badge reads as a nudge. */
  unlock: { en: string; ar: string };
  earned: boolean;
  /** Only present when both numbers are real counts. */
  progress?: { current: number; target: number };
};

export function computeBadges(s: VisitorStats): VisitorBadge[] {
  return [
    {
      key: "first-step",
      emoji: "🪶",
      name: { en: "First step", ar: "أول خطوة" },
      unlock: { en: "Add a photo and a short bio", ar: "أضف صورة ونبذة قصيرة" },
      earned: s.profile.hasAvatar && s.profile.hasBio,
      progress: {
        current: (s.profile.hasAvatar ? 1 : 0) + (s.profile.hasBio ? 1 : 0),
        target: 2,
      },
    },
    {
      key: "first-request",
      emoji: "✉️",
      name: { en: "First request", ar: "أول طلب" },
      unlock: {
        en: "Send your first booking, order or stay request",
        ar: "أرسل أول حجز أو طلب لديك",
      },
      earned: s.requests >= 1,
    },
    {
      key: "explorer",
      emoji: "🧭",
      name: { en: "Explorer", ar: "مستكشف" },
      unlock: { en: "Save 5 things you like", ar: "احفظ ٥ أشياء تعجبك" },
      earned: s.wishlist >= 5,
      progress: { current: Math.min(s.wishlist, 5), target: 5 },
    },
    {
      key: "voice",
      emoji: "🗣️",
      name: { en: "Voice", ar: "صوت" },
      unlock: {
        en: "Write a review, a post or a comment",
        ar: "اكتب تقييماً أو منشوراً أو تعليقاً",
      },
      earned: s.reviews + s.posts + s.comments >= 1,
    },
    {
      key: "supporter",
      emoji: "🤲",
      name: { en: "Supporter", ar: "داعم" },
      unlock: {
        en: "Support a local cause, or apply to volunteer",
        ar: "ادعم قضية محلية أو تقدّم للتطوع",
      },
      earned: s.support >= 1,
    },
    {
      key: "traveller",
      emoji: "🧳",
      name: { en: "Traveller", ar: "رحّالة" },
      unlock: {
        en: "Complete a booking or an order",
        ar: "أكمل حجزاً أو طلب شراء",
      },
      earned: s.confirmed >= 1,
    },
    {
      key: "connector",
      emoji: "🫱",
      name: { en: "Connector", ar: "متابِع" },
      unlock: { en: "Follow 3 people or hosts", ar: "تابع ٣ أشخاص أو مضيفين" },
      earned: s.following >= 3,
      progress: { current: Math.min(s.following, 3), target: 3 },
    },
    {
      key: "planner",
      emoji: "🗺️",
      name: { en: "Planner", ar: "مخطِّط" },
      unlock: { en: "Save a plan from the planner", ar: "احفظ خطة من المخطط" },
      earned: s.itineraries >= 1,
    },
  ];
}

/** The single most useful real next action, or null when nothing is pending. */
export function nextAction(badges: VisitorBadge[]): VisitorBadge | null {
  return badges.find((b) => !b.earned) ?? null;
}
