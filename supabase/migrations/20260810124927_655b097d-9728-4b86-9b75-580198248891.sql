-- 1. Helper: does this user own this provider record?
CREATE OR REPLACE FUNCTION public.owns_provider_record(_provider_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.providers p
    WHERE p.id = _provider_id AND p.user_id = _user_id
  )
$$;

-- 2. Enforce the convention structurally (all current rows already comply).
ALTER TABLE public.experiences
  ADD CONSTRAINT experiences_provider_id_fkey
  FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE SET NULL;

-- 3. experiences write policies -> provider record convention
DROP POLICY IF EXISTS "Providers can insert experiences" ON public.experiences;
DROP POLICY IF EXISTS "Providers can update own experiences" ON public.experiences;
DROP POLICY IF EXISTS "Providers can delete own experiences" ON public.experiences;

CREATE POLICY "Providers can insert experiences"
ON public.experiences FOR INSERT TO authenticated
WITH CHECK (public.owns_provider_record(provider_id, auth.uid()));

CREATE POLICY "Providers can update own experiences"
ON public.experiences FOR UPDATE TO authenticated
USING (public.owns_provider_record(provider_id, auth.uid()))
WITH CHECK (public.owns_provider_record(provider_id, auth.uid()));

CREATE POLICY "Providers can delete own experiences"
ON public.experiences FOR DELETE TO authenticated
USING (public.owns_provider_record(provider_id, auth.uid()));

-- 4. experience_slots policies -> same convention (via is_experience_provider)
DROP POLICY IF EXISTS "Providers can insert slots" ON public.experience_slots;
DROP POLICY IF EXISTS "Providers can update own slots" ON public.experience_slots;
DROP POLICY IF EXISTS "Providers can delete own slots" ON public.experience_slots;

CREATE POLICY "Providers can insert slots"
ON public.experience_slots FOR INSERT TO authenticated
WITH CHECK (public.is_experience_provider(experience_id, auth.uid()));

CREATE POLICY "Providers can update own slots"
ON public.experience_slots FOR UPDATE TO authenticated
USING (public.is_experience_provider(experience_id, auth.uid()))
WITH CHECK (public.is_experience_provider(experience_id, auth.uid()));

CREATE POLICY "Providers can delete own slots"
ON public.experience_slots FOR DELETE TO authenticated
USING (public.is_experience_provider(experience_id, auth.uid()));

-- 5. bookings SELECT for providers: accept either the denormalised user id
--    or ownership resolved through the provider record.
DROP POLICY IF EXISTS "Providers can read bookings on their experiences" ON public.bookings;
CREATE POLICY "Providers can read bookings on their experiences"
ON public.bookings FOR SELECT TO authenticated
USING (
  auth.uid() = provider_id
  OR public.is_experience_provider(experience_id, auth.uid())
);
