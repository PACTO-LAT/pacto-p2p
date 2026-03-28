-- One chat room per escrow
CREATE TABLE trade_chats (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id     UUID REFERENCES escrows(id) ON DELETE CASCADE,
  engagement_id TEXT NOT NULL UNIQUE,
  buyer_id      UUID NOT NULL REFERENCES users(id),
  seller_id     UUID NOT NULL REFERENCES users(id),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trade_chats_escrow_id     ON trade_chats(escrow_id);
CREATE INDEX idx_trade_chats_engagement_id ON trade_chats(engagement_id);
CREATE INDEX idx_trade_chats_buyer_id      ON trade_chats(buyer_id);
CREATE INDEX idx_trade_chats_seller_id     ON trade_chats(seller_id);

-- Messages (persisted)
CREATE TABLE trade_messages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id        UUID NOT NULL REFERENCES trade_chats(id) ON DELETE CASCADE,
  sender_id      UUID REFERENCES users(id),
  content        TEXT NOT NULL,
  message_type   TEXT NOT NULL DEFAULT 'text'
                   CHECK (message_type IN ('text', 'image', 'file', 'system')),
  attachment_url TEXT,
  is_read        BOOLEAN DEFAULT FALSE,
  read_at        TIMESTAMPTZ,
  metadata       JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trade_messages_chat_id    ON trade_messages(chat_id);
CREATE INDEX idx_trade_messages_sender_id  ON trade_messages(sender_id);
CREATE INDEX idx_trade_messages_created_at ON trade_messages(created_at);
CREATE INDEX idx_trade_messages_is_read    ON trade_messages(is_read);

-- RLS
ALTER TABLE trade_chats    ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_parties ON trade_chats FOR ALL
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY message_parties ON trade_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM trade_chats c
      WHERE c.id = trade_messages.chat_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE trade_messages;

-- Storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  FALSE,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: only the two parties of the chat can upload/read
CREATE POLICY "chat_parties_upload" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM trade_chats c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

CREATE POLICY "chat_parties_read" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-attachments'
    AND EXISTS (
      SELECT 1 FROM trade_chats c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );
