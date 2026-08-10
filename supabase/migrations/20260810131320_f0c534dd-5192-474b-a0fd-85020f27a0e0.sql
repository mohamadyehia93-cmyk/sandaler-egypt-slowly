-- Experiences: public read was USING(true), which exposed draft listings publicly.
DROP POLICY IF EXISTS "Experiences are publicly readable" ON public.experiences;

CREATE POLICY "Published experiences are readable by guests"
ON public.experiences FOR SELECT TO anon
USING (status = 'published');

CREATE POLICY "Published experiences and own drafts are readable"
ON public.experiences FOR SELECT TO authenticated
USING (status = 'published' OR public.owns_provider_record(provider_id, auth.uid()));

-- Slots: same problem — availability of a draft listing was public.
DROP POLICY IF EXISTS "Slots are publicly readable" ON public.experience_slots;

CREATE POLICY "Slots of published experiences are readable by guests"
ON public.experience_slots FOR SELECT TO anon
USING (EXISTS (
  SELECT 1 FROM public.experiences e
  WHERE e.id = experience_slots.experience_id AND e.status = 'published'
));

CREATE POLICY "Slots of published experiences and own slots are readable"
ON public.experience_slots FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = experience_slots.experience_id AND e.status = 'published'
  )
  OR public.is_experience_provider(experience_slots.experience_id, auth.uid())
);