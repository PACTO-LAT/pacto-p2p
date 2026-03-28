-- Add contract_id to escrows table to store the on-chain Soroban contract identifier.
-- This is required to make subsequent TrustlessWork API calls (fund, dispute, release)
-- that can be linked back to a Supabase record.
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS contract_id TEXT;

CREATE INDEX IF NOT EXISTS idx_escrows_contract_id ON escrows(contract_id);
