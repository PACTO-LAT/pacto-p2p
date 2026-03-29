-- Add amount_remaining to listings to track how much is still available for trading
ALTER TABLE listings ADD COLUMN IF NOT EXISTS amount_remaining NUMERIC(20,7);

-- Initialize amount_remaining = amount for all existing listings
UPDATE listings SET amount_remaining = amount WHERE amount_remaining IS NULL;

-- Set NOT NULL with default matching amount
ALTER TABLE listings ALTER COLUMN amount_remaining SET NOT NULL;
ALTER TABLE listings ALTER COLUMN amount_remaining SET DEFAULT 0;
