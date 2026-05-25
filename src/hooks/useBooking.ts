import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from '@/hooks/useAnalytics';

interface CreateBookingParams {
  experienceId: string;
  slotId: string;
  guests: number;
  totalAmountEgp: number;
  visitorEmail: string;
}

export function useBooking() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackBookingStarted } = useAnalytics();

  async function startBookingCheckout(params: CreateBookingParams) {
    setIsProcessing(true);
    setError(null);

    try {
      trackBookingStarted(params.experienceId);

      const { data, error: fnError } = await supabase.functions.invoke('create-booking-checkout', {
        body: {
          ...params,
          successUrl: `${window.location.origin}/booking/success`,
          cancelUrl: `${window.location.origin}/booking/cancelled`,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.checkoutUrl) throw new Error('No checkout URL returned');

      window.location.href = data.checkoutUrl;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not start checkout';
      setError(message);
      setIsProcessing(false);
    }
  }

  return { startBookingCheckout, isProcessing, error };
}
