-- Owner-scoped listing on storage.objects.
-- Public rendering uses the public-bucket object URL, which bypasses RLS, so
-- these policies only affect the authenticated list/search path. anon gets no
-- SELECT policy at all, so anonymous enumeration stays denied.

DROP POLICY IF EXISTS "Users can list their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can list their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can list their own status images" ON storage.objects;
DROP POLICY IF EXISTS "Users can list their own audio files" ON storage.objects;

CREATE POLICY "Users can list their own profile photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Users can list their own listing images"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'listing-images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Users can list their own status images"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'provider-status-images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Users can list their own audio files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'audio-files'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- The existing UPDATE policies had no WITH CHECK, so a user could rename an
-- object out of their own folder. Pin the new row to their folder too.
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
CREATE POLICY "Users can update their own listing images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'listing-images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'listing-images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

DROP POLICY IF EXISTS "Users can update own status images" ON storage.objects;
CREATE POLICY "Users can update own status images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'provider-status-images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'provider-status-images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

DROP POLICY IF EXISTS "Users can update their own audio files" ON storage.objects;
CREATE POLICY "Users can update their own audio files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'audio-files'
  AND (storage.foldername(name))[1] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'audio-files'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);
