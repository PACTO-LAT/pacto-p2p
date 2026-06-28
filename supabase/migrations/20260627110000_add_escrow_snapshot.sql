-- Persist the full on-chain escrow snapshot (TLW Escrow shape) for the read API.
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS on_chain_snapshot JSONB;
