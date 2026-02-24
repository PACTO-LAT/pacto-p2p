-- Migration: Create core market tables (listings, trades, waitlist_submissions)
-- Derived from supabase/seed.sql to align schema for prod/local.

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_id UUID,
  type VARCHAR NOT NULL,
  token VARCHAR NOT NULL,
  amount NUMERIC(20,7) NOT NULL CHECK (amount > 0),
  rate NUMERIC(20,7) NOT NULL CHECK (rate > 0),
  fiat_currency VARCHAR NOT NULL,
  payment_method VARCHAR NOT NULL,
  min_amount NUMERIC(20,7) NOT NULL CHECK (min_amount >= 0),
  max_amount NUMERIC(20,7) NOT NULL CHECK (max_amount >= min_amount),
  description TEXT,
  status VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_merchant_id_core ON listings(merchant_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_token ON listings(token);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  buyer_id UUID,
  seller_id UUID,
  token VARCHAR NOT NULL,
  token_amount NUMERIC(20,7) NOT NULL CHECK (token_amount > 0),
  fiat_amount NUMERIC(20,2) NOT NULL CHECK (fiat_amount >= 0),
  fiat_currency VARCHAR NOT NULL,
  rate NUMERIC(20,7) NOT NULL CHECK (rate > 0),
  payment_method VARCHAR NOT NULL,
  stellar_transaction_hash TEXT,
  stellar_operation_id TEXT,
  status VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_trades_listing_id ON trades(listing_id);
CREATE INDEX IF NOT EXISTS idx_trades_buyer_id ON trades(buyer_id);
CREATE INDEX IF NOT EXISTS idx_trades_seller_id ON trades(seller_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);

-- Waitlist submissions table
CREATE TABLE IF NOT EXISTS waitlist_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  role TEXT,
  country TEXT,
  source TEXT,
  use_case TEXT,
  notes TEXT,
  otp TEXT,
  otp_expires_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_submissions(email);

