-- Migration: Add transaction_hashes column to escrows table
-- Stores Stellar transaction hashes for each escrow action (init, fund, confirm, release, dispute)
-- Format: { "init": "txHash...", "fund": "txHash...", "confirm": "txHash...", "release": "txHash...", "dispute": "txHash..." }

-- Add transaction_hashes JSONB column to escrows table
ALTER TABLE escrows 
ADD COLUMN IF NOT EXISTS transaction_hashes JSONB DEFAULT '{}'::jsonb;

-- Add index for querying by transaction hash (useful for lookups)
CREATE INDEX IF NOT EXISTS idx_escrows_transaction_hashes 
ON escrows USING GIN (transaction_hashes);

-- Add comment for documentation
COMMENT ON COLUMN escrows.transaction_hashes IS 
'JSONB object storing Stellar transaction hashes per escrow action: { init, fund, confirm, release, dispute }';
