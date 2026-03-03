-- Fix storage policies: bucket_id in storage.objects is the bucket's UUID, not the name
-- The previous migration used bucket_id = 'user-profiles' which never matched

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'user-profiles')
);

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (
  bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'user-profiles')
);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'user-profiles')
);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'user-profiles')
);
