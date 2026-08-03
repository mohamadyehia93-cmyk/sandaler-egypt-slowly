ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS review_notes text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

ALTER TABLE public.events ALTER COLUMN status SET DEFAULT 'draft';

CREATE OR REPLACE FUNCTION public.enforce_event_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean := public.has_role(auth.uid(), 'admin');
BEGIN
  IF NEW.status IS NULL OR NEW.status NOT IN ('draft','pending','published','rejected') THEN
    RAISE EXCEPTION 'Invalid event status: %', NEW.status;
  END IF;

  IF NOT is_admin AND NEW.status IN ('published','rejected') THEN
    IF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status THEN
      RAISE EXCEPTION 'Only administrators can publish or reject events';
    END IF;
  END IF;

  IF NOT is_admin THEN
    NEW.review_notes := CASE WHEN TG_OP = 'UPDATE' THEN OLD.review_notes ELSE NULL END;
    NEW.reviewed_at := CASE WHEN TG_OP = 'UPDATE' THEN OLD.reviewed_at ELSE NULL END;
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('published','rejected') THEN
    NEW.reviewed_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_event_status_transition_trg ON public.events;
CREATE TRIGGER enforce_event_status_transition_trg
BEFORE INSERT OR UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.enforce_event_status_transition();

DROP POLICY IF EXISTS "Organizers can update their own events" ON public.events;
CREATE POLICY "Organizers can update their own events"
ON public.events FOR UPDATE TO authenticated
USING (auth.uid() = organizer_id)
WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Admins can update any event" ON public.events;
CREATE POLICY "Admins can update any event"
ON public.events FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Published events are publicly readable" ON public.events;
CREATE POLICY "Published events are publicly readable"
ON public.events FOR SELECT
USING (status = 'published' OR auth.uid() = organizer_id OR public.has_role(auth.uid(), 'admin'));

REVOKE EXECUTE ON FUNCTION public.enforce_event_status_transition() FROM anon;