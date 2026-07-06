-- Migration: FX normalization — persist USD fiat amounts on completed trades

CREATE TABLE IF NOT EXISTS fx_rates (
  currency VARCHAR PRIMARY KEY,
  rate_to_usd NUMERIC(20, 10) NOT NULL CHECK (rate_to_usd > 0),
  as_of TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fx_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY fx_rates_public_read ON fx_rates
  FOR SELECT
  USING (true);

INSERT INTO fx_rates (currency, rate_to_usd) VALUES
  ('USD', 1.0),
  ('CRC', 0.00196),
  ('MXN', 0.0535),
  ('BRL', 0.182),
  ('COP', 0.00024),
  ('ARS', 0.00082)
ON CONFLICT (currency) DO NOTHING;

ALTER TABLE trades
  ADD COLUMN IF NOT EXISTS fiat_amount_usd NUMERIC(20, 2),
  ADD COLUMN IF NOT EXISTS fx_rate_to_usd NUMERIC(20, 10),
  ADD COLUMN IF NOT EXISTS fx_rate_as_of TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION set_trade_fiat_amount_usd()
RETURNS TRIGGER AS $$
DECLARE
  v_rate NUMERIC(20, 10);
  v_as_of TIMESTAMPTZ;
BEGIN
  IF NEW.status = 'completed' AND NEW.fiat_amount_usd IS NULL THEN
    SELECT rate_to_usd, as_of
    INTO v_rate, v_as_of
    FROM fx_rates
    WHERE currency = NEW.fiat_currency;

    IF FOUND THEN
      NEW.fx_rate_to_usd := v_rate;
      NEW.fx_rate_as_of := v_as_of;
      NEW.fiat_amount_usd := ROUND(NEW.fiat_amount * v_rate, 2);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_trade_fiat_amount_usd ON trades;

CREATE TRIGGER trg_set_trade_fiat_amount_usd
  BEFORE INSERT OR UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION set_trade_fiat_amount_usd();

UPDATE trades t
SET
  fiat_amount_usd = ROUND(t.fiat_amount * f.rate_to_usd, 2),
  fx_rate_to_usd = f.rate_to_usd,
  fx_rate_as_of = f.as_of
FROM fx_rates f
WHERE f.currency = t.fiat_currency
  AND t.fiat_amount_usd IS NULL;
