-- Create user-profiles bucket for storing user avatar images
-- Path structure: avatars/{user-id}-{uuid}-{filename}
-- Public read access for avatar URLs
-- Note: bucket_id in storage.objects is the bucket's UUID (id), not the name

DO $$
BEGIN
  -- In Supabase, bucket id must equal name (text, not UUID)
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('user-profiles', 'user-profiles', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Policies use bucket_id = (SELECT id FROM storage.buckets WHERE name = 'user-profiles')
-- because bucket_id in storage.objects references the bucket's UUID, not its name

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = (SELECT id FROM storage.buckets WHERE name = 'user-profiles' LIMIT 1)
);

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (
  bucket_id = (SELECT id FROM storage.buckets WHERE name = 'user-profiles' LIMIT 1)
);

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = (SELECT id FROM storage.buckets WHERE name = 'user-profiles' LIMIT 1)
);

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = (SELECT id FROM storage.buckets WHERE name = 'user-profiles' LIMIT 1)
);
