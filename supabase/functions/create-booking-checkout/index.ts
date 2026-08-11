// supabase/functions/create-booking-checkout/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Stripe is constructed per-request, not at module load. `new Stripe(undefined)`
// throws, and a throw during module evaluation takes down the whole function —
// including the CORS preflight, which then 500s and surfaces in the browser as
// an opaque network error. Reading the secret inside the handler is the same
// shape health/index.ts already uses.
function createStripeClient(): Stripe | null {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) return null;
  return new Stripe(secretKey, {
    apiVersion: '2024-04-10',
    httpClient: Stripe.createFetchHttpClient(),
  });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface BookingRequest {
  experienceId: string;
  slotId: string;
  guests: number;
  totalAmountEgp: number;
  visitorEmail: string;
  successUrl: string;
  cancelUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  // Fail fast and explicitly when the secret is absent, instead of throwing at
  // import time. The preflight above has already been answered by this point.
  const stripe = createStripeClient();
  if (!stripe) {
    console.error('STRIPE_SECRET_KEY is not set — cannot create a checkout session');
    return new Response(
      JSON.stringify({ error: 'Payment processing is not configured' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body: BookingRequest = await req.json();
    const { experienceId, slotId, guests, totalAmountEgp, visitorEmail, successUrl, cancelUrl } = body;

    // Validate redirect origins against an allowlist to prevent post-payment phishing.
    // Only the origin of the client-supplied URLs is honored; final paths are fixed server-side.
    //
    // Exact-host match only. The previous suffix match (`.lovable.app` /
    // `.lovable.dev`) accepted ANY Lovable project, so anyone with a free
    // project could receive a user immediately after a real payment.
    // Hosts come from ALLOWED_REDIRECT_HOSTS (comma-separated) so a new
    // domain does not need a code change; the default is the production host.
    const DEFAULT_APP_HOST = 'sandal.lovable.app';
    const allowedHosts = (Deno.env.get('ALLOWED_REDIRECT_HOSTS') ?? DEFAULT_APP_HOST)
      .split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean);

    const isAllowedOrigin = (raw: string): string | null => {
      try {
        const u = new URL(raw);
        const host = u.hostname.toLowerCase();
        // localhost stays usable for development, over http or https.
        if (host === 'localhost' || host === '127.0.0.1') return u.origin;
        if (u.protocol !== 'https:') return null;
        return allowedHosts.includes(host) ? u.origin : null;
      } catch {
        return null;
      }
    };

    const fallbackOrigin = `https://${allowedHosts[0] ?? DEFAULT_APP_HOST}`;
    const successOrigin = isAllowedOrigin(successUrl ?? '') ?? fallbackOrigin;
    const cancelOrigin = isAllowedOrigin(cancelUrl ?? '') ?? fallbackOrigin;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Server-side price validation — slot price is source of truth (allows per-date pricing).
    // Join experiences to pull title + provider for the Stripe line item and booking row.
    const { data: slot, error: slotError } = await supabase
      .from('experience_slots')
      .select('id, experience_id, price, spots_available, experiences!inner(id, title_en, provider_id)')
      .eq('id', slotId)
      .single();

    if (slotError || !slot || slot.experience_id !== experienceId) {
      return new Response(JSON.stringify({ error: 'Slot not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (slot.spots_available < guests) {
      return new Response(JSON.stringify({ error: 'Not enough spots available' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const experience = (slot as unknown as { experiences: { id: string; title_en: string; provider_id: string | null } }).experiences;

    // experiences.provider_id holds providers.id, but bookings.provider_id has a FK to
    // auth.users — resolve the owning provider's user id before writing the booking.
    let providerUserId: string | null = null;
    if (experience.provider_id) {
      const { data: providerRow } = await supabase
        .from('providers')
        .select('user_id')
        .eq('id', experience.provider_id)
        .maybeSingle();
      providerUserId = (providerRow as { user_id: string | null } | null)?.user_id ?? null;
    }

    const expectedTotal = slot.price * guests;

    // 10% platform fee for experiences is intentional — covers Ambassador verification + content
    // production overhead. Stays/products/trips/transport use 5% (handled in their own checkout
    // flows when wired). Do not "standardize" these — the differential is by design.
    const platformFee = Math.round(expectedTotal * 0.10);
    const expectedWithFee = expectedTotal + platformFee;

    if (totalAmountEgp !== expectedWithFee) {
      return new Response(JSON.stringify({
        error: 'Price mismatch',
        expected: expectedWithFee,
        received: totalAmountEgp,
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        experience_id: experienceId,
        slot_id: slotId,
        visitor_id: user.id,
        provider_id: experience.provider_id,
        guests,
        total_amount_egp: expectedWithFee,
        platform_fee_egp: platformFee,
        provider_amount_egp: expectedTotal,
        status: 'pending_payment',
      })
      .select()
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: 'Could not create booking', details: bookingError?.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'egp',
          product_data: {
            name: experience.title_en,
            description: `${guests} guest${guests > 1 ? 's' : ''}`,
          },
          unit_amount: expectedWithFee * 100, // Stripe expects piasters
        },
        quantity: 1,
      }],
      customer_email: visitorEmail,
      success_url: `${successOrigin}/booking/success?booking_id=${booking.id}`,
      cancel_url: `${cancelOrigin}/booking/cancelled?booking_id=${booking.id}`,
      metadata: {
        booking_id: booking.id,
        experience_id: experienceId,
        visitor_id: user.id,
        provider_id: experience.provider_id,
      },
    });

    await supabase
      .from('bookings')
      .update({ stripe_session_id: session.id })
      .eq('id', booking.id);

    return new Response(JSON.stringify({
      checkoutUrl: session.url,
      bookingId: booking.id,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
