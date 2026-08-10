ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_payment_status_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_payment_status_check
  CHECK (payment_status IN ('unpaid','paid','refunded'));

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending','pending_payment','confirmed','declined','expired','cancelled','refunded','completed'));

-- Force the request lifecycle on insert: a client can never self-confirm or self-mark-paid.
-- 'pending_payment' is preserved so the Stripe checkout path keeps working unchanged.
CREATE OR REPLACE FUNCTION public.enforce_booking_insert_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status IS NULL OR NEW.status NOT IN ('pending','pending_payment') THEN
    NEW.status := 'pending';
  END IF;
  NEW.payment_status := 'unpaid';
  NEW.paid_at := NULL;
  NEW.refunded_at := NULL;
  NEW.created_at := now();
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_insert_defaults ON public.bookings;
CREATE TRIGGER bookings_insert_defaults
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_insert_defaults();

-- Providers may also decline; payment_status stays pinned for them.
CREATE OR REPLACE FUNCTION public.enforce_booking_provider_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF public.is_experience_provider(OLD.experience_id, auth.uid()) THEN
    NEW.id := OLD.id;
    NEW.experience_id := OLD.experience_id;
    NEW.slot_id := OLD.slot_id;
    NEW.visitor_id := OLD.visitor_id;
    NEW.provider_id := OLD.provider_id;
    NEW.guests := OLD.guests;
    NEW.total_amount_egp := OLD.total_amount_egp;
    NEW.platform_fee_egp := OLD.platform_fee_egp;
    NEW.provider_amount_egp := OLD.provider_amount_egp;
    NEW.stripe_session_id := OLD.stripe_session_id;
    NEW.stripe_payment_intent_id := OLD.stripe_payment_intent_id;
    NEW.payment_status := OLD.payment_status;
    NEW.paid_at := OLD.paid_at;
    NEW.refunded_at := OLD.refunded_at;
    NEW.created_at := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS "Providers can update status of bookings on their experiences" ON public.bookings;
CREATE POLICY "Providers can update status of bookings on their experiences"
ON public.bookings FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    JOIN public.providers p ON p.id = e.provider_id
    WHERE e.id = bookings.experience_id AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.experiences e
    JOIN public.providers p ON p.id = e.provider_id
    WHERE e.id = bookings.experience_id AND p.user_id = auth.uid()
  )
  AND status IN ('confirmed','declined','cancelled','completed')
);