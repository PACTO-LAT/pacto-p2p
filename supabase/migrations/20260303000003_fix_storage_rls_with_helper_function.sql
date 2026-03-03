-- Fix storage RLS: subqueries to storage.buckets can fail due to RLS context.
-- Use SECURITY DEFINER function to get bucket id (bypasses RLS on storage.buckets).

CREATE OR REPLACE FUNCTION public.get_storage_bucket_id(bucket_name text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, storage
STABLE
AS $$
  SELECT id FROM storage.buckets WHERE name = bucket_name LIMIT 1;
$$;

-- user-profiles: drop and recreate all policies using the helper
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = public.get_storage_bucket_id('user-profiles'));

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id = public.get_storage_bucket_id('user-profiles'));

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = public.get_storage_bucket_id('user-profiles'))
WITH CHECK (bucket_id = public.get_storage_bucket_id('user-profiles'));

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = public.get_storage_bucket_id('user-profiles'));

-- merchant-media: drop and recreate all policies using the helper
DROP POLICY IF EXISTS "Users can upload avatar to merchant-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to merchant-media" ON storage.objects;
DROP POLICY IF EXISTS "Merchant media public read" ON storage.objects;
DROP POLICY IF EXISTS "Users can update merchant-media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete from merchant-media" ON storage.objects;

CREATE POLICY "Users can upload to merchant-media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = public.get_storage_bucket_id('merchant-media'));

CREATE POLICY "Merchant media public read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = public.get_storage_bucket_id('merchant-media'));

CREATE POLICY "Users can update merchant-media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = public.get_storage_bucket_id('merchant-media'))
WITH CHECK (bucket_id = public.get_storage_bucket_id('merchant-media'));

CREATE POLICY "Users can delete from merchant-media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = public.get_storage_bucket_id('merchant-media'));
