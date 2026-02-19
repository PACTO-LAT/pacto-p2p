-- Migration: Add merchants, escrows, escrow_milestones, and token_operations tables
-- Matches DATABASE_SCHEMA.md

-- Create merchants table
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected','revoked')),
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  location TEXT,
  languages TEXT[],
  socials JSONB DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_trades INTEGER DEFAULT 0 CHECK (total_trades >= 0),
  volume_traded NUMERIC(20,7) DEFAULT 0 CHECK (volume_traded >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchants_user_id ON merchants(user_id);
CREATE INDEX IF NOT EXISTS idx_merchants_slug ON merchants(slug);
CREATE INDEX IF NOT EXISTS idx_merchants_is_public ON merchants(is_public);
CREATE INDEX IF NOT EXISTS idx_merchants_verification_status ON merchants(verification_status);

-- Add merchant_id FK to listings if column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'listings' AND column_name = 'merchant_id'
  ) THEN
    ALTER TABLE listings ADD COLUMN merchant_id UUID;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'listings_merchant_id_fkey'
  ) THEN
    ALTER TABLE listings ADD CONSTRAINT listings_merchant_id_fkey
      FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if already exists or constraint fails
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_listings_merchant_id ON listings(merchant_id);

-- Create escrows table (simplified: engagement_id links to Trustless Work on-chain)
CREATE TABLE IF NOT EXISTS escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  engagement_id TEXT UNIQUE NOT NULL,
  fiat_amount DECIMAL(20,2) NOT NULL CHECK (fiat_amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrows_listing_id ON escrows(listing_id);
CREATE INDEX IF NOT EXISTS idx_escrows_buyer_id ON escrows(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrows_seller_id ON escrows(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrows_engagement_id ON escrows(engagement_id);
CREATE INDEX IF NOT EXISTS idx_escrows_created_at ON escrows(created_at);

-- Add escrow_id FK to trades if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'trades_escrow_id_fkey'
  ) THEN
    ALTER TABLE trades ADD CONSTRAINT trades_escrow_id_fkey
      FOREIGN KEY (escrow_id) REFERENCES escrows(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Create escrow_milestones table
CREATE TABLE IF NOT EXISTS escrow_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES escrows(id) ON DELETE CASCADE,
  milestone_index INTEGER NOT NULL CHECK (milestone_index >= 0),
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'pendingApproval', 'approved', 'rejected')),
  evidence TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(escrow_id, milestone_index)
);

CREATE INDEX IF NOT EXISTS idx_escrow_milestones_escrow_id ON escrow_milestones(escrow_id);
CREATE INDEX IF NOT EXISTS idx_escrow_milestones_status ON escrow_milestones(status);

-- Create token_operations table
CREATE TABLE IF NOT EXISTS token_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type VARCHAR(10) NOT NULL CHECK (operation_type IN ('mint', 'burn')),
  token VARCHAR(10) NOT NULL CHECK (token IN ('USDC', 'CRCX', 'MXNX')),
  amount DECIMAL(20,7) NOT NULL CHECK (amount > 0),
  stellar_address VARCHAR(56) NOT NULL,
  transaction_hash VARCHAR(64),
  memo TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_token_operations_type ON token_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_token_operations_token ON token_operations(token);
CREATE INDEX IF NOT EXISTS idx_token_operations_status ON token_operations(status);
CREATE INDEX IF NOT EXISTS idx_token_operations_stellar_address ON token_operations(stellar_address);
CREATE INDEX IF NOT EXISTS idx_token_operations_created_at ON token_operations(created_at);

-- update_updated_at trigger function
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

-- Triggers for new tables (use IF NOT EXISTS pattern via DROP + CREATE for idempotency)
DROP TRIGGER IF EXISTS update_merchants_updated_at ON merchants;
CREATE TRIGGER update_merchants_updated_at
  BEFORE UPDATE ON merchants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_escrows_updated_at ON escrows;
CREATE TRIGGER update_escrows_updated_at
  BEFORE UPDATE ON escrows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_escrow_milestones_updated_at ON escrow_milestones;
CREATE TRIGGER update_escrow_milestones_updated_at
  BEFORE UPDATE ON escrow_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_token_operations_updated_at ON token_operations;
CREATE TRIGGER update_token_operations_updated_at
  BEFORE UPDATE ON token_operations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_operations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS merchants_select_public ON merchants;
CREATE POLICY merchants_select_public ON merchants FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS merchants_select_own ON merchants;
CREATE POLICY merchants_select_own ON merchants FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS merchants_insert_own ON merchants;
CREATE POLICY merchants_insert_own ON merchants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS merchants_update_own ON merchants;
CREATE POLICY merchants_update_own ON merchants FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS escrows_select_own ON escrows;
CREATE POLICY escrows_select_own ON escrows FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS escrows_insert_own ON escrows;
CREATE POLICY escrows_insert_own ON escrows FOR INSERT
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS escrows_update_own ON escrows;
CREATE POLICY escrows_update_own ON escrows FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS escrow_milestones_select_own ON escrow_milestones;
CREATE POLICY escrow_milestones_select_own ON escrow_milestones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM escrows e
    WHERE e.id = escrow_milestones.escrow_id
    AND (e.buyer_id = auth.uid() OR e.seller_id = auth.uid())
  ));

DROP POLICY IF EXISTS escrow_milestones_insert_own ON escrow_milestones;
CREATE POLICY escrow_milestones_insert_own ON escrow_milestones FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM escrows e
    WHERE e.id = escrow_milestones.escrow_id
    AND (e.buyer_id = auth.uid() OR e.seller_id = auth.uid())
  ));

DROP POLICY IF EXISTS escrow_milestones_update_own ON escrow_milestones;
CREATE POLICY escrow_milestones_update_own ON escrow_milestones FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM escrows e
    WHERE e.id = escrow_milestones.escrow_id
    AND (e.buyer_id = auth.uid() OR e.seller_id = auth.uid())
  ));

DROP POLICY IF EXISTS token_operations_select_all ON token_operations;
CREATE POLICY token_operations_select_all ON token_operations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS token_operations_insert_own ON token_operations;
CREATE POLICY token_operations_insert_own ON token_operations FOR INSERT
  WITH CHECK (auth.uid() = created_by);
