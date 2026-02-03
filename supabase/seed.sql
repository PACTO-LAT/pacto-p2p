-- =============================================================================
-- Seed data for local development
-- This file is run after migrations on `supabase db reset`
-- =============================================================================

-- Disable RLS temporarily for seeding (will be re-enabled after)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE merchants DISABLE ROW LEVEL SECURITY;
ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE escrows DISABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE trades DISABLE ROW LEVEL SECURITY;
ALTER TABLE token_operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_submissions DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Sample Users
-- ---------------------------------------------------------------------------
INSERT INTO users (
  id, email, stellar_address, reputation_score, total_trades, total_volume,
  full_name, username, bio, avatar_url, phone, country, kyc_status,
  notifications, security, payment_methods, user_status, user_type
)
VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'alice@example.com',
    'GDXXX1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
    4.80,
    23,
    15000.0000000,
    'Alice Demo',
    'alice',
    'Trusted CRCX/USDC trader in Costa Rica. Fast and reliable transactions.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    '+50688888888',
    'CR',
    'verified',
    '{"email": true, "push": true}'::jsonb,
    '{"twoFactorEnabled": true}'::jsonb,
    '{"methods": [{"type": "SINPE", "account": "88888888"}]}'::jsonb,
    'active',
    'merchant'
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'bob@example.com',
    'GDYYY9876543210FEDCBA9876543210FEDCBA9876543210FE',
    4.90,
    45,
    52000.0000000,
    'Bob Demo',
    'bob',
    'Fast MXNX/USDC swaps via SPEI. Professional trader with high volume.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    '+525555555555',
    'MX',
    'verified',
    '{"email": true, "push": false}'::jsonb,
    '{"twoFactorEnabled": true}'::jsonb,
    '{"methods": [{"type": "SPEI", "account": "5555555555"}]}'::jsonb,
    'active',
    'merchant'
  ),
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'charlie@example.com',
    'GDZZZ55555555555555555555555555555555555555555555',
    4.70,
    12,
    8500.0000000,
    'Charlie Demo',
    'charlie',
    'USDC trader based in the US. New to the platform but building reputation.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    '+15555555555',
    'US',
    'pending',
    '{"email": true, "push": true}'::jsonb,
    '{"twoFactorEnabled": false}'::jsonb,
    '{"methods": [{"type": "Bank Transfer", "account": "123456789"}]}'::jsonb,
    'active',
    'user'
  ),
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'diana@example.com',
    'GDDDD11111111111111111111111111111111111111111111',
    4.95,
    67,
    89000.0000000,
    'Diana Demo',
    'diana',
    'Premium merchant specializing in CRCX. Verified and trusted.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
    '+50677777777',
    'CR',
    'verified',
    '{"email": true, "push": true}'::jsonb,
    '{"twoFactorEnabled": true}'::jsonb,
    '{"methods": [{"type": "SINPE", "account": "77777777"}, {"type": "Bank Transfer", "account": "987654321"}]}'::jsonb,
    'active',
    'merchant'
  ),
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'eve@example.com',
    'GDEEE22222222222222222222222222222222222222222222',
    3.50,
    5,
    1200.0000000,
    'Eve Demo',
    'eve',
    'New trader learning the ropes.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=eve',
    '+525544443333',
    'MX',
    'pending',
    '{"email": true, "push": false}'::jsonb,
    '{"twoFactorEnabled": false}'::jsonb,
    '{"methods": [{"type": "SPEI", "account": "44443333"}]}'::jsonb,
    'pending',
    'user'
  )
ON CONFLICT (email) DO UPDATE SET
  stellar_address = EXCLUDED.stellar_address,
  reputation_score = EXCLUDED.reputation_score,
  total_trades = EXCLUDED.total_trades,
  total_volume = EXCLUDED.total_volume,
  full_name = EXCLUDED.full_name,
  username = EXCLUDED.username,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  phone = EXCLUDED.phone,
  country = EXCLUDED.country,
  kyc_status = EXCLUDED.kyc_status,
  notifications = EXCLUDED.notifications,
  security = EXCLUDED.security,
  payment_methods = EXCLUDED.payment_methods,
  user_status = EXCLUDED.user_status,
  user_type = EXCLUDED.user_type;

