/**
 * OWNER-EDITABLE COPY
 * ===================
 * Everything in this file is placeholder / default text meant to be replaced by
 * Sandal's owner with his own authored words. Nothing here is generated
 * marketing copy for the mission or story — the About sections intentionally
 * carry visible "[ADMIN: replace …]" markers so they cannot ship unnoticed.
 */

export type Bilingual = { en: string; ar: string };

/** Short one-line purpose statement shown on the home page, above the fold. */
export const HOME_PURPOSE_LINE: Bilingual = {
  // EDITABLE — sensible default, owner to finalise.
  en: "The platform that connects you to local hosts across provincial Egypt — experiences, stays and local stories.",
  ar: "منصّة تصلك بأهل البلد في ريف مصر — تجارب وإقامات وحكايات محلية",
};

/** About page sections. Each body is an admin placeholder, not authored copy. */
export const ABOUT_SECTIONS: { heading: Bilingual; body: Bilingual }[] = [
  {
    heading: { en: "What Sandal is", ar: "إيه هو صندل" },
    body: {
      en: "[ADMIN: replace with About text — what Sandal is. Say plainly whether Sandal connects travellers to local hosts or provides the services itself.]",
      ar: "[ADMIN: ضع نص «من نحن» هنا — إيه هو صندل، وهل هو وسيط يوصلك بأهل البلد أم مقدّم للخدمات بنفسه.]",
    },
  },
  {
    heading: { en: "Who is behind it", ar: "مين وراه" },
    body: {
      en: "[ADMIN: replace with About text — who is behind Sandal: the team, partners and local network.]",
      ar: "[ADMIN: ضع نص «من نحن» هنا — مين وراء صندل: الفريق والشركاء والشبكة المحلية.]",
    },
  },
  {
    heading: { en: "The slow-tourism mission", ar: "رسالة السياحة المتأنية" },
    body: {
      en: "[ADMIN: replace with About text — the slow-tourism mission and how income reaches local hosts.]",
      ar: "[ADMIN: ضع نص «من نحن» هنا — رسالة السياحة المتأنية وكيف يصل الدخل لأهل البلد.]",
    },
  },
];
