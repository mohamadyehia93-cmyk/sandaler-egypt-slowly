import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from '@/hooks/useAnalytics';

interface CreateBookingParams {
  experienceId: string;
  slotId?: string | null;
  guests: number;
  totalAmountEgp: number;
  visitorEmail: string;
}

export type BookingOutcome = 'redirect' | 'requested' | 'failed';

/**
 * Booking has two paths and picks between them AT RUNTIME — nothing is hardcoded:
 *
 *  1. Stripe checkout via the `create-booking-checkout` edge function. If STRIPE_SECRET_KEY
 *     is configured the function returns a checkout URL and we redirect.
 *  2. "Request to book" fallback. If the function is unavailable for any reason (missing
 *     Stripe secret, deploy error, network), we silently insert the booking row directly
 *     from the client as an unpaid REQUEST. No payment is taken or implied.
 *
 * Try-then-fallback (rather than a build-time flag) means the paid path starts working the
 * moment Stripe is configured, with no code change.
 */
export function useBooking() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackBookingStarted } = useAnalytics();

  async function requestBooking(params: CreateBookingParams, ar: boolean): Promise<BookingOutcome> {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) {
      setError(ar ? 'يرجى تسجيل الدخول أولاً.' : 'Please sign in first.');
      return 'failed';
    }

    // Resolve the owning provider's AUTH USER id: experiences.provider_id holds
    // providers.id (see src/lib/providerRecord.ts), but bookings.provider_id FKs auth.users.
    const { data: experience, error: expError } = await supabase
      .from('experiences')
      .select('id, price, provider_id')
      .eq('id', params.experienceId)
      .maybeSingle();

    if (expError || !experience) {
      setError(ar ? 'تعذر العثور على هذه التجربة.' : 'Could not find this experience.');
      return 'failed';
    }

    let providerUserId: string | null = null;
    if (experience.provider_id) {
      const { data: providerRow } = await supabase
        .from('providers')
        .select('user_id')
        .eq('id', experience.provider_id)
        .maybeSingle();
      providerUserId = providerRow?.user_id ?? null;
    }

    if (!providerUserId) {
      setError(
        ar
          ? 'لا يوجد مضيف نشط لهذه التجربة بعد، لذلك لا يمكن إرسال طلب حجز. جرّب تجربة أخرى.'
          : 'This listing has no active host yet, so a booking request cannot be sent. Please try another listing.'
      );
      return 'failed';
    }

    // Platform fee for experiences is 10% (intentional — see create-booking-checkout).
    const base = (experience.price ?? 0) * params.guests;
    const platformFee = Math.round(base * 0.10);

    // status and payment_status are forced server-side by bookings_insert_defaults.
    const { error: insertError } = await supabase.from('bookings').insert({
      experience_id: params.experienceId,
      slot_id: params.slotId || null,
      visitor_id: user.id,
      provider_id: providerUserId,
      guests: params.guests,
      total_amount_egp: base + platformFee,
      platform_fee_egp: platformFee,
      provider_amount_egp: base,
      status: 'pending',
      payment_status: 'unpaid',
    });

    if (insertError) {
      setError(ar ? `تعذر إرسال الطلب: ${insertError.message}` : `Could not send the request: ${insertError.message}`);
      return 'failed';
    }

    return 'requested';
  }

  async function startBookingCheckout(params: CreateBookingParams, ar = false): Promise<BookingOutcome> {
    setIsProcessing(true);
    setError(null);

    try {
      trackBookingStarted(params.experienceId);

      if (params.slotId) {
        try {
          const { data, error: fnError } = await supabase.functions.invoke('create-booking-checkout', {
            body: {
              ...params,
              successUrl: `${window.location.origin}/booking/success`,
              cancelUrl: `${window.location.origin}/booking/cancelled`,
            },
          });

          if (fnError || data?.error || !data?.checkoutUrl) {
            throw new Error(fnError?.message || data?.error || 'Checkout unavailable');
          }

          window.location.href = data.checkoutUrl;
          return 'redirect';
        } catch (stripeUnavailable) {
          // Silent fallback — the visitor sees the request flow, not an error.
          console.info('[booking] paid checkout unavailable, falling back to request-to-book', stripeUnavailable);
        }
      }

      return await requestBooking(params, ar);
    } finally {
      setIsProcessing(false);
    }
  }

  return { startBookingCheckout, isProcessing, error };
}
