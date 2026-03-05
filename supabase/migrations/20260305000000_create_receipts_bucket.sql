-- Create receipts bucket for trade payment evidence (images, PDFs)
-- Path structure: {escrow_id}/{timestamp}_{filename}
-- Public read for receipt URLs passed as TLW milestone evidence

DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'receipts',
    'receipts',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
  )
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DROP POLICY IF EXISTS "Users can upload receipts" ON storage.objects;
CREATE POLICY "Users can upload receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Receipts are publicly accessible" ON storage.objects;
CREATE POLICY "Receipts are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Users can update receipts" ON storage.objects;
CREATE POLICY "Users can update receipts"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'receipts')
WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Users can delete receipts" ON storage.objects;
CREATE POLICY "Users can delete receipts"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'receipts');
