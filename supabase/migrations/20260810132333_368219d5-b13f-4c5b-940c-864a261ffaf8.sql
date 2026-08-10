-- ============================================================
-- 1. STATUS-BEARING CONTENT TABLES
-- Pattern (established today on posts / experiences / experience_slots):
--   anon           -> published only, and NEVER calls a definer function
--   authenticated  -> published OR own rows (drafts)
-- Owner columns that may hold either providers.id or an auth user id also
-- accept owns_provider_record(); authenticated has EXECUTE on it.
-- ============================================================

-- accommodations (host_id may hold providers.id)
DROP POLICY IF EXISTS "Accommodations are publicly readable" ON public.accommodations;
CREATE POLICY "Published accommodations are readable by guests"
ON public.accommodations FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Published accommodations and own drafts are readable"
ON public.accommodations FOR SELECT TO authenticated
USING (status = 'published' OR host_id = auth.uid() OR public.owns_provider_record(host_id, auth.uid()));

-- audio_tours (creator_id = auth user)
DROP POLICY IF EXISTS "Audio tours are publicly readable" ON public.audio_tours;
CREATE POLICY "Published audio tours are readable by guests"
ON public.audio_tours FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Published audio tours and own drafts are readable"
ON public.audio_tours FOR SELECT TO authenticated
USING (status = 'published' OR creator_id = auth.uid());

-- causes
DROP POLICY IF EXISTS "Causes are publicly readable" ON public.causes;
CREATE POLICY "Published causes are readable by guests"
ON public.causes FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Published causes and own drafts are readable"
ON public.causes FOR SELECT TO authenticated
USING (status = 'published' OR owner_id = auth.uid() OR public.owns_provider_record(owner_id, auth.uid()));

-- culture_actors
DROP POLICY IF EXISTS "Culture actors are publicly readable" ON public.culture_actors;
CREATE POLICY "Published culture actors are readable by guests"
ON public.culture_actors FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Published culture actors and own drafts are readable"
ON public.culture_actors FOR SELECT TO authenticated
USING (status = 'published' OR user_id = auth.uid());

-- meetups
DROP POLICY IF EXISTS "Meetups are publicly readable" ON public.meetups;
CREATE POLICY "Published meetups are readable by guests"
ON public.meetups FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Published meetups and own drafts are readable"
ON public.meetups FOR SELECT TO authenticated
USING (status = 'published' OR organizer_id = auth.uid() OR public.owns_provider_record(organizer_id, auth.uid()));

-- organizations
DROP POLICY IF EXISTS "Organizations are publicly readable" ON public.organizations;
CREATE POLICY "Published organizations are readable by guests"
ON public.organizations FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Published organizations and own drafts are readable"
ON public.organizations FOR SELECT TO authenticated
USING (status = 'published' OR owner_id = auth.uid());

-- products (seller_id may hold providers.id)
DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
CREATE POLICY "Published products are readable by guests"
ON public.products FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Published products and own drafts are readable"
ON public.products FOR SELECT TO authenticated
USING (status = 'published' OR seller_id = auth.uid() OR public.owns_provider_record(seller_id, auth.uid()));

-- providers (public column whitelist stays as-is; this only restricts ROWS)
DROP POLICY IF EXISTS "Providers are publicly readable" ON public.providers;
CREATE POLICY "Published providers are readable by guests"
ON public.providers FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Published providers and own record are readable"
ON public.providers FOR SELECT TO authenticated
USING (status = 'published' OR user_id = auth.uid());

-- transport (provider_id may hold providers.id)
DROP POLICY IF EXISTS "Transport is publicly readable" ON public.transport;
CREATE POLICY "Published transport is readable by guests"
ON public.transport FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Published transport and own drafts are readable"
ON public.transport FOR SELECT TO authenticated
USING (status = 'published' OR provider_id = auth.uid() OR public.owns_provider_record(provider_id, auth.uid()));

-- trips (organizer_id may hold providers.id)
DROP POLICY IF EXISTS "Trips are publicly readable" ON public.trips;
CREATE POLICY "Published trips are readable by guests"
ON public.trips FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Published trips and own drafts are readable"
ON public.trips FOR SELECT TO authenticated
USING (status = 'published' OR organizer_id = auth.uid() OR public.owns_provider_record(organizer_id, auth.uid()));

-- whos_who
DROP POLICY IF EXISTS "Who's who is publicly readable" ON public.whos_who;
CREATE POLICY "Published whos_who entries are readable by guests"
ON public.whos_who FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "Published whos_who entries and own drafts are readable"
ON public.whos_who FOR SELECT TO authenticated
USING (status = 'published' OR user_id = auth.uid());

-- ============================================================
-- 2. PROFILES — personalisation answers were world-readable.
-- Row read stays public (bylines, comment authors, chat partners need
-- display_name/avatar), but the private columns are removed from the
-- exposed column set, same technique as providers.contact_*.
-- ============================================================
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, user_id, display_name, avatar_url, bio, created_at, updated_at)
  ON public.profiles TO anon, authenticated;
GRANT ALL ON public.profiles TO service_role;

-- UPDATE had no WITH CHECK: a user could move their row to another user_id.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. SAVED_ITINERARIES — UPDATE had no WITH CHECK.
-- ============================================================
DROP POLICY IF EXISTS "Users can update their own itineraries" ON public.saved_itineraries;
CREATE POLICY "Users can update their own itineraries"
ON public.saved_itineraries FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. REGIONS — a redundant USING(true) policy defeated the is_active filter.
-- ============================================================
DROP POLICY IF EXISTS "Regions are publicly readable" ON public.regions;

-- ============================================================
-- 5. FUNCTION EXECUTE GRANTS
-- ============================================================
-- Used by the enforce_order_seller_update trigger, which is SECURITY INVOKER:
-- without this grant every seller/buyer order UPDATE fails on permission.
GRANT EXECUTE ON FUNCTION public.is_order_seller(uuid, uuid) TO authenticated;

-- Only authenticated policies call this; anon/PUBLIC never need it.
REVOKE EXECUTE ON FUNCTION public.owns_provider_record(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.owns_provider_record(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.owns_provider_record(uuid, uuid) TO authenticated;