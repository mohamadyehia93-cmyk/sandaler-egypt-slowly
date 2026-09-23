import { Compass, MapPin, CalendarCheck, Headphones, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * ONE navigation system. The five tabs follow the visitor's journey:
 * inspired by a story -> explore places -> plan -> be there -> you.
 */
export type NavTab = {
  key: string;
  path: string;
  icon: LucideIcon;
  label: { en: string; ar: string };
  /** Extra path prefixes that keep this tab highlighted. */
  match?: string[];
};

export const NAV_TABS: NavTab[] = [
  {
    key: "discover",
    path: "/",
    icon: Compass,
    label: { en: "Discover", ar: "اكتشف" },
    match: ["/posts", "/post/", "/experience/", "/trip/", "/trips", "/stay/", "/transport/", "/product/", "/event/", "/calendar", "/collections", "/collection/", "/causes", "/cause/", "/program/", "/people", "/person/", "/culture-actor/", "/provider/", "/organization/", "/partner/", "/community", "/statuses", "/search"],
  },
  {
    key: "places",
    path: "/places",
    icon: MapPin,
    label: { en: "Places", ar: "الأماكن" },
    match: ["/places", "/region/", "/regions/", "/city/"],
  },
  {
    key: "plan",
    path: "/plan",
    icon: CalendarCheck,
    label: { en: "Plan", ar: "خطّط" },
    match: ["/plan", "/planner", "/wishlists", "/bookings", "/orders", "/tickets", "/session-requests", "/sessions", "/pledges", "/applications", "/commissions", "/profile/dashboard", "/profile/activity"],
  },
  {
    key: "listen",
    path: "/audio-tours",
    icon: Headphones,
    label: { en: "Listen", ar: "استمع" },
    match: ["/audio-tours", "/audio-tour/"],
  },
  {
    key: "profile",
    path: "/profile",
    icon: User,
    label: { en: "Profile", ar: "حسابي" },
    match: ["/profile", "/edit-profile", "/inbox", "/visitor/", "/dashboard", "/admin", "/switch-role", "/about", "/credits"],
  },
];

/**
 * The single place that decides whether the bar shows. Immersive and focused
 * flows hide it; everything else keeps it. Ordered longest-first is not needed —
 * these are prefix/segment tests evaluated against the full pathname.
 */
const HIDDEN_PREFIXES = [
  // auth + onboarding
  "/login",
  "/signup",
  "/welcome",
  "/forgot-password",
  "/reset-password",
  "/claim/",
  "/.lovable/",
  // checkout / booking steps
  "/booking",
  "/event-ticket/",
  "/flag-issue",
  // create / edit wizards
  "/dashboard/culture-actor/new-",
  "/dashboard/culture-actor/edit-",
  "/dashboard/service-provider/new-",
  "/dashboard/service-provider/edit-",
  "/dashboard/whos-who/new-",
  "/dashboard/organization/new-",
  "/dashboard/organization/edit-",
  "/dashboard/product-seller/new-",
  "/dashboard/product-seller/edit-",
  "/dashboard/trip-organizer/new-",
  "/dashboard/trip-organizer/edit-",
  "/dashboard/new-event",
  "/admin/editorial/",
  "/status",
];

/** Booking-like sub-flows: /cause/:id/donate, /program/:id/volunteer, /event/:id/tickets */
const FOCUSED_SUFFIXES = ["/donate", "/volunteer", "/consult", "/gift", "/tickets", "/slots"];

/**
 * Segment-aware prefix test: "/booking" must not swallow "/bookings", while
 * wizard entries ending in "-" or "/" stay raw prefixes on purpose.
 */
const matchesPrefix = (path: string, entry: string) => {
  if (entry.endsWith("-") || entry.endsWith("/")) return path.startsWith(entry);
  return path === entry || path.startsWith(entry + "/");
};

export const showsBottomNav = (pathname: string): boolean => {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (HIDDEN_PREFIXES.some((p) => matchesPrefix(path, p))) return false;
  if (FOCUSED_SUFFIXES.some((s) => path.endsWith(s))) return false;
  // a single chat conversation opened as its own route
  if (/^\/inbox\/[^/]+$/.test(path)) return false;
  return true;
};

export const activeTabKey = (pathname: string): string => {
  const path = pathname;
  if (path === "/") return "discover";
  const scored = NAV_TABS.map((t) => {
    const hits = [t.path, ...(t.match ?? [])].filter((m) => m !== "/" && path.startsWith(m));
    const best = hits.sort((a, b) => b.length - a.length)[0];
    return { key: t.key, len: best ? best.length : 0 };
  }).sort((a, b) => b.len - a.len)[0];
  return scored && scored.len > 0 ? scored.key : "discover";
};
