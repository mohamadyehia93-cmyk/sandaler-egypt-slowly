REVOKE ALL ON FUNCTION public.is_experience_provider(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_booking_provider_update() FROM PUBLIC, anon, authenticated;