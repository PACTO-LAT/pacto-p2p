-- =============================================================================
-- Add Storage Bucket for User Avatars
-- Creates 'avatars' bucket in Supabase Storage with proper RLS policies
-- =============================================================================

-- This migration is idempotent - safe to run multiple times

-- ---------------------------------------------------------------------------
-- 1. Create avatars storage bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- ---------------------------------------------------------------------------
-- 2. Storage Policies: Users can upload their own avatars
-- ---------------------------------------------------------------------------

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Policy: Allow authenticated users to INSERT (upload) to their own folder
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public to SELECT (view) all avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Allow authenticated users to UPDATE their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to DELETE their own avatars
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ---------------------------------------------------------------------------
-- 3. Helper function: Clean up old user avatars
-- ---------------------------------------------------------------------------
-- This utility helps manage storage by removing outdated avatar files while
-- keeping the most recent uploads. Useful for preventing storage bloat when
-- users frequently update their profile pictures.
--
-- Security: Implements proper authorization to ensure users can only clean
-- their own avatar history, preventing unauthorized deletion of other users' files.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cleanup_old_user_avatars(
  user_uuid UUID, 
  keep_latest INTEGER DEFAULT 3
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Verify the calling user has permission to clean this user's avatars.
  -- This prevents any authenticated user from arbitrarily deleting another
  -- user's avatar history by passing a different UUID.
  IF auth.uid() IS NULL OR auth.uid() != user_uuid THEN
    RAISE EXCEPTION 'Authorization failed: Users may only manage their own avatar files';
  END IF;

  -- Identify avatars beyond the retention limit and remove them from storage.
  -- The ORDER BY created_at DESC ensures we preserve the most recent uploads.
  WITH old_avatars AS (
    SELECT name
    FROM storage.objects
    WHERE bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = user_uuid::text
    ORDER BY created_at DESC
    OFFSET keep_latest
  )
  DELETE FROM storage.objects
  WHERE bucket_id = 'avatars'
    AND name IN (SELECT name FROM old_avatars);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_user_avatars IS 
'Removes outdated avatar files for the authenticated user while preserving the N most recent uploads. '
'Returns the count of deleted files. Includes authorization check to prevent cross-user deletion.';

-- Grant execution rights to authenticated users since the function
-- already enforces user-specific authorization internally
GRANT EXECUTE ON FUNCTION public.cleanup_old_user_avatars(UUID, INTEGER) TO authenticated;