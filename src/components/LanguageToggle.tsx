import { useLanguage } from '@/hooks/useLanguage';
import { Globe } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTranslation } from 'react-i18next';

type LanguageToggleProps = {
  className?: string;
  iconClassName?: string;
};

export function LanguageToggle({ className, iconClassName }: LanguageToggleProps) {
  const { lang, toggle } = useLanguage();
  const { trackLanguageSwitched } = useAnalytics();
  const { t } = useTranslation();

  function handleToggle() {
    const next = lang === 'ar' ? 'en' : 'ar';
    toggle();
    trackLanguageSwitched(next);
  }

  const ariaLabel = lang === 'ar'
    ? t('language_toggle.switch_to_english')
    : t('language_toggle.switch_to_arabic');

  return (
    <button
      onClick={handleToggle}
      className={className ?? "flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-sm font-medium hover:bg-accent transition-colors"}
      aria-label={ariaLabel}
    >
      <Globe className={iconClassName ?? "w-4 h-4"} />
      <span className="font-cairo">
        {lang === 'ar' ? t('language_toggle.english_label') : t('language_toggle.arabic_label')}
      </span>
    </button>
  );
}
