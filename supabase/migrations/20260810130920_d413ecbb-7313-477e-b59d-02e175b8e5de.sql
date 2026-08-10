GRANT EXECUTE ON FUNCTION public.is_experience_provider(uuid, uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_experience_provider(uuid, uuid) FROM anon;