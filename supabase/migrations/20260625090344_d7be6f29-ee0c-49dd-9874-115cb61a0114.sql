-- Explicitly deny direct client updates on bookings.
-- Server-side edge functions use the service role, which bypasses RLS.
CREATE POLICY "Bookings cannot be updated by clients"
ON public.bookings
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);