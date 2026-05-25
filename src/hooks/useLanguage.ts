import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export function useLanguage() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const toggle = () => {
    const next = lang === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
  };

  return { lang, dir, isRTL: dir === 'rtl', toggle };
}
