-- =============================================================================
-- Initial migration for Pacto P2P
-- Based on DATABASE_SCHEMA.md — the canonical schema reference
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Utility function: auto-update updated_at on row changes
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 1. users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  stellar_address VARCHAR(56) UNIQUE,
  reputation_score DECIMAL(3,2) DEFAULT 0.00 CHECK (reputation_score >= 0 AND reputation_score <= 5),
  total_trades INTEGER DEFAULT 0,
  total_volume DECIMAL(20,7) DEFAULT 0,
  full_name TEXT,
  username VARCHAR(50) UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  phone VARCHAR(20),
  country VARCHAR(2),
  kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  notifications JSONB,
  security JSONB,
  payment_methods JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_stellar_address ON users(stellar_address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);

-- ---------------------------------------------------------------------------
-- 2. merchants
-- ---------------------------------------------------------------------------
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'revoked')),
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  location TEXT,
  languages TEXT[],
  socials JSONB,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_trades INTEGER DEFAULT 0,
  volume_traded NUMERIC(20,7) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_merchants_user_id ON merchants(user_id);
CREATE INDEX idx_merchants_slug ON merchants(slug);
CREATE INDEX idx_merchants_is_public ON merchants(is_public);
CREATE INDEX idx_merchants_verification_status ON merchants(verification_status);

-- ---------------------------------------------------------------------------
-- 3. listings (depends on users, merchants)
-- ---------------------------------------------------------------------------
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('buy', 'sell')),
  token VARCHAR(10) NOT NULL CHECK (token IN ('USDC', 'CRCX', 'MXNX')),
  amount DECIMAL(20,7) NOT NULL CHECK (amount > 0),
  rate DECIMAL(20,7) NOT NULL CHECK (rate > 0),
  fiat_currency VARCHAR(3) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  min_amount DECIMAL(20,7) CHECK (min_amount > 0),
  max_amount DECIMAL(20,7) CHECK (max_amount > 0),
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_amount_range CHECK (max_amount IS NULL OR min_amount IS NULL OR max_amount >= min_amount)
);

CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_merchant_id ON listings(merchant_id);
CREATE INDEX idx_listings_token ON listings(token);
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at);

-- ---------------------------------------------------------------------------
-- 4. escrows (depends on listings, users)
-- ---------------------------------------------------------------------------
CREATE TABLE escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  trustless_work_contract_id VARCHAR(100) UNIQUE NOT NULL,
  engagement_id TEXT NOT NULL,
  token VARCHAR(10) NOT NULL CHECK (token IN ('USDC', 'CRCX', 'MXNX')),
  amount DECIMAL(20,7) NOT NULL CHECK (amount > 0),
  fiat_amount DECIMAL(20,2) NOT NULL CHECK (fiat_amount > 0),
  fiat_currency VARCHAR(3) NOT NULL,
  platform_fee DECIMAL(20,7) DEFAULT 0 CHECK (platform_fee >= 0),
  approver_address VARCHAR(56) NOT NULL,
  service_provider_address VARCHAR(56) NOT NULL,
  release_signer_address VARCHAR(56) NOT NULL,
  receiver_address VARCHAR(56) NOT NULL,
  platform_address VARCHAR(56) NOT NULL,
  dispute_resolver_address VARCHAR(56) NOT NULL,
  status VARCHAR(30) DEFAULT 'created' CHECK (status IN ('created', 'funded', 'awaiting_payment', 'payment_reported', 'payment_confirmed', 'released', 'disputed', 'resolved', 'cancelled')),
  payment_receipt_url TEXT,
  payment_evidence TEXT,
  is_disputed BOOLEAN DEFAULT FALSE,
  is_released BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  balance DECIMAL(20,7) DEFAULT 0 CHECK (balance >= 0),
  trustline_address VARCHAR(56) NOT NULL,
  trustline_name VARCHAR(10) NOT NULL,
  receiver_memo INTEGER DEFAULT 0,
  dispute_started_by VARCHAR(56),
  funded_by VARCHAR(56),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_escrows_listing_id ON escrows(listing_id);
CREATE INDEX idx_escrows_buyer_id ON escrows(buyer_id);
CREATE INDEX idx_escrows_seller_id ON escrows(seller_id);
CREATE INDEX idx_escrows_contract_id ON escrows(trustless_work_contract_id);
CREATE INDEX idx_escrows_status ON escrows(status);
CREATE INDEX idx_escrows_is_active ON escrows(is_active);
CREATE INDEX idx_escrows_created_at ON escrows(created_at);

-- ---------------------------------------------------------------------------
-- 5. escrow_milestones (depends on escrows)
-- ---------------------------------------------------------------------------
CREATE TABLE escrow_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
  milestone_index INTEGER NOT NULL CHECK (milestone_index >= 0),
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'pendingApproval', 'approved', 'rejected')),
  evidence TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (escrow_id, milestone_index)
);

