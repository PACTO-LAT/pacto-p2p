-- =====================================================
-- User Profile Image Storage Setup
-- =====================================================
-- This migration sets up Supabase Storage for user profile images
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. Create Storage Bucket
-- =====================================================

-- Create the user-profiles bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-profiles',
  'user-profiles',
  true,  -- Public bucket for read access
  5242880,  -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']  -- Allowed MIME types
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. Storage Policies
-- =====================================================

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;

-- Policy: Allow authenticated users to upload their own avatars
-- Filename must start with their user ID
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- Policy: Allow public read access to all avatars
-- This allows anyone to view profile pictures
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-profiles');

-- Policy: Allow users to delete their own avatars
-- Users can only delete files that start with their user ID
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- Policy: Allow users to update their own avatars
-- Users can only update files that start with their user ID
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- =====================================================
-- 3. Verify Setup
-- =====================================================

-- Check if bucket was created
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'user-profiles';

-- Check if policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%avatars%'
ORDER BY policyname;

-- =====================================================
-- 4. Ensure users table has avatar_url column
-- =====================================================

-- Add avatar_url column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_avatar_url 
ON users(avatar_url) 
WHERE avatar_url IS NOT NULL;

-- =====================================================
-- 5. Verification Queries
-- =====================================================

-- Verify users table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'avatar_url';

-- =====================================================
-- Notes:
-- =====================================================
-- 
-- Bucket Structure:
--   user-profiles/
--   └── avatars/
--       ├── {user-id}-{uuid}.jpg
--       ├── {user-id}-{uuid}.png
--       └── {user-id}-{uuid}.webp
--
-- File Naming Convention:
--   Format: {user-id}-{uuid}.{extension}
--   Example: 550e8400-e29b-41d4-a716-446655440000-a1b2c3d4.jpg
--
-- Security:
--   - Users can only upload/delete files with their user ID prefix
--   - Public read access for all avatars (needed for display)
--   - File size limited to 5MB
--   - Only image formats allowed (JPEG, PNG, WebP)
--
-- =====================================================
