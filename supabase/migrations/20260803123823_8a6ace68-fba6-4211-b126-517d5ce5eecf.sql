DROP POLICY IF EXISTS "Published events are publicly readable" ON public.events;

CREATE POLICY "Published events are publicly readable"
ON public.events FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "Organizers and admins can read their own events"
ON public.events FOR SELECT
TO authenticated
USING (auth.uid() = organizer_id OR public.has_role(auth.uid(), 'admin'));