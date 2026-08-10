REVOKE EXECUTE ON FUNCTION public.resolve_owner_user_id(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_reservation_request_insert() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_support_pledge_insert() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_reservation_request_update() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_support_pledge_update() FROM anon, authenticated, PUBLIC;