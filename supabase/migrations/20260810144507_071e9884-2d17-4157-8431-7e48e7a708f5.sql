-- accommodations
DROP POLICY IF EXISTS "Hosts can insert accommodations" ON public.accommodations;
DROP POLICY IF EXISTS "Hosts can update own accommodations" ON public.accommodations;
DROP POLICY IF EXISTS "Hosts can delete own accommodations" ON public.accommodations;
CREATE POLICY "Hosts can insert accommodations" ON public.accommodations FOR INSERT TO authenticated
  WITH CHECK (public.owns_provider_record(host_id, auth.uid()));
CREATE POLICY "Hosts can update own accommodations" ON public.accommodations FOR UPDATE TO authenticated
  USING (public.owns_provider_record(host_id, auth.uid()))
  WITH CHECK (public.owns_provider_record(host_id, auth.uid()));
CREATE POLICY "Hosts can delete own accommodations" ON public.accommodations FOR DELETE TO authenticated
  USING (public.owns_provider_record(host_id, auth.uid()));

-- transport
DROP POLICY IF EXISTS "Providers can insert transport" ON public.transport;
DROP POLICY IF EXISTS "Providers can update own transport" ON public.transport;
DROP POLICY IF EXISTS "Providers can delete own transport" ON public.transport;
CREATE POLICY "Providers can insert transport" ON public.transport FOR INSERT TO authenticated
  WITH CHECK (public.owns_provider_record(provider_id, auth.uid()));
CREATE POLICY "Providers can update own transport" ON public.transport FOR UPDATE TO authenticated
  USING (public.owns_provider_record(provider_id, auth.uid()))
  WITH CHECK (public.owns_provider_record(provider_id, auth.uid()));
CREATE POLICY "Providers can delete own transport" ON public.transport FOR DELETE TO authenticated
  USING (public.owns_provider_record(provider_id, auth.uid()));

-- products
DROP POLICY IF EXISTS "Sellers can insert products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete own products" ON public.products;
CREATE POLICY "Sellers can insert products" ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.owns_provider_record(seller_id, auth.uid()));
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE TO authenticated
  USING (public.owns_provider_record(seller_id, auth.uid()))
  WITH CHECK (public.owns_provider_record(seller_id, auth.uid()));
CREATE POLICY "Sellers can delete own products" ON public.products FOR DELETE TO authenticated
  USING (public.owns_provider_record(seller_id, auth.uid()));

-- trips
DROP POLICY IF EXISTS "Organizers can insert trips" ON public.trips;
DROP POLICY IF EXISTS "Organizers can update own trips" ON public.trips;
DROP POLICY IF EXISTS "Organizers can delete own trips" ON public.trips;
CREATE POLICY "Organizers can insert trips" ON public.trips FOR INSERT TO authenticated
  WITH CHECK (public.owns_provider_record(organizer_id, auth.uid()));
CREATE POLICY "Organizers can update own trips" ON public.trips FOR UPDATE TO authenticated
  USING (public.owns_provider_record(organizer_id, auth.uid()))
  WITH CHECK (public.owns_provider_record(organizer_id, auth.uid()));
CREATE POLICY "Organizers can delete own trips" ON public.trips FOR DELETE TO authenticated
  USING (public.owns_provider_record(organizer_id, auth.uid()));