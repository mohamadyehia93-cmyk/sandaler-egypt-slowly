import { createContext, useContext, useState, ReactNode } from "react";

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
  "section.seeAll": { en: "See all", ar: "عرض الكل" },
  "common.book": { en: "Book", ar: "احجز" },
  "common.perNight": { en: "/night", ar: "/ليلة" },
  "common.egp": { en: "EGP", ar: "ج.م" },
  "common.min": { en: "min", ar: "د" },
  "common.stops": { en: "stops", ar: "محطات" },
  "common.free": { en: "Free", ar: "مجاني" },
  "date.chooseDate": { en: "Choose a date to view Trips", ar: "اختر تاريخ لعرض الرحلات" },
  "section.whosWho": { en: "Who's Who", ar: "من هم" },
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
  "section.causes": { en: "Local Causes", ar: "قضايا محلية" },
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

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("sandal-lang");
    return (saved === "ar" || saved === "en") ? saved : "en";
  });

  const changeLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("sandal-lang", l);
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = l;
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
