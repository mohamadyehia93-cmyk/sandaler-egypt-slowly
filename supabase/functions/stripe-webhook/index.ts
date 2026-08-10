// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Constructed per-request rather than at module load: `new Stripe(undefined)`
// throws, and a throw during module evaluation makes every request to this
// function fail before any handler code runs. Stripe would then retry against
// an endpoint that can never recover on its own.
function createStripeClient(): Stripe | null {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) return null;
  return new Stripe(secretKey, {
    apiVersion: '2024-04-10',
    httpClient: Stripe.createFetchHttpClient(),
  });
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  const stripe = createStripeClient();
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!stripe || !webhookSecret) {
    // 503 is deliberate: Stripe retries 5xx, so deliveries are not lost while
    // the secret is being restored. A 200 here would silently drop payments.
    console.error('Stripe webhook is not configured', {
      hasSecretKey: Boolean(stripe),
      hasWebhookSecret: Boolean(webhookSecret),
    });
    return new Response('Stripe webhook is not configured', { status: 503 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(`Webhook signature error: ${message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      if (bookingId) {
        // Claim the booking with a single conditional UPDATE instead of
        // read-then-write. Stripe delivers at-least-once and retries, so two
        // deliveries could previously both read status !== 'confirmed' and
        // both decrement the slot. The .eq('status', ...) makes the transition
        // the atomic claim: exactly one delivery gets a row back, and only
        // that one goes on to decrement.
        const { data: claimed, error: claimError } = await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('id', bookingId)
          // Both are legitimate pre-payment states: enforce_booking_insert_defaults
          // pins status to 'pending' unless the caller supplied 'pending_payment'
          // (which create-booking-checkout does). Matching only one of them would
          // silently leave paid bookings unconfirmed.
          //
          // This also narrows the previous condition, which was `!== 'confirmed'`
          // and would happily "confirm" a booking that had been cancelled,
          // expired or refunded.
          .in('status', ['pending', 'pending_payment'])
          .select('slot_id, guests');

        if (claimError) {
          // Surface as 5xx so Stripe retries rather than dropping the payment.
          console.error('Failed to confirm booking', bookingId, claimError.message);
          return new Response('Failed to confirm booking', { status: 500 });
        }

        if (claimed && claimed.length > 0) {
          const booking = claimed[0];
          if (booking.slot_id) {
            // Atomic in SQL (GREATEST(spots - n, 0)); a read-modify-write here
            // would reintroduce the oversell race under concurrent bookings.
            const { error: decrementError } = await supabase.rpc('decrement_slot_spots', {
              _slot_id: booking.slot_id,
              _guests: booking.guests ?? 0,
            });
            if (decrementError) {
              console.error('Failed to decrement slot spots', booking.slot_id, decrementError.message);
            }
          }
        } else {
          // Already confirmed by an earlier delivery, or not awaiting payment.
          console.log('Booking not claimed (duplicate delivery or unexpected status)', bookingId);
        }
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      if (bookingId) {
        await supabase.from('bookings').update({ status: 'expired' }).eq('id', bookingId);
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;
      await supabase
        .from('bookings')
        .update({ status: 'refunded', refunded_at: new Date().toISOString() })
        .eq('stripe_payment_intent_id', paymentIntentId);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
