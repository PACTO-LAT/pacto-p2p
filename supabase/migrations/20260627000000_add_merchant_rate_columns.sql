-- Add persisted completion/dispute rate columns to merchants (percent 0-100).
ALTER TABLE merchants
  ADD COLUMN IF NOT EXISTS completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (completion_rate >= 0 AND completion_rate <= 100),
  ADD COLUMN IF NOT EXISTS dispute_rate NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (dispute_rate >= 0 AND dispute_rate <= 100);
