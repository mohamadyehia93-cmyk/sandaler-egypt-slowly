import { Home, Car, Compass, Palette, Map, Pen, Building2 } from "lucide-react";
import type { LocalRole } from "@/hooks/useUserRole";

/**
 * PLAIN-LANGUAGE ROLE SELECTION.
 *
 * The stored role values in `providers.role` are unchanged — this module is
 * presentation only. A carpenter in Damietta cannot place himself in a list
 * that says "culture actor" or "Who's Who", so onboarding now asks a
 * first-person question in everyday Egyptian Arabic and maps the answer onto
 * the existing roles underneath.
 *
 * Three statements (host, driver, guide) all resolve to `service-provider`,
 * which previously hid hosts and drivers entirely. The chosen intent is carried
 * through onboarding so the role questions match what the person said and the
 * dashboard opens on the section they actually need.
 */
export type ProviderIntentKey =
  | "host"
  | "drive"
  | "guide"
  | "make"
  | "organise"
  | "tell"
  | "represent";

export type ProviderIntent = {
  key: ProviderIntentKey;
  role: LocalRole;
  icon: typeof Home;
  /** First-person statement shown on the card. */
  statement: { en: string; ar: string };
  /** Second line: what they will be able to do. */
  sub: { en: string; ar: string };
  /** Which question set in `roleQuestions` to ask. */
  questions: string;
  /** Where their dashboard should open after signup. */
  landing: string;
};

export const PROVIDER_INTENTS: ProviderIntent[] = [
  {
    key: "host",
    role: "service-provider",
    icon: Home,
    statement: { en: "I host guests in my home", ar: "أستقبل ضيوف في بيتي" },
    sub: {
      en: "Add your rooms or guesthouse and take stay requests",
      ar: "تضيف غرفك أو بيت الضيافة وتستقبل طلبات إقامة",
    },
    questions: "intent-host",
    landing: "/dashboard/service-provider/my-stays",
  },
  {
    key: "drive",
    role: "service-provider",
    icon: Car,
    statement: { en: "I drive people", ar: "أوصّل الناس بعربيتي" },
    sub: {
      en: "Offer rides and transfers and take booking requests",
      ar: "تعرض توصيل ورحلات داخلية وتستقبل طلبات",
    },
    questions: "intent-drive",
    landing: "/dashboard/service-provider/my-rides",
  },
  {
    key: "guide",
    role: "service-provider",
    icon: Compass,
    statement: { en: "I show visitors around my town", ar: "أرافق الزوار وأعرّفهم على بلدي" },
    sub: {
      en: "Publish experiences, set your times and prices",
      ar: "تنشر تجارب وتحدد مواعيدك وأسعارك",
    },
    questions: "service-provider",
    landing: "/dashboard/service-provider/my-listings",
  },
  {
    key: "make",
    role: "product-seller",
    icon: Palette,
    statement: { en: "I make and sell things by hand", ar: "أصنع وأبيع شغل يدوي" },
    sub: {
      en: "Put your work in the shop and receive orders",
      ar: "تعرض شغلك في المتجر وتستقبل أوردرات",
    },
    questions: "product-seller",
    landing: "/dashboard/product-seller",
  },
  {
    key: "organise",
    role: "trip-organizer",
    icon: Map,
    statement: { en: "I organise trips and events", ar: "أنظّم رحلات وفعاليات" },
    sub: {
      en: "Publish trips and events and manage who joins",
      ar: "تنشر رحلات وفعاليات وتدير الحاضرين",
    },
    questions: "trip-organizer",
    landing: "/dashboard/trip-organizer",
  },
  {
    key: "tell",
    role: "culture-actor",
    icon: Pen,
    statement: { en: "I tell and write about my town", ar: "أحكي وأكتب عن بلدي" },
    sub: {
      en: "Write articles, record audio tours, curate collections",
      ar: "تكتب مقالات وتسجّل جولات صوتية وتجمع مجموعات",
    },
    questions: "culture-actor",
    landing: "/dashboard/culture-actor",
  },
  {
    key: "represent",
    role: "organization",
    icon: Building2,
    statement: { en: "I represent an association or initiative", ar: "أمثّل جمعية أو مبادرة" },
    sub: {
      en: "Publish programmes and causes, find volunteers and support",
      ar: "تنشر برامج وقضايا وتلاقي متطوعين ودعم",
    },
    questions: "organization",
    landing: "/dashboard/organization",
  },
];

export const getProviderIntent = (key: string | null | undefined): ProviderIntent | null =>
  PROVIDER_INTENTS.find((i) => i.key === key) ?? null;

/** Remembered so a returning provider's dashboard opens on the right section. */
const INTENT_KEY = "sandal-provider-intent";

export const rememberProviderIntent = (key: ProviderIntentKey) => {
  try {
    localStorage.setItem(INTENT_KEY, key);
  } catch {
    // private mode: the dashboard simply opens on its default section
  }
};

export const recallProviderIntent = (): ProviderIntent | null => {
  try {
    return getProviderIntent(localStorage.getItem(INTENT_KEY));
  } catch {
    return null;
  }
};
