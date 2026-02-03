-- =============================================================================
-- Development Helpers Migration
-- Adds useful functions and views for local development and testing
-- =============================================================================

-- This migration is designed to be safe across environments where some tables
-- may not exist yet (e.g., remote dev projects with a reduced schema).

-- ---------------------------------------------------------------------------
-- Helper function: Get user stats summary
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS TABLE (
  total_trades INTEGER,
  total_volume DECIMAL,
  reputation_score DECIMAL,
  active_listings INTEGER,
  completed_escrows INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_listings BOOLEAN := to_regclass('public.listings') IS NOT NULL;
  has_escrows BOOLEAN := to_regclass('public.escrows') IS NOT NULL;
BEGIN
  IF to_regclass('public.users') IS NULL THEN
    RETURN;
  END IF;

  IF has_listings AND has_escrows THEN
    RETURN QUERY EXECUTE '
      SELECT
        u.total_trades,
        u.total_volume,
        u.reputation_score,
        COUNT(DISTINCT l.id)::INTEGER AS active_listings,
        COUNT(DISTINCT e.id)::INTEGER AS completed_escrows
      FROM public.users u
      LEFT JOIN public.listings l ON l.user_id = u.id AND l.status = ''active''
      LEFT JOIN public.escrows e ON (e.buyer_id = u.id OR e.seller_id = u.id) AND e.status = ''released''
      WHERE u.id = $1
      GROUP BY u.id, u.total_trades, u.total_volume, u.reputation_score
    ' USING user_uuid;
    RETURN;
  END IF;

  IF has_listings THEN
    RETURN QUERY EXECUTE '
      SELECT
        u.total_trades,
        u.total_volume,
        u.reputation_score,
        COUNT(DISTINCT l.id)::INTEGER AS active_listings,
        0::INTEGER AS completed_escrows
      FROM public.users u
      LEFT JOIN public.listings l ON l.user_id = u.id AND l.status = ''active''
      WHERE u.id = $1
      GROUP BY u.id, u.total_trades, u.total_volume, u.reputation_score
    ' USING user_uuid;
    RETURN;
  END IF;

  RETURN QUERY EXECUTE '
    SELECT
      u.total_trades,
      u.total_volume,
      u.reputation_score,
      0::INTEGER AS active_listings,
      0::INTEGER AS completed_escrows
    FROM public.users u
    WHERE u.id = $1
  ' USING user_uuid;
END;
$$;

-- ---------------------------------------------------------------------------
-- Helper function: Get listing statistics
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_listing_stats(listing_uuid UUID)
RETURNS TABLE (
  listing_id UUID,
  total_escrows INTEGER,
  total_volume DECIMAL,
  avg_rate DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_escrows BOOLEAN := to_regclass('public.escrows') IS NOT NULL;
BEGIN
  IF to_regclass('public.listings') IS NULL THEN
    RETURN;
  END IF;

  IF has_escrows THEN
    RETURN QUERY EXECUTE '
      SELECT
        l.id AS listing_id,
        COUNT(e.id)::INTEGER AS total_escrows,
        COALESCE(SUM(e.fiat_amount), 0) AS total_volume,
        COALESCE(AVG(e.fiat_amount / NULLIF(e.amount, 0)), l.rate) AS avg_rate
      FROM public.listings l
      LEFT JOIN public.escrows e ON e.listing_id = l.id
      WHERE l.id = $1
      GROUP BY l.id, l.rate
    ' USING listing_uuid;
    RETURN;
  END IF;

  RETURN QUERY EXECUTE '
    SELECT
      l.id AS listing_id,
      0::INTEGER AS total_escrows,
      0::DECIMAL AS total_volume,
      l.rate AS avg_rate
    FROM public.listings l
    WHERE l.id = $1
  ' USING listing_uuid;
END;
$$;

-- ---------------------------------------------------------------------------
-- View: Active listings with merchant info
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.listings') IS NULL OR to_regclass('public.users') IS NULL THEN
    RETURN;
  END IF;

  IF to_regclass('public.merchants') IS NOT NULL THEN
    EXECUTE $vw$
      CREATE OR REPLACE VIEW public.active_listings_with_merchant AS
      SELECT
        l.id,
        l.type,
        l.token,
        l.amount,
        l.rate,
        l.fiat_currency,
        l.payment_method,
        l.min_amount,
        l.max_amount,
        l.description,
        l.status,
        l.created_at,
        u.username AS seller_username,
        u.reputation_score AS seller_reputation,
        u.total_trades AS seller_total_trades,
        m.slug AS merchant_slug,
        m.display_name AS merchant_name,
        m.rating AS merchant_rating
      FROM public.listings l
      JOIN public.users u ON u.id = l.user_id
      LEFT JOIN public.merchants m ON m.id = l.merchant_id
      WHERE l.status = 'active';
    $vw$;
  ELSE
    EXECUTE $vw$
      CREATE OR REPLACE VIEW public.active_listings_with_merchant AS
      SELECT
        l.id,
        l.type,
        l.token,
        l.amount,
        l.rate,
        l.fiat_currency,
        l.payment_method,
        l.min_amount,
        l.max_amount,
        l.description,
        l.status,
        l.created_at,
        u.username AS seller_username,
        u.reputation_score AS seller_reputation,
        u.total_trades AS seller_total_trades,
        NULL::TEXT AS merchant_slug,
        NULL::TEXT AS merchant_name,
        NULL::NUMERIC AS merchant_rating
      FROM public.listings l
      JOIN public.users u ON u.id = l.user_id
      WHERE l.status = 'active';
    $vw$;
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- View: Escrow summary with user and listing info
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.escrows') IS NOT NULL THEN
    EXECUTE $vw$
      CREATE OR REPLACE VIEW public.escrow_summary AS
      SELECT
        e.id,
        e.status,
        e.token,
        e.amount,
        e.fiat_amount,
        e.fiat_currency,
        e.is_disputed,
        e.is_released,
        e.created_at,
        e.updated_at,
        buyer.username AS buyer_username,
        buyer.email AS buyer_email,
        seller.username AS seller_username,
        seller.email AS seller_email,
        l.type AS listing_type,
        l.payment_method
      FROM public.escrows e
      JOIN public.users buyer ON buyer.id = e.buyer_id
      JOIN public.users seller ON seller.id = e.seller_id
      LEFT JOIN public.listings l ON l.id = e.listing_id;
    $vw$;
  ELSE
    -- Create an empty view with the expected shape so consumers can still
    -- reference it in environments without escrows yet.
    EXECUTE $vw$
      CREATE OR REPLACE VIEW public.escrow_summary AS
      SELECT
        NULL::UUID AS id,
        NULL::TEXT AS status,
        NULL::TEXT AS token,
        NULL::NUMERIC AS amount,
        NULL::NUMERIC AS fiat_amount,
        NULL::TEXT AS fiat_currency,
        NULL::BOOLEAN AS is_disputed,
        NULL::BOOLEAN AS is_released,
        NULL::TIMESTAMPTZ AS created_at,
        NULL::TIMESTAMPTZ AS updated_at,
        NULL::TEXT AS buyer_username,
        NULL::TEXT AS buyer_email,
        NULL::TEXT AS seller_username,
        NULL::TEXT AS seller_email,
        NULL::TEXT AS listing_type,
        NULL::TEXT AS payment_method
      WHERE FALSE;
    $vw$;
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- View: Trade history with user details
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW trade_history AS
SELECT
  t.id,
  t.token,
  t.token_amount,
  t.fiat_amount,
  t.fiat_currency,
  t.rate,
  t.payment_method,
  t.status,
  t.completed_at,
  t.created_at,
  buyer.username as buyer_username,
  buyer.stellar_address as buyer_stellar_address,
  seller.username as seller_username,
  seller.stellar_address as seller_stellar_address,
  l.type as listing_type
FROM trades t
JOIN users buyer ON buyer.id = t.buyer_id
JOIN users seller ON seller.id = t.seller_id
LEFT JOIN listings l ON l.id = t.listing_id
ORDER BY t.created_at DESC;

-- ---------------------------------------------------------------------------
-- Grant permissions for views
-- ---------------------------------------------------------------------------
GRANT SELECT ON active_listings_with_merchant TO authenticated;
GRANT SELECT ON escrow_summary TO authenticated;
GRANT SELECT ON trade_history TO authenticated;

-- ---------------------------------------------------------------------------
-- Grant permissions for helper functions
-- ---------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION get_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_listing_stats(UUID) TO authenticated;
