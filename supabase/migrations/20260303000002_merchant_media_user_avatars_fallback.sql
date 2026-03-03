-- Fallback bucket for user avatars when user-profiles is not available
-- ProfileInfo uses merchant-media with path user-avatars/{user-id}-{uuid}.{ext}
-- Creates bucket and policies if merchant-media doesn't exist

DO $$
BEGIN
  -- In Supabase, bucket id must equal name (text, not UUID)
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('merchant-media', 'merchant-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- INSERT: authenticated users can upload to user-avatars (avatar fallback) and merchant folders
DROP POLICY IF EXISTS "Users can upload avatar to merchant-media" ON storage.objects;
CREATE POLICY "Users can upload to merchant-media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'merchant-media')
);

-- SELECT: public read for avatars, banners, merchant media
DROP POLICY IF EXISTS "Merchant media public read" ON storage.objects;
CREATE POLICY "Merchant media public read"
ON storage.objects FOR SELECT TO public
USING (
  bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'merchant-media')
);

-- UPDATE: authenticated users can update their files in merchant-media
DROP POLICY IF EXISTS "Users can update merchant-media" ON storage.objects;
CREATE POLICY "Users can update merchant-media"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'merchant-media')
)
WITH CHECK (
  bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'merchant-media')
);

-- DELETE: authenticated users can delete their files in merchant-media
DROP POLICY IF EXISTS "Users can delete from merchant-media" ON storage.objects;
CREATE POLICY "Users can delete from merchant-media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id IN (SELECT id FROM storage.buckets WHERE name = 'merchant-media')
);
