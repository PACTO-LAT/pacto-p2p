-- Migration: Add KYC provider tracking fields to users

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS kyc_provider TEXT,
  ADD COLUMN IF NOT EXISTS kyc_session_id TEXT,
  ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_kyc_session_id ON users(kyc_session_id);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
