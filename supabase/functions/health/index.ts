// supabase/functions/health/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-health-secret, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Detailed infrastructure diagnostics (latency, per-service status, version)
  // are only returned to callers that present the HEALTH_SECRET token.
  // Everyone else gets a minimal up/down signal so the endpoint can still be
  // used as a public uptime probe without leaking internal infrastructure state.
  const healthSecret = Deno.env.get('HEALTH_SECRET');
  const provided = req.headers.get('x-health-secret');
  const detailed = !!healthSecret && provided === healthSecret;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Database check
    const dbStart = Date.now();
    const { error: dbError } = await supabase.from('regions').select('id').limit(1);
    const dbLatency = Date.now() - dbStart;

    // Storage check
    const storageStart = Date.now();
    const { error: storageError } = await supabase.storage.listBuckets();
    const storageLatency = Date.now() - storageStart;

    // Stripe check — optional, skipped gracefully if key not set
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    let stripeOk: boolean | null = null;
    let stripeLatency = 0;
    if (stripeKey) {
      try {
        const stripeStart = Date.now();
        const stripeResp = await fetch('https://api.stripe.com/v1/payment_intents?limit=1', {
          headers: { Authorization: `Bearer ${stripeKey}` },
        });
        stripeOk = stripeResp.ok;
        stripeLatency = Date.now() - stripeStart;
      } catch {
        stripeOk = false;
      }
    }

    const hasError = !!dbError || !!storageError;
    const status = hasError ? 'degraded' : 'healthy';

    // Minimal public payload — no latency, version, or per-service breakdown.
    if (!detailed) {
      return new Response(JSON.stringify({ status }), {
        status: hasError ? 503 : 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Detailed payload for authorized monitoring callers only.
    const checks = {
      status,
      timestamp: new Date().toISOString(),
      version: Deno.env.get('APP_VERSION') || 'unknown',
      database: {
        status: dbError ? 'error' : 'ok',
        latency_ms: dbLatency,
        ...(dbError ? { error: dbError.message } : {}),
      },
      storage: {
        status: storageError ? 'error' : 'ok',
        latency_ms: storageLatency,
      },
      stripe: stripeKey
        ? { status: stripeOk ? 'ok' : 'error', latency_ms: stripeLatency }
        : { status: 'not_configured' },
    };

    return new Response(JSON.stringify(checks, null, 2), {
      status: hasError ? 503 : 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (_error: unknown) {
    // Never leak internal error details publicly.
    return new Response(JSON.stringify({ status: 'error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