-- ---------------------------------------------------------------------------
-- Sample Merchants
-- ---------------------------------------------------------------------------
INSERT INTO merchants (
  id, user_id, slug, display_name, is_public, verification_status,
  bio, avatar_url, banner_url, location, languages, socials,
  rating, total_trades, volume_traded
)
VALUES
  (
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'alice-otc',
    'Alice OTC',
    true,
    'verified',
    'Trusted CRCX/USDC trader in Costa Rica. Fast and reliable transactions via SINPE.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
    'San José, CR',
    ARRAY['es', 'en'],
    '{"twitter": "@aliceotc", "telegram": "@aliceotc"}'::jsonb,
    4.80,
    23,
    15000.0000000
  ),
  (
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'bob-exchange',
    'Bob Exchange',
    true,
    'verified',
    'Fast MXNX/USDC swaps via SPEI. Professional trader with high volume and quick settlement.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200',
    'CDMX, MX',
    ARRAY['es', 'en'],
    '{"twitter": "@bobexchange", "telegram": "@bobexchange"}'::jsonb,
    4.90,
    45,
    52000.0000000
  ),
  (
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'diana-premium',
    'Diana Premium Trading',
    true,
    'verified',
    'Premium merchant specializing in CRCX. Verified and trusted with excellent reputation.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
    'San José, CR',
    ARRAY['es', 'en', 'pt'],
    '{"twitter": "@dianapremium", "telegram": "@dianapremium"}'::jsonb,
    4.95,
    67,
    89000.0000000
  )
ON CONFLICT (slug) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  display_name = EXCLUDED.display_name,
  is_public = EXCLUDED.is_public,
  verification_status = EXCLUDED.verification_status,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  banner_url = EXCLUDED.banner_url,
  location = EXCLUDED.location,
  languages = EXCLUDED.languages,
  socials = EXCLUDED.socials,
  rating = EXCLUDED.rating,
  total_trades = EXCLUDED.total_trades,
  volume_traded = EXCLUDED.volume_traded;

-- ---------------------------------------------------------------------------
-- Sample Listings
-- ---------------------------------------------------------------------------
INSERT INTO listings (
  id, user_id, merchant_id, type, token, amount, rate, fiat_currency,
  payment_method, min_amount, max_amount, description, status
)
VALUES
  -- Alice's listings
  (
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'sell',
    'CRCX',
    5000.0000000,
    530.0000000,
    'CRC',
    'SINPE',
    100.0000000,
    5000.0000000,
    'Selling CRCX for CRC via SINPE movil. Fast and secure transactions.',
    'active'
  ),
  (
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'buy',
    'USDC',
    2000.0000000,
    530.0000000,
    'CRC',
    'SINPE',
    50.0000000,
    2000.0000000,
    'Buying USDC with CRC via SINPE. Instant settlement.',
    'active'
  ),
  -- Bob's listings
  (
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'sell',
    'MXNX',
    10000.0000000,
    17.2000000,
    'MXN',
    'SPEI',
    500.0000000,
    10000.0000000,
    'MXNX to MXN via SPEI, fast settlement. High volume available.',
    'active'
  ),
  (
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'buy',
    'USDC',
    5000.0000000,
    17.1500000,
    'MXN',
    'SPEI',
    1000.0000000,
    5000.0000000,
    'Buying USDC with MXN via SPEI. Competitive rates.',
    'active'
  ),
  -- Charlie's listings
  (
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    NULL,
    'sell',
    'USDC',
    3000.0000000,
    1.0000000,
    'USD',
    'Bank Transfer',
    100.0000000,
    3000.0000000,
    'Selling USDC for USD via bank transfer. New trader building reputation.',
    'active'
  ),
  -- Diana's listings
  (
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'sell',
    'CRCX',
    15000.0000000,
    528.0000000,
    'CRC',
    'SINPE',
    500.0000000,
    15000.0000000,
    'Premium CRCX seller. Large volumes available. Verified merchant.',
    'active'
  ),
  (
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'm0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'buy',
    'CRCX',
    8000.0000000,
    532.0000000,
    'CRC',
    'Bank Transfer',
    200.0000000,
    8000.0000000,
    'Buying CRCX with CRC. Multiple payment methods accepted.',
    'active'
  ),
  -- Paused listing
  (
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    NULL,
    'sell',
    'MXNX',
    500.0000000,
    17.3000000,
    'MXN',
    'SPEI',
    100.0000000,
    500.0000000,
    'Temporarily paused listing.',
    'paused'
  )
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  merchant_id = EXCLUDED.merchant_id,
  type = EXCLUDED.type,
  token = EXCLUDED.token,
  amount = EXCLUDED.amount,
  rate = EXCLUDED.rate,
  fiat_currency = EXCLUDED.fiat_currency,
  payment_method = EXCLUDED.payment_method,
  min_amount = EXCLUDED.min_amount,
  max_amount = EXCLUDED.max_amount,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- ---------------------------------------------------------------------------
