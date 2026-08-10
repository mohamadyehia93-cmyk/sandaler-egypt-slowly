-- L3 — atomic slot decrement for the Stripe webhook.
--
-- The webhook previously did read-modify-write on experience_slots
-- .spots_available. Two concurrent confirmations could both read the same
-- value and both write (value - guests), overselling the slot. PostgREST
-- cannot express `SET col = col - n`, so the arithmetic moves into SQL where
-- it is a single atomic statement.
--
-- Clamped at 0 to preserve the previous behaviour, and COALESCE-guarded
-- because spots_available is nullable.
--
-- CALLER: supabase/functions/stripe-webhook/index.ts, which runs with the
-- service role key. EXECUTE is granted to service_role only — anon and
-- authenticated must never be able to move availability directly. (Keeping
-- this grant matrix explicit is what the is_experience_provider incident was
-- about: if you revoke this, the webhook stops decrementing.)

CREATE OR REPLACE FUNCTION public.decrement_slot_spots(_slot_id uuid, _guests integer)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.experience_slots
     SET spots_available = GREATEST(
           COALESCE(spots_available, 0) - GREATEST(COALESCE(_guests, 0), 0),
           0
         )
   WHERE id = _slot_id
  RETURNING spots_available;
$$;

REVOKE ALL ON FUNCTION public.decrement_slot_spots(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_slot_spots(uuid, integer) TO service_role;
