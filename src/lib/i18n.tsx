import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import i18n from "@/i18n/config";


type Lang = "en" | "ar";

const translations: Record<string, Record<Lang, string>> = {
  "app.name": { en: "Sandal", ar: "صندل" },
  "app.tagline": { en: "Discover Egypt. Slowly.", ar: "اكتشف مصر. ببطء." },
  "nav.explore": { en: "Explore", ar: "استكشف" },
  "nav.wishlists": { en: "Wishlists", ar: "المفضلة" },
  "nav.inbox": { en: "Inbox", ar: "الرسائل" },
  "nav.profile": { en: "Profile", ar: "الملف" },
  "tab.explore": { en: "Explore", ar: "استكشف" },
  "tab.experiences": { en: "Experiences", ar: "تجارب" },
  "tab.trips": { en: "Trips", ar: "رحلات" },
  "splash.getStarted": { en: "Get Started", ar: "ابدأ الآن" },
  "splash.login": { en: "Log In", ar: "تسجيل الدخول" },
  "splash.chooseLanguage": { en: "Choose Language", ar: "اختر اللغة" },
  "section.regions": { en: "Regions", ar: "المناطق" },
  "section.latestPosts": { en: "Latest Posts", ar: "أحدث المقالات" },
  "section.audioTours": { en: "Audio Tours", ar: "جولات صوتية" },
  "section.experiences": { en: "Experiences", ar: "تجارب" },
  "section.trips": { en: "Trips", ar: "رحلات" },
  "section.placesToStay": { en: "Places to Stay", ar: "أماكن الإقامة" },
  "section.gettingAround": { en: "Getting Around", ar: "وسائل النقل" },
  "section.products": { en: "Local Products", ar: "منتجات محلية" },
  "section.events": { en: "Events", ar: "فعاليات" },
  "events.upcoming": { en: "Upcoming", ar: "قادمة" },
  "events.past": { en: "Past", ar: "منتهية" },
  "event.when": { en: "When", ar: "الموعد" },
  "event.where": { en: "Where", ar: "المكان" },
  "event.about": { en: "About this event", ar: "عن الفعالية" },
  "event.tickets": { en: "Get Tickets", ar: "احجز تذكرة" },
  "event.reserve": { en: "Reserve Free Spot", ar: "احجز مكانك مجاناً" },
  "event.externalTickets": { en: "Organizer site", ar: "موقع المنظم" },
  "event.noEvents": { en: "No events yet", ar: "لا توجد فعاليات بعد" },
  "event.category.festival": { en: "Festival", ar: "مهرجان" },
  "event.category.exhibition": { en: "Exhibition", ar: "معرض" },
  "event.category.concert": { en: "Concert", ar: "حفل" },
  "event.category.workshop": { en: "Workshop", ar: "ورشة" },
  "event.category.performance": { en: "Performance", ar: "عرض فني" },
  "event.category.market": { en: "Market", ar: "سوق" },
  "event.category.food": { en: "Food", ar: "طعام" },
  "event.category.heritage": { en: "Heritage", ar: "تراث" },
  "event.category": { en: "Category", ar: "التصنيف" },
  "event.details": { en: "Event details", ar: "تفاصيل الفعالية" },
  "event.organizer": { en: "Organizer", ar: "المنظم" },
  "event.addToCalendar": { en: "Add to calendar", ar: "أضف للتقويم" },
  "event.directions": { en: "Directions", ar: "الاتجاهات" },
  "event.share": { en: "Share", ar: "مشاركة" },
  "event.save": { en: "Save", ar: "حفظ" },
  "event.admission": { en: "Admission", ar: "الدخول" },
  "event.capacity": { en: "Capacity", ar: "السعة" },
  "event.people": { en: "people", ar: "شخص" },
  "event.duration": { en: "Duration", ar: "المدة" },
  "event.days": { en: "days", ar: "أيام" },
  "event.oneDay": { en: "Single day", ar: "يوم واحد" },
  "event.date": { en: "Date", ar: "التاريخ" },
  "event.time": { en: "Time", ar: "الوقت" },
  "event.timeTBA": { en: "To be announced", ar: "يُعلن لاحقًا" },
  "event.today": { en: "Happening today", ar: "تُقام اليوم" },
  "event.tomorrow": { en: "Tomorrow", ar: "غدًا" },
  "event.inDays": { en: "In {days} days", ar: "بعد {days} أيام" },
  "event.ended": { en: "This event has ended", ar: "انتهت هذه الفعالية" },
  "event.noTickets": { en: "No ticket link — contact the organizer", ar: "لا يوجد رابط تذاكر — تواصل مع المنظم" },
  "event.openMaps": { en: "Open in Maps", ar: "افتح في الخرائط" },
  "event.linkCopied": { en: "Link copied", ar: "تم نسخ الرابط" },
  "event.calendarSaved": { en: "Calendar file downloaded", ar: "تم تنزيل ملف التقويم" },
  "event.moreInCity": { en: "More events nearby", ar: "فعاليات أخرى قريبة" },

  "section.seeAll": { en: "See all", ar: "عرض الكل" },
  "common.book": { en: "Book", ar: "احجز" },
  "common.perNight": { en: "/night", ar: "/ليلة" },
  "common.egp": { en: "EGP", ar: "ج.م" },
  "common.min": { en: "min", ar: "د" },
  "common.stops": { en: "stops", ar: "محطات" },
  "common.free": { en: "Free", ar: "مجاني" },
  "date.chooseDate": { en: "Choose a date to view Trips", ar: "اختر تاريخ لعرض الرحلات" },
  "section.whosWho": { en: "Who's Who", ar: "من هم" },
  "section.collections": { en: "Knowledge Collections", ar: "مجموعات المعرفة" },
  "filter.allCities": { en: "All Cities", ar: "كل المدن" },
  "filter.city": { en: "City", ar: "المدينة" },
  "region.nileDelta": { en: "Nile Delta", ar: "دلتا النيل" },
  "region.suezCanal": { en: "Suez Canal", ar: "قناة السويس" },
  "region.upperEgypt": { en: "Upper Egypt", ar: "صعيد مصر" },
  "region.mariout": { en: "Mariout", ar: "مريوط" },
  "region.fayyum": { en: "Fayyum", ar: "الفيوم" },
  "region.frontiers": { en: "Frontiers", ar: "الحدود" },
  "section.testimonials": { en: "Testimonials", ar: "آراء المسافرين" },
  "section.partners": { en: "Our Partners", ar: "شركاؤنا" },
  "section.certifications": { en: "Verification & Certificates", ar: "التوثيق والشهادات" },
  "common.audioTour": { en: "Audio Tour", ar: "جولة صوتية" },
  "section.causes": { en: "Programs & Causes", ar: "البرامج والقضايا" },
  "city.about": { en: "About", ar: "عن المدينة" },
  "city.highlights": { en: "Highlights", ar: "أبرز المعالم" },
  "city.knownFor": { en: "Known For", ar: "تشتهر بـ" },
  "city.bestTime": { en: "Best Time to Visit", ar: "أفضل وقت للزيارة" },
};

type I18nContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
  dir: "ltr",
});

/**
 * Single source of truth for the UI language: i18next.
 * This context used to keep its own useState, so toggling the language only
 * changed react-i18next strings while every `useI18n()` component stayed put.
 */
const normalize = (value?: string | null): Lang =>
  (value ?? "").toLowerCase().startsWith("ar") ? "ar" : "en";

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => normalize(i18n.language));

  useEffect(() => {
    const onChange = (next: string) => setLangState(normalize(next));
    i18n.on("languageChanged", onChange);
    setLangState(normalize(i18n.language));
    return () => {
      i18n.off("languageChanged", onChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLang = (l: Lang) => {
    i18n.changeLanguage(l);
  };

  const t = (key: string) => translations[key]?.[lang] ?? key;
  const dir = lang === "ar" ? "rtl" : "ltr";


  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t, dir }}>
      <div dir={dir}>{children}</div>
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
