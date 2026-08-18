import { Gift, HandHeart, MessageCircle, UserCheck } from "lucide-react";

export type ProgramActionKey = "volunteer" | "consult" | "donate" | "gift";

/**
 * The four ways a visitor can engage with a program. `submits` marks the two
 * actions that write a real row (volunteer_applications, which supports
 * program_id server-side). Donate and gift have no payment path yet, so their
 * pages say so instead of faking a confirmation.
 */
export const programActions = [
  {
    key: "volunteer" as ProgramActionKey,
    icon: UserCheck,
    color: "bg-blue-500/10 text-blue-600",
    submits: true,
    label: { en: "Volunteer", ar: "تطوّع" },
    desc: { en: "Give your time and skills to this program", ar: "قدّم وقتك ومهاراتك لهذا البرنامج" },
  },
  {
    key: "consult" as ProgramActionKey,
    icon: MessageCircle,
    color: "bg-purple-500/10 text-purple-600",
    submits: true,
    label: { en: "Consult", ar: "استشارة" },
    desc: { en: "Offer professional expertise and guidance", ar: "قدّم خبرتك المهنية وإرشاداتك" },
  },
  {
    key: "donate" as ProgramActionKey,
    icon: HandHeart,
    color: "bg-emerald-500/10 text-emerald-600",
    submits: false,
    label: { en: "Donate", ar: "تبرّع" },
    desc: { en: "Financial contribution to the program", ar: "مساهمة مالية في البرنامج" },
  },
  {
    key: "gift" as ProgramActionKey,
    icon: Gift,
    color: "bg-amber-500/10 text-amber-600",
    submits: false,
    label: { en: "Send a Gift", ar: "أرسل هدية" },
    desc: { en: "Support with in-kind gifts and supplies", ar: "ادعم بهدايا ومستلزمات عينية" },
  },
];

export const findProgramAction = (key: string | undefined) =>
  programActions.find((action) => action.key === key) ?? null;
