-- Migration: Create public storage bucket for chat attachments
-- Required so image/file attachments sent in trade chats can be displayed

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  true,
  10485760, -- 10 MB
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'application/pdf'
  ];

-- Allow authenticated users to upload attachments
DROP POLICY IF EXISTS chat_attachments_insert ON storage.objects;
CREATE POLICY chat_attachments_insert ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-attachments');

-- Allow public read access (bucket is public, but belt-and-suspenders)
DROP POLICY IF EXISTS chat_attachments_select ON storage.objects;
CREATE POLICY chat_attachments_select ON storage.objects
  FOR SELECT
  USING (bucket_id = 'chat-attachments');

-- Allow users to delete their own uploads
DROP POLICY IF EXISTS chat_attachments_delete ON storage.objects;
CREATE POLICY chat_attachments_delete ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
