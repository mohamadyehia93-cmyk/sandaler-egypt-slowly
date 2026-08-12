-- 1) events.organizer_id now holds providers.id (platform-wide ownership convention)
DROP POLICY IF EXISTS "Organizers and admins can read their own events" ON public.events;
DROP POLICY IF EXISTS "Organizers can delete their own events" ON public.events;
DROP POLICY IF EXISTS "Organizers can insert their own events" ON public.events;
DROP POLICY IF EXISTS "Organizers can update their own events" ON public.events;

CREATE POLICY "Organizers and admins can read their own events"
ON public.events FOR SELECT TO authenticated
USING (public.owns_provider_record(organizer_id, auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Organizers can insert their own events"
ON public.events FOR INSERT TO authenticated
WITH CHECK (public.owns_provider_record(organizer_id, auth.uid()));

CREATE POLICY "Organizers can update their own events"
ON public.events FOR UPDATE TO authenticated
USING (public.owns_provider_record(organizer_id, auth.uid()))
WITH CHECK (public.owns_provider_record(organizer_id, auth.uid()));

CREATE POLICY "Organizers can delete their own events"
ON public.events FOR DELETE TO authenticated
USING (public.owns_provider_record(organizer_id, auth.uid()));

-- 2) ticket visibility for the organizer, same convention
DROP POLICY IF EXISTS "Organizers can view tickets for their events" ON public.event_tickets;
CREATE POLICY "Organizers can view tickets for their events"
ON public.event_tickets FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.events e
  WHERE e.id = event_tickets.event_id
    AND public.owns_provider_record(e.organizer_id, auth.uid())
));

-- 3) audio tours: persist the theme chosen in the form (was form-only and lost on edit)
ALTER TABLE public.audio_tours ADD COLUMN IF NOT EXISTS theme text;