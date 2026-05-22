-- Create bookings table for Stripe payment integration.
-- Holds the full booking lifecycle from pending_payment → confirmed → (refunded|cancelled|completed).
-- The bookings table did not previously exist; this is its initial CREATE.

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE RESTRICT,
  slot_id UUID REFERENCES public.experience_slots(id) ON DELETE SET NULL,
  visitor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  total_amount_egp INTEGER NOT NULL CHECK (total_amount_egp >= 0),
  platform_fee_egp INTEGER NOT NULL CHECK (platform_fee_egp >= 0),
  provider_amount_egp INTEGER NOT NULL CHECK (provider_amount_egp >= 0),
  status TEXT NOT NULL DEFAULT 'pending_payment',
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_status_check') THEN
    ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check
      CHECK (status IN ('pending_payment', 'confirmed', 'expired', 'cancelled', 'refunded', 'completed'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_bookings_visitor ON public.bookings(visitor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_experience ON public.bookings(experience_id);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session ON public.bookings(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent ON public.bookings(stripe_payment_intent_id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Visitors read their own bookings
CREATE POLICY "Visitors can read their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = visitor_id);

-- Providers read bookings against their experiences
CREATE POLICY "Providers can read bookings on their experiences"
  ON public.bookings FOR SELECT
  USING (auth.uid() = provider_id);

-- Visitors create their own bookings (Edge Function uses anon key + user JWT, so this is respected)
CREATE POLICY "Visitors can create their own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = visitor_id);

-- Webhook function uses service_role (bypasses RLS), so no UPDATE policy needed for status transitions.
-- Self-service cancellation by the visitor would need its own policy added later.

-- Trigger to bump updated_at on mutation
CREATE OR REPLACE FUNCTION public.touch_bookings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_touch_updated_at ON public.bookings;
CREATE TRIGGER bookings_touch_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.touch_bookings_updated_at();
