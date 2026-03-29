-- Add seller_address to listings so the Stellar wallet address is stored
-- at listing-creation time, independent of the user profile.
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_address TEXT;