-- Sample Escrows
-- ---------------------------------------------------------------------------
INSERT INTO escrows (
  id, listing_id, buyer_id, seller_id, trustless_work_contract_id,
  engagement_id, token, amount, fiat_amount, fiat_currency,
  platform_fee, approver_address, service_provider_address,
  release_signer_address, receiver_address, platform_address,
  dispute_resolver_address, status, payment_receipt_url,
  payment_evidence, is_disputed, is_released, is_resolved,
  is_approved, is_active, balance, trustline_address, trustline_name,
  receiver_memo, dispute_started_by, funded_by
)
VALUES
  -- Active escrow (funded, awaiting payment)
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'contract-001',
    'engagement-001',
    'CRCX',
    1000.0000000,
    530000.00,
    'CRC',
    5.0000000,
    'GDAPPROVER1234567890123456789012345678901234567890',
    'GDSERVPROV1234567890123456789012345678901234567890',
    'GDRELEASE1234567890123456789012345678901234567890',
    'GDXXX1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
    'GDPLATFORM1234567890123456789012345678901234567890',
    'GDDISPUTE1234567890123456789012345678901234567890',
    'funded',
    NULL,
    NULL,
    false,
    false,
    false,
    true,
    true,
    1000.0000000,
    'GDTRUSTLINE1234567890123456789012345678901234567890',
    'CRCX',
    12345,
    NULL,
    'GDZZZ55555555555555555555555555555555555555555555'
  ),
  -- Escrow awaiting payment confirmation
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'contract-002',
    'engagement-002',
    'MXNX',
    2000.0000000,
    34400.00,
    'MXN',
    10.0000000,
    'GDAPPROVER1234567890123456789012345678901234567890',
    'GDSERVPROV1234567890123456789012345678901234567890',
    'GDRELEASE1234567890123456789012345678901234567890',
    'GDYYY9876543210FEDCBA9876543210FEDCBA9876543210FE',
    'GDPLATFORM1234567890123456789012345678901234567890',
    'GDDISPUTE1234567890123456789012345678901234567890',
    'payment_reported',
    'https://example.com/receipt-002.pdf',
    'Payment screenshot attached',
    false,
    false,
    false,
    true,
    true,
    2000.0000000,
    'GDTRUSTLINE1234567890123456789012345678901234567890',
    'MXNX',
    23456,
    NULL,
    'GDXXX1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456'
  ),
  -- Completed escrow (released)
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'contract-003',
    'engagement-003',
    'USDC',
    500.0000000,
    500.00,
    'CRC',
    2.5000000,
    'GDAPPROVER1234567890123456789012345678901234567890',
    'GDSERVPROV1234567890123456789012345678901234567890',
    'GDRELEASE1234567890123456789012345678901234567890',
    'GDYYY9876543210FEDCBA9876543210FEDCBA9876543210FE',
    'GDPLATFORM1234567890123456789012345678901234567890',
    'GDDISPUTE1234567890123456789012345678901234567890',
    'released',
    'https://example.com/receipt-003.pdf',
    'Payment confirmed',
    false,
    true,
    false,
    true,
    false,
    0.0000000,
    'GDTRUSTLINE1234567890123456789012345678901234567890',
    'USDC',
    34567,
    NULL,
    'GDYYY9876543210FEDCBA9876543210FEDCBA9876543210FE'
  ),
  -- Disputed escrow
  (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'contract-004',
    'engagement-004',
    'USDC',
    1500.0000000,
    1500.00,
    'USD',
    7.5000000,
    'GDAPPROVER1234567890123456789012345678901234567890',
    'GDSERVPROV1234567890123456789012345678901234567890',
    'GDRELEASE1234567890123456789012345678901234567890',
    'GDEEE22222222222222222222222222222222222222222222',
    'GDPLATFORM1234567890123456789012345678901234567890',
    'GDDISPUTE1234567890123456789012345678901234567890',
    'disputed',
    NULL,
    'Payment not received according to buyer',
    true,
    false,
    false,
    true,
    true,
    1500.0000000,
    'GDTRUSTLINE1234567890123456789012345678901234567890',
    'USDC',
    45678,
    'GDEEE22222222222222222222222222222222222222222222',
    'GDEEE22222222222222222222222222222222222222222222'
  )
