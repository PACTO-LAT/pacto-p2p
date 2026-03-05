-- RLS for trades: users can view trades they're involved in (buyer or seller)
-- Required for trade history in dashboard

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at);

DROP POLICY IF EXISTS trades_select_own ON trades;
CREATE POLICY trades_select_own ON trades
  FOR SELECT
  USING (
    buyer_id = auth.uid() OR seller_id = auth.uid()
  );
