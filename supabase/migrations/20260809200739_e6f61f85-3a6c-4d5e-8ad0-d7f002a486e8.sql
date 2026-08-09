-- PART A: allow the owning provider to update booking status only
CREATE OR REPLACE FUNCTION public.enforce_booking_provider_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF public.is_experience_provider(OLD.experience_id, auth.uid()) THEN
    -- providers may only change the status column
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
    NEW.paid_at := OLD.paid_at;
    NEW.refunded_at := OLD.refunded_at;
    NEW.created_at := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_experience_provider(_experience_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.experiences e
    JOIN public.providers p ON p.id = e.provider_id
    WHERE e.id = _experience_id
      AND p.user_id = _user_id
  );
$$;

CREATE POLICY "Providers can update status of bookings on their experiences"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.experiences e
    JOIN public.providers p ON p.id = e.provider_id
    WHERE e.id = bookings.experience_id
      AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.experiences e
    JOIN public.providers p ON p.id = e.provider_id
    WHERE e.id = bookings.experience_id
      AND p.user_id = auth.uid()
  )
  AND status IN ('confirmed', 'cancelled', 'completed')
);

CREATE TRIGGER bookings_provider_update_guard
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.enforce_booking_provider_update();

-- PART B: fix organizer read policy on event_tickets
DROP POLICY IF EXISTS "Organizers can view tickets for their events" ON public.event_tickets;

CREATE POLICY "Organizers can view tickets for their events"
ON public.event_tickets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = event_tickets.event_id
      AND (
        e.organizer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.providers p
          WHERE p.id = e.organizer_id AND p.user_id = auth.uid()
        )
      )
  )
);