ON CONFLICT (id) DO UPDATE SET
  listing_id = EXCLUDED.listing_id,
  buyer_id = EXCLUDED.buyer_id,
  seller_id = EXCLUDED.seller_id,
  trustless_work_contract_id = EXCLUDED.trustless_work_contract_id,
  engagement_id = EXCLUDED.engagement_id,
  token = EXCLUDED.token,
  amount = EXCLUDED.amount,
  fiat_amount = EXCLUDED.fiat_amount,
  fiat_currency = EXCLUDED.fiat_currency,
  platform_fee = EXCLUDED.platform_fee,
  approver_address = EXCLUDED.approver_address,
  service_provider_address = EXCLUDED.service_provider_address,
  release_signer_address = EXCLUDED.release_signer_address,
  receiver_address = EXCLUDED.receiver_address,
  platform_address = EXCLUDED.platform_address,
  dispute_resolver_address = EXCLUDED.dispute_resolver_address,
  status = EXCLUDED.status,
  payment_receipt_url = EXCLUDED.payment_receipt_url,
  payment_evidence = EXCLUDED.payment_evidence,
  is_disputed = EXCLUDED.is_disputed,
  is_released = EXCLUDED.is_released,
  is_resolved = EXCLUDED.is_resolved,
  is_approved = EXCLUDED.is_approved,
  is_active = EXCLUDED.is_active,
  balance = EXCLUDED.balance,
  trustline_address = EXCLUDED.trustline_address,
  trustline_name = EXCLUDED.trustline_name,
  receiver_memo = EXCLUDED.receiver_memo,
  dispute_started_by = EXCLUDED.dispute_started_by,
  funded_by = EXCLUDED.funded_by;

-- ---------------------------------------------------------------------------
-- Sample Escrow Milestones
-- ---------------------------------------------------------------------------
INSERT INTO escrow_milestones (
  id, escrow_id, milestone_index, description, status, evidence, approved
)
VALUES
  (
    'em0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    0,
    'Initial payment confirmation',
    'approved',
    'Payment receipt verified',
    true
  ),
  (
    'em0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    0,
    'Payment verification',
    'pendingApproval',
    'Screenshot of bank transfer',
    false
  ),
  (
    'em0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    0,
    'Payment received and verified',
    'approved',
    'Bank statement confirmation',
    true
  ),
  (
    'em0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    0,
    'Payment dispute resolution',
    'pending',
    NULL,
    false
  )
ON CONFLICT (id) DO UPDATE SET
  escrow_id = EXCLUDED.escrow_id,
  milestone_index = EXCLUDED.milestone_index,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  evidence = EXCLUDED.evidence,
  approved = EXCLUDED.approved;

