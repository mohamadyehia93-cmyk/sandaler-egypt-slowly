// supabase/functions/health/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    version: Deno.env.get('APP_VERSION') || 'unknown',
  };

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Database check
    const dbStart = Date.now();
    const { error: dbError } = await supabase.from('regions').select('id').limit(1);
    checks.database = {
      status: dbError ? 'error' : 'ok',
      latency_ms: Date.now() - dbStart,
      ...(dbError ? { error: dbError.message } : {}),
    };

    // Storage check
    const storageStart = Date.now();
    const { error: storageError } = await supabase.storage.listBuckets();
    checks.storage = {
      status: storageError ? 'error' : 'ok',
      latency_ms: Date.now() - storageStart,
    };

    // Stripe check — optional, skipped gracefully if key not set
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (stripeKey) {
      try {
        const stripeStart = Date.now();
        const stripeResp = await fetch('https://api.stripe.com/v1/payment_intents?limit=1', {
          headers: { Authorization: `Bearer ${stripeKey}` },
        });
        checks.stripe = {
          status: stripeResp.ok ? 'ok' : 'error',
          latency_ms: Date.now() - stripeStart,
        };
      } catch (e: unknown) {
        checks.stripe = { status: 'error', error: (e as Error).message };
      }
    } else {
      checks.stripe = { status: 'not_configured', message: 'STRIPE_SECRET_KEY not set' };
    }

    // Overall status — only database and storage are critical
    const criticalChecks = [checks.database, checks.storage] as Array<{ status: string }>;
    const hasError = criticalChecks.some((c) => c?.status === 'error');
    checks.status = hasError ? 'degraded' : 'healthy';

    return new Response(JSON.stringify(checks, null, 2), {
      status: hasError ? 503 : 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ status: 'error', error: (error as Error).message }),
      { status: 500, headers: corsHeaders },
    );
  }
});
