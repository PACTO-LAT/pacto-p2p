-- Public bucket for token/asset logo images
-- Upload images as: token-logos/USDC.png, token-logos/XLM.png, etc.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'token-logos',
  'token-logos',
  TRUE,
  524288, -- 512 KB max
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read (public bucket)
CREATE POLICY "token_logos_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'token-logos');

-- Only admins can upload
CREATE POLICY "token_logos_admin_upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'token-logos'
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );
