-- Consolidate storage policies using direct bucket name comparison.
-- Since bucket id = name = 'user-profiles' (fixed in migration 000000),
-- bucket_id in storage.objects is the string 'user-profiles', not a UUID.
-- No need for helper functions or subqueries.

-- Drop all previous policy iterations to avoid conflicts
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatar to merchant-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to merchant-media" ON storage.objects;
DROP POLICY IF EXISTS "Merchant media public read" ON storage.objects;
DROP POLICY IF EXISTS "Users can update merchant-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete from merchant-media" ON storage.objects;

-- user-profiles: bucket_id = 'user-profiles' (the bucket's id equals its name)
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-profiles');

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'user-profiles');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'user-profiles')
WITH CHECK (bucket_id = 'user-profiles');

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-profiles');

-- merchant-media
CREATE POLICY "Users can upload to merchant-media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'merchant-media');

CREATE POLICY "Merchant media public read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'merchant-media');

CREATE POLICY "Users can update merchant-media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'merchant-media')
WITH CHECK (bucket_id = 'merchant-media');

CREATE POLICY "Users can delete from merchant-media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'merchant-media');
