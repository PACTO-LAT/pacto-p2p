-- Fix receipts bucket RLS: enforce ownership on INSERT and DELETE, remove UPDATE
-- Path structure changed to: {user_id}/{escrow_id}/{timestamp}_{uuid}.{ext}
-- This allows ownership to be derived from the first path segment via foldername()

-- Tighten INSERT: user can only upload to their own folder
DROP POLICY IF EXISTS "Users can upload receipts" ON storage.objects;
CREATE POLICY "Users can upload receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Remove UPDATE: receipts are immutable once uploaded
DROP POLICY IF EXISTS "Users can update receipts" ON storage.objects;

-- Tighten DELETE: only the uploader can delete their own receipts
DROP POLICY IF EXISTS "Users can delete receipts" ON storage.objects;
CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
