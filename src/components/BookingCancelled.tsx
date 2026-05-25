import { useTranslation } from 'react-i18next';

export default function BookingCancelled() {
  const { t } = useTranslation();
  return (
    <div className="p-8 text-center font-cairo">
      {t('booking.cancelled_message')}{' '}
      <a href="/" className="text-primary underline">{t('booking.cancelled_return_home')}</a>
    </div>
  );
}