CREATE INDEX idx_escrow_milestones_escrow_id ON escrow_milestones(escrow_id);
CREATE INDEX idx_escrow_milestones_status ON escrow_milestones(status);

-- ---------------------------------------------------------------------------
-- 6. trades (depends on escrows, listings, users)
-- ---------------------------------------------------------------------------
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES escrows(id),
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),
  token VARCHAR(10) NOT NULL CHECK (token IN ('USDC', 'CRCX', 'MXNX')),
  token_amount DECIMAL(20,7) NOT NULL CHECK (token_amount > 0),
  fiat_amount DECIMAL(20,2) NOT NULL CHECK (fiat_amount > 0),
  fiat_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(20,7) NOT NULL CHECK (rate > 0),
  payment_method VARCHAR(50) NOT NULL,
  stellar_transaction_hash VARCHAR(64),
  stellar_operation_id VARCHAR(64),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'disputed', 'resolved')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trades_escrow_id ON trades(escrow_id);
CREATE INDEX idx_trades_listing_id ON trades(listing_id);
CREATE INDEX idx_trades_buyer_id ON trades(buyer_id);
CREATE INDEX idx_trades_seller_id ON trades(seller_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_created_at ON trades(created_at);

-- ---------------------------------------------------------------------------
-- 7. token_operations (depends on users)
-- ---------------------------------------------------------------------------
CREATE TABLE token_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type VARCHAR(10) NOT NULL CHECK (operation_type IN ('mint', 'burn')),
  token VARCHAR(10) NOT NULL CHECK (token IN ('USDC', 'CRCX', 'MXNX')),
  amount DECIMAL(20,7) NOT NULL CHECK (amount > 0),
  stellar_address VARCHAR(56) NOT NULL,
  transaction_hash VARCHAR(64),
  memo TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_token_operations_type ON token_operations(operation_type);
CREATE INDEX idx_token_operations_token ON token_operations(token);
CREATE INDEX idx_token_operations_status ON token_operations(status);
CREATE INDEX idx_token_operations_stellar_address ON token_operations(stellar_address);
CREATE INDEX idx_token_operations_created_at ON token_operations(created_at);

-- ---------------------------------------------------------------------------
-- 8. waitlist_submissions (standalone)
-- ---------------------------------------------------------------------------
CREATE TABLE waitlist_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  company TEXT,
  role TEXT,
  country TEXT,
  source TEXT,
  use_case TEXT,
  notes TEXT,
  otp VARCHAR(6),
  otp_expires_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_waitlist_email ON waitlist_submissions(email);
CREATE INDEX idx_waitlist_otp_expires ON waitlist_submissions(otp_expires_at);
CREATE INDEX idx_waitlist_verified_at ON waitlist_submissions(verified_at);

-- ---------------------------------------------------------------------------
-- 9. Triggers — auto-update updated_at
-- ---------------------------------------------------------------------------
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchants_updated_at
  BEFORE UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrows_updated_at
  BEFORE UPDATE ON escrows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_milestones_updated_at
  BEFORE UPDATE ON escrow_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_operations_updated_at
  BEFORE UPDATE ON token_operations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON waitlist_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 10. Row Level Security
-- ---------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_submissions ENABLE ROW LEVEL SECURITY;

-- Users: can view/update/insert own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Merchants: public merchants visible to all, owners manage their own
CREATE POLICY "Anyone can view public merchants"
  ON merchants FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Merchants can manage own profile"
  ON merchants FOR ALL
  USING (user_id = auth.uid());

-- Listings: active listings visible to all, owners manage their own
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can view own listings"
  ON listings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own listings"
  ON listings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (user_id = auth.uid());

-- Escrows: participants can view/create/update
CREATE POLICY "Users can view own escrows"
  ON escrows FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can create escrows"
  ON escrows FOR INSERT
  WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can update own escrows"
  ON escrows FOR UPDATE
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Escrow milestones: participants can view/manage
CREATE POLICY "Users can view escrow milestones"
  ON escrow_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrows
      WHERE escrows.id = escrow_milestones.escrow_id
        AND (escrows.buyer_id = auth.uid() OR escrows.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage escrow milestones"
  ON escrow_milestones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM escrows
      WHERE escrows.id = escrow_milestones.escrow_id
        AND (escrows.buyer_id = auth.uid() OR escrows.seller_id = auth.uid())
    )
  );

-- Trades: participants can view/create
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Users can create trades"
  ON trades FOR INSERT
  WITH CHECK (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Token operations: viewable by all, creators can insert
CREATE POLICY "Anyone can view token operations"
  ON token_operations FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create token operations"
  ON token_operations FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Waitlist: anyone can submit, users can view own by email
CREATE POLICY "Anyone can submit to waitlist"
  ON waitlist_submissions FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can view own waitlist submission"
  ON waitlist_submissions FOR SELECT
  USING (TRUE);
