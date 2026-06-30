-- Tighten bookings RLS: restrict to authenticated role explicitly
DROP POLICY IF EXISTS "Visitors can create their own bookings"        ON public.bookings;
DROP POLICY IF EXISTS "Visitors can read their own bookings"          ON public.bookings;
DROP POLICY IF EXISTS "Providers can read bookings on their experiences" ON public.bookings;

CREATE POLICY "Visitors can create their own bookings"
  ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = visitor_id);

CREATE POLICY "Visitors can read their own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = visitor_id);

CREATE POLICY "Providers can read bookings on their experiences"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = provider_id);