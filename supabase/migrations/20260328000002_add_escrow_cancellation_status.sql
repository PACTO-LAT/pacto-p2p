-- Support platform-side cancellation of stale, unfunded escrows.

ALTER TABLE escrows
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('active', 'cancelled', 'completed', 'resolved'));

ALTER TABLE escrows
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_escrows_status ON escrows(status);
CREATE INDEX IF NOT EXISTS idx_escrows_cancelled_at ON escrows(cancelled_at);

DROP POLICY IF EXISTS trades_insert_own ON trades;
CREATE POLICY trades_insert_own ON trades
  FOR INSERT
  WITH CHECK (
    buyer_id = auth.uid() OR seller_id = auth.uid()
  );

DROP POLICY IF EXISTS trades_update_own ON trades;
CREATE POLICY trades_update_own ON trades
  FOR UPDATE
  USING (
    buyer_id = auth.uid() OR seller_id = auth.uid()
  );
