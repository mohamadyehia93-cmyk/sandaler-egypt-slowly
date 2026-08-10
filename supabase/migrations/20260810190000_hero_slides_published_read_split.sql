-- V1 — hero_slides: unpublished slides were world-readable.
--
-- "Hero slides are publicly readable" was FOR SELECT USING (true) while the
-- table carries status text DEFAULT 'published', so drafts were served to
-- anonymous callers. This was the last surviving instance of the always-true
-- read pattern fixed across the other tables in 20260810132333.
--
-- Same split as whos_who / experience_slots in that migration: an anon policy
-- filtered to published, and an authenticated policy that additionally exposes
-- drafts. hero_slides has no owner column (it is site-wide homepage content),
-- so "own drafts" becomes "admins" — has_role() is already granted to
-- authenticated and revoked from anon, and only the authenticated policy calls
-- it, so this keeps the definer-grant matrix consistent.

DROP POLICY IF EXISTS "Hero slides are publicly readable" ON public.hero_slides;

CREATE POLICY "Published hero slides are readable by guests"
ON public.hero_slides FOR SELECT TO anon
USING (status = 'published');

CREATE POLICY "Published hero slides and drafts are readable by admins"
ON public.hero_slides FOR SELECT TO authenticated
USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
