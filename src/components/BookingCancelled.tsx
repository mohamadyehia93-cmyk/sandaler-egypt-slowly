import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function BookingCancelled() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[560px] mx-auto px-4 pt-12 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-muted text-muted-foreground flex items-center justify-center mb-5">
          <X className="w-10 h-10" aria-hidden />
        </div>
        <h1 className={`listing-title ${ar ? 'lang-ar' : 'lang-en'} text-3xl text-foreground mb-2`}>{ar ? 'تم الإلغاء' : 'Cancelled'}</h1>
        <p className="text-[15px] text-muted-foreground">{t('booking.cancelled_message')}</p>
        <div className="flex flex-col sm:flex-row gap-2 mt-8">
          <a href="/bookings" className="flex-1 h-12 rounded-xl border border-border text-foreground font-bold inline-flex items-center justify-center">{ar ? 'عرض حجوزاتي' : 'See my bookings'}</a>
          <a href="/" className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold inline-flex items-center justify-center">{t('booking.cancelled_return_home')}</a>
        </div>
      </div>
    </div>
  );
}
