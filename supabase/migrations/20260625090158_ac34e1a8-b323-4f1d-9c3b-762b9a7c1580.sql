-- 1. Restrict follows table reads to the owner's own rows
DROP POLICY IF EXISTS "Authenticated users can view follows" ON public.follows;
CREATE POLICY "Users can view their own follows"
ON public.follows
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Public follower counts still work without exposing rows
CREATE OR REPLACE FUNCTION public.get_follower_count(_target_type text, _target_id text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::int
  FROM public.follows
  WHERE target_type = _target_type
    AND target_id = _target_id;
$$;

REVOKE ALL ON FUNCTION public.get_follower_count(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_follower_count(text, text) TO anon, authenticated;

-- 2. Remove broad SELECT (listing) policies on public storage buckets.
-- Public buckets continue serving files through the public object URL.
DROP POLICY IF EXISTS "Audio files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Listing images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Profile photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Status images are publicly accessible" ON storage.objects;