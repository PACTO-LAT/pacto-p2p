-- Supported tokens going forward are XLM and USDC only (CRCX/MXNX dropped, see #142).
-- token_operations.token had a CHECK (token IN ('USDC', 'CRCX', 'MXNX')); tighten it
-- to ('USDC', 'XLM'). listings.token / trades.token have no such CHECK, so they are
-- unaffected.
ALTER TABLE token_operations
  DROP CONSTRAINT IF EXISTS token_operations_token_check;

ALTER TABLE token_operations
  ADD CONSTRAINT token_operations_token_check CHECK (token IN ('USDC', 'XLM'));
