-- Persist on-chain escrow state indexed from TrustlessWork.
ALTER TABLE escrows
  ADD COLUMN IF NOT EXISTS balance NUMERIC(20,7),
  ADD COLUMN IF NOT EXISTS token_amount NUMERIC(20,7),
  ADD COLUMN IF NOT EXISTS on_chain_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS on_chain_status TEXT,
  ADD COLUMN IF NOT EXISTS last_indexed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_escrows_last_indexed_at ON escrows(last_indexed_at);
