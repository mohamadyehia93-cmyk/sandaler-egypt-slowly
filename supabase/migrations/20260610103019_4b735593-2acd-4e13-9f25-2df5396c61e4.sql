DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'listing-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Authenticated users can upload profile photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload profile photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Authenticated users can upload audio files" ON storage.objects;
CREATE POLICY "Authenticated users can upload audio files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'audio-files'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);