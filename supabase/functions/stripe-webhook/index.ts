// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

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
        // Load the booking first so we can (a) avoid double-processing duplicate
        // webhook deliveries and (b) decrement slot availability exactly once.
        const { data: existing } = await supabase
          .from('bookings')
          .select('status, slot_id, guests')
          .eq('id', bookingId)
          .single();

        if (existing && existing.status !== 'confirmed') {
          await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq('id', bookingId);

          // Decrement remaining spots on the booked slot (clamped at 0).
          if (existing.slot_id) {
            const { data: slot } = await supabase
              .from('experience_slots')
              .select('spots_available')
              .eq('id', existing.slot_id)
              .single();
            if (slot) {
              const remaining = Math.max((slot.spots_available ?? 0) - (existing.guests ?? 0), 0);
              await supabase
                .from('experience_slots')
                .update({ spots_available: remaining })
                .eq('id', existing.slot_id);
            }
          }
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
