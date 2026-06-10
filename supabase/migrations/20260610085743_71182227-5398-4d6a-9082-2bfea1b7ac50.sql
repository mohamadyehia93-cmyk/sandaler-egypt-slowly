-- 1. Set a fixed search_path on the only function missing one
ALTER FUNCTION public.touch_bookings_updated_at() SET search_path = public;

-- 2. handle_new_user is a trigger-only SECURITY DEFINER function — it should
--    never be callable directly via the API by any client role.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 3. has_role is SECURITY DEFINER and used inside RLS policies for signed-in
--    users. Remove anon/public execute access; keep it for authenticated only.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;