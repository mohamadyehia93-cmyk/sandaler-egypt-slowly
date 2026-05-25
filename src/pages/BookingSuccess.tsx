import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from '@/hooks/useAnalytics';

interface BookingRecord {
  id: string;
  experience_id: string;
  guests: number;
  total_amount_egp: number;
  provider_amount_egp: number;
  status: string;
  experience: { title_en: string; title_ar: string; price: number } | null;
}

export default function BookingSuccess() {
  const [params] = useSearchParams();
  const bookingId = params.get('booking_id');
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const { trackBookingCompleted } = useAnalytics();
  const { t } = useTranslation();
  const { lang } = useLanguage();

  useEffect(() => {
    if (!bookingId) return;
    let mounted = true;

    async function fetchBooking() {
      const { data } = await supabase
        .from('bookings')
        .select('id, experience_id, guests, total_amount_egp, provider_amount_egp, status, experience:experiences(title_en, title_ar, price)')
        .eq('id', bookingId)
        .single();
      if (mounted && data) {
        const row = data as unknown as BookingRecord;
        setBooking(row);
        if (row.status === 'confirmed') {
          trackBookingCompleted(row.experience_id, row.total_amount_egp);
        }
      }
    }

    fetchBooking();
    const interval = setInterval(fetchBooking, 2000);
    const timeout = setTimeout(() => clearInterval(interval), 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [bookingId, trackBookingCompleted]);

  if (!booking) {
    return <div className="p-8 text-center font-cairo">{t('booking.confirming_your_booking')}</div>;
  }

  const experienceTitle = booking.experience
    ? (lang === 'ar' ? (booking.experience.title_ar || booking.experience.title_en) : booking.experience.title_en)
    : '';

  return (
    <div className="max-w-md mx-auto p-6 text-center font-cairo">
      <div className="w-20 h-20 mx-auto rounded-full bg-success/10 border-2 border-success flex items-center justify-center mb-6">
        <span className="text-4xl text-success">✓</span>
      </div>
      <h1 className="text-2xl font-bold mb-2">{t('booking.booking_confirmed')}</h1>
      <p className="text-muted-foreground mb-1">{experienceTitle}</p>
      <p className="text-xs text-muted-foreground mb-6">{t('booking.ref_short')}: SND-{booking.id.slice(0, 8).toUpperCase()}</p>
      <div className="bg-card border rounded-xl p-4 text-left">
        <div className="flex justify-between mb-2">
          <span>{t('booking.guests')}</span><strong>{booking.guests}</strong>
        </div>
        <div className="flex justify-between mb-2">
          <span>{t('booking.booking_total_paid')}</span><strong>{booking.total_amount_egp} {t('common.egp')}</strong>
        </div>
        <div className="flex justify-between text-success text-sm">
          <span>{t('booking.booking_to_host')}</span><span>{booking.provider_amount_egp} {t('common.egp')}</span>
        </div>
      </div>
    </div>
  );
}
