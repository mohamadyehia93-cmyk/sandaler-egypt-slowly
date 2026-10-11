import EmptySection from "@/components/EmptySection";

/**
 * One shared "nothing listed here yet" line for city and region sections.
 * Copy lives here so every page says the same thing in the same voice.
 */
export type EmptyKind =
  | "experiences" | "products" | "events" | "trips" | "audio"
  | "stories" | "transport" | "organisations" | "stays" | "people";

const JOIN = "/welcome";

const COPY: Record<EmptyKind, { en: (p: string) => string; ar: (p: string) => string; ctaEn: string; ctaAr: string; href: string }> = {
  experiences: { en: (p) => `No experiences listed in ${p} yet. Do you host or guide here?`, ar: (p) => `لا توجد تجارب مُدرجة في ${p} بعد. هل تستضيف أو ترشد هنا؟`, ctaEn: "Join Sandal", ctaAr: "انضم إلى صندل", href: JOIN },
  products: { en: (p) => `No products listed in ${p} yet. Do you make things here?`, ar: (p) => `لا توجد منتجات مُدرجة في ${p} بعد. هل تصنع شيئًا هنا؟`, ctaEn: "Join Sandal", ctaAr: "انضم إلى صندل", href: JOIN },
  events: { en: (p) => `No events listed in ${p} yet. Organising something here?`, ar: (p) => `لا توجد فعاليات مُدرجة في ${p} بعد. تنظّم شيئًا هنا؟`, ctaEn: "Add your event", ctaAr: "أضف فعاليتك", href: "/dashboard/new-event" },
  trips: { en: (p) => `No trips listed in ${p} yet. Do you run trips here?`, ar: (p) => `لا توجد رحلات مُدرجة في ${p} بعد. هل تنظّم رحلات هنا؟`, ctaEn: "Join Sandal", ctaAr: "انضم إلى صندل", href: JOIN },
  audio: { en: (p) => `No audio tours for ${p} yet. Want to tell its story?`, ar: (p) => `لا توجد جولات صوتية عن ${p} بعد. تريد أن تحكي حكايتها؟`, ctaEn: "Become a storyteller", ctaAr: "كن راويًا", href: JOIN },
  stories: { en: (p) => `No stories about ${p} yet. Know this place?`, ar: (p) => `لا توجد حكايات عن ${p} بعد. تعرف هذا المكان؟`, ctaEn: "Write for Sandal", ctaAr: "اكتب لصندل", href: JOIN },
  transport: { en: (p) => `No transport listed for ${p} yet. Do you drive or run boats here?`, ar: (p) => `لا توجد وسائل تنقّل مُدرجة لـ${p} بعد. هل تعمل سائقًا أو صاحب مركب هنا؟`, ctaEn: "Join Sandal", ctaAr: "انضم إلى صندل", href: JOIN },
  organisations: { en: (p) => `No organisations listed in ${p} yet. Working here?`, ar: (p) => `لا توجد مؤسسات مُدرجة في ${p} بعد. تعمل هنا؟`, ctaEn: "Join Sandal", ctaAr: "انضم إلى صندل", href: JOIN },
  stays: { en: (p) => `No stays listed in ${p} yet. Do you host here?`, ar: (p) => `لا توجد إقامات مُدرجة في ${p} بعد. تستضيف هنا؟`, ctaEn: "Join Sandal", ctaAr: "انضم إلى صندل", href: JOIN },
  people: { en: (p) => `No local people listed in ${p} yet. Know this place?`, ar: (p) => `لا يوجد أشخاص مُدرجون في ${p} بعد. تعرف هذا المكان؟`, ctaEn: "Join Sandal", ctaAr: "انضم إلى صندل", href: JOIN },
};

type Props = { kind: EmptyKind; placeEn: string; placeAr?: string | null; className?: string };

const SectionEmptyState = ({ kind, placeEn, placeAr, className }: Props) => {
  const c = COPY[kind];
  return (
    <EmptySection
      className={className}
      messageEn={c.en(placeEn)}
      messageAr={c.ar(placeAr || placeEn)}
      actionEn={c.ctaEn}
      actionAr={c.ctaAr}
      actionHref={c.href}
    />
  );
};

export default SectionEmptyState;
