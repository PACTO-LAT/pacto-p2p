-- Seed data for local development
-- This file is run after migrations on `supabase db reset`

-- Sample users
INSERT INTO users (email, stellar_address, reputation_score, total_trades, full_name, username, country, kyc_status)
VALUES
  ('alice@example.com', 'GDXXX1234567890ABCDEF', 4.80, 23, 'Alice Demo', 'alice', 'CR', 'verified'),
  ('bob@example.com', 'GDYYY9876543210FEDCBA', 4.90, 45, 'Bob Demo', 'bob', 'MX', 'verified'),
  ('charlie@example.com', 'GDZZZ5555555555555555', 4.70, 12, 'Charlie Demo', 'charlie', 'US', 'pending')
ON CONFLICT (email) DO NOTHING;

-- Sample merchants (for alice and bob)
INSERT INTO merchants (user_id, slug, display_name, is_public, verification_status, bio, location, languages, rating, total_trades, volume_traded)
SELECT
  u.id, 'alice-otc', 'Alice OTC', true, 'verified',
  'Trusted CRCX/USDC trader in Costa Rica', 'San José, CR',
  ARRAY['es', 'en'], 4.80, 23, 15000.00
FROM users u WHERE u.email = 'alice@example.com'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO merchants (user_id, slug, display_name, is_public, verification_status, bio, location, languages, rating, total_trades, volume_traded)
SELECT
  u.id, 'bob-exchange', 'Bob Exchange', true, 'verified',
  'Fast MXNX/USDC swaps via SPEI', 'CDMX, MX',
  ARRAY['es', 'en'], 4.90, 45, 52000.00
FROM users u WHERE u.email = 'bob@example.com'
ON CONFLICT (slug) DO NOTHING;

-- Sample listings
INSERT INTO listings (user_id, merchant_id, type, token, amount, rate, fiat_currency, payment_method, min_amount, max_amount, description, status)
SELECT
  u.id, m.id, 'sell', 'CRCX', 5000.0000000, 530.0000000, 'CRC', 'SINPE',
  100.0000000, 5000.0000000, 'Selling CRCX for CRC via SINPE movil', 'active'
FROM users u
JOIN merchants m ON m.user_id = u.id
WHERE u.email = 'alice@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO listings (user_id, merchant_id, type, token, amount, rate, fiat_currency, payment_method, min_amount, max_amount, description, status)
SELECT
  u.id, m.id, 'sell', 'MXNX', 10000.0000000, 17.2000000, 'MXN', 'SPEI',
  500.0000000, 10000.0000000, 'MXNX to MXN via SPEI, fast settlement', 'active'
FROM users u
JOIN merchants m ON m.user_id = u.id
WHERE u.email = 'bob@example.com'
ON CONFLICT DO NOTHING;
