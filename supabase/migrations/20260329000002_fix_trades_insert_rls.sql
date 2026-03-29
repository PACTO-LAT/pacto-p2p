-- Allow authenticated users to insert trades where they are buyer or seller
DROP POLICY IF EXISTS trades_insert_own ON trades;
CREATE POLICY trades_insert_own ON trades
  FOR INSERT
  WITH CHECK (
    buyer_id = auth.uid() OR seller_id = auth.uid()
  );
