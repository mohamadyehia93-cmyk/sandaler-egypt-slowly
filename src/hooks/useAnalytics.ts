import { trackEvent, identifyUser } from '@/lib/analytics/posthog';

export function useAnalytics() {
  return {
    track: trackEvent,
    identify: identifyUser,
    trackBookingStarted: (experienceId: string) =>
      trackEvent('booking_started', { experience_id: experienceId }),
    trackBookingCompleted: (experienceId: string, amountEgp: number) =>
      trackEvent('booking_completed', { experience_id: experienceId, amount_egp: amountEgp }),
    trackAudioTourStarted: (tourId: string) =>
      trackEvent('audio_tour_started', { tour_id: tourId }),
    trackContentRead: (contentId: string, contentType: string) =>
      trackEvent('content_read', { content_id: contentId, content_type: contentType }),
    trackLanguageSwitched: (newLang: string) =>
      trackEvent('language_switched', { new_lang: newLang }),
  };
}
