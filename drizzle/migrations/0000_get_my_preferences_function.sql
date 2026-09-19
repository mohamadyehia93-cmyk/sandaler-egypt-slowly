-- The private personalisation columns on public.profiles (interests, cities,
-- travel_style, budget) deliberately carry NO column-level SELECT grant, so a
-- signed-in user cannot read anyone's preferences — including their own.
-- This security-definer function returns ONLY the caller's own row, so the
-- profile screen can show and the edit screen can prefill their answers
-- without widening any grant or RLS policy.
CREATE OR REPLACE FUNCTION public.get_my_preferences()
RETURNS TABLE (
  interests text[],
  cities text[],
  travel_style text,
  budget text,
  preferred_language text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.interests, p.cities, p.travel_style, p.budget, p.preferred_language
  FROM public.profiles p
  WHERE p.user_id = auth.uid()
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_my_preferences() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_preferences() TO authenticated;