-- ---------------------------------------------------------------------------
-- Sample Trades
-- ---------------------------------------------------------------------------
INSERT INTO trades (
  id, escrow_id, listing_id, buyer_id, seller_id, token, token_amount,
  fiat_amount, fiat_currency, rate, payment_method, stellar_transaction_hash,
  stellar_operation_id, status, completed_at
)
VALUES
  (
    't0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'USDC',
    500.0000000,
    500.00,
    'CRC',
    530.0000000,
    'SINPE',
    'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    'op1234567890',
    'completed',
    NOW() - INTERVAL '2 days'
  ),
  (
    't0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'l0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'CRCX',
    1000.0000000,
    530000.00,
    'CRC',
    530.0000000,
    'SINPE',
    NULL,
    NULL,
    'pending',
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  escrow_id = EXCLUDED.escrow_id,
  listing_id = EXCLUDED.listing_id,
  buyer_id = EXCLUDED.buyer_id,
  seller_id = EXCLUDED.seller_id,
  token = EXCLUDED.token,
  token_amount = EXCLUDED.token_amount,
  fiat_amount = EXCLUDED.fiat_amount,
  fiat_currency = EXCLUDED.fiat_currency,
  rate = EXCLUDED.rate,
  payment_method = EXCLUDED.payment_method,
  stellar_transaction_hash = EXCLUDED.stellar_transaction_hash,
  stellar_operation_id = EXCLUDED.stellar_operation_id,
  status = EXCLUDED.status,
  completed_at = EXCLUDED.completed_at;

-- ---------------------------------------------------------------------------
-- Sample Token Operations
-- ---------------------------------------------------------------------------
INSERT INTO token_operations (
  id, operation_type, token, amount, stellar_address, transaction_hash,
  memo, status, created_by
)
VALUES
  (
    'to0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'mint',
    'CRCX',
    10000.0000000,
    'GDXXX1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
    'mint1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop',
    'Initial mint for user',
    'completed',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  ),
  (
    'to0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'mint',
    'MXNX',
    5000.0000000,
    'GDYYY9876543210FEDCBA9876543210FEDCBA9876543210FE',
    'mint9876543210fedcba9876543210fedcba9876543210fedcba9876543210fe',
    'Initial mint for user',
    'completed',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'
  ),
  (
    'to0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'mint',
    'USDC',
    3000.0000000,
    'GDZZZ55555555555555555555555555555555555555555555',
    'mint555555555555555555555555555555555555555555555555555555555555',
    'Initial mint for user',
    'completed',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'
  ),
  (
    'to0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    'burn',
    'CRCX',
    500.0000000,
    'GDXXX1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
    'burn1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop',
    'User requested burn',
    'completed',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  )
ON CONFLICT (id) DO UPDATE SET
  operation_type = EXCLUDED.operation_type,
  token = EXCLUDED.token,
  amount = EXCLUDED.amount,
  stellar_address = EXCLUDED.stellar_address,
  transaction_hash = EXCLUDED.transaction_hash,
  memo = EXCLUDED.memo,
  status = EXCLUDED.status,
  created_by = EXCLUDED.created_by;

-- ---------------------------------------------------------------------------
-- Sample Waitlist Submissions
-- ---------------------------------------------------------------------------
INSERT INTO waitlist_submissions (
  id, name, email, company, role, country, source, use_case, notes,
  otp, otp_expires_at, verified_at
)
VALUES
  (
    'w0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'John Doe',
    'john@example.com',
    'Tech Corp',
    'CTO',
    'US',
    'website',
    'Corporate treasury management',
    'Interested in bulk trading',
    NULL,
    NULL,
    NOW() - INTERVAL '5 days'
  ),
  (
    'w0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'Jane Smith',
    'jane@example.com',
    NULL,
    'Trader',
    'CR',
    'referral',
    'Personal trading',
    'Referred by Alice',
    '123456',
    NOW() + INTERVAL '1 hour',
    NULL
  ),
  (
    'w0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'Carlos Rodriguez',
    'carlos@example.com',
    'Finance Inc',
    'Finance Manager',
    'MX',
    'social',
    'Business payments',
    'Looking for payment solutions',
    NULL,
    NULL,
    NULL
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  company = EXCLUDED.company,
  role = EXCLUDED.role,
  country = EXCLUDED.country,
  source = EXCLUDED.source,
  use_case = EXCLUDED.use_case,
  notes = EXCLUDED.notes,
  otp = EXCLUDED.otp,
  otp_expires_at = EXCLUDED.otp_expires_at,
  verified_at = EXCLUDED.verified_at;

-- ---------------------------------------------------------------------------
-- Re-enable RLS after seeding
-- ---------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_submissions ENABLE ROW LEVEL SECURITY;
