# Database Schema Documentation

## Overview

This document describes the Supabase database schema for the Pacto P2P platform, a decentralized OTC trading platform for Stellar stablecoins using Trustless Work escrows.

## Tables

### 1. `users`
Stores user accounts and profiles.

**Columns:**
- `id` (UUID, Primary Key)
- `email` (VARCHAR(255), Unique, Not Null)
- `stellar_address` (VARCHAR(56), Unique)
- `reputation_score` (DECIMAL(3,2), Default: 0.00, Range: 0-5)
- `total_trades` (INTEGER, Default: 0)
- `total_volume` (DECIMAL(20,7), Default: 0)
- `full_name` (TEXT)
- `username` (VARCHAR(50), Unique)
- `bio` (TEXT)
- `avatar_url` (TEXT)
- `phone` (VARCHAR(20))
- `country` (VARCHAR(2), ISO country code)
- `kyc_status` (VARCHAR(20), Default: 'pending', Values: 'pending'|'verified'|'rejected')
- `notifications` (JSONB) - Email/push notification preferences
- `security` (JSONB) - 2FA and security settings
- `payment_methods` (JSONB) - Payment method configurations
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_users_stellar_address`
- `idx_users_email`
- `idx_users_username`
- `idx_users_kyc_status`

### 2. `merchants`
Stores merchant profiles for verified sellers.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `slug` (TEXT, Unique, Not Null)
- `display_name` (TEXT, Not Null)
- `is_public` (BOOLEAN, Default: true)
- `verification_status` (TEXT, Default: 'pending', Values: 'pending'|'verified'|'rejected'|'revoked')
- `bio` (TEXT)
- `avatar_url` (TEXT)
- `banner_url` (TEXT)
- `location` (TEXT)
- `languages` (TEXT[])
- `socials` (JSONB)
- `rating` (NUMERIC(3,2), Default: 0, Range: 0-5)
- `total_trades` (INTEGER, Default: 0)
- `volume_traded` (NUMERIC(20,7), Default: 0)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_merchants_user_id`
- `idx_merchants_slug`
- `idx_merchants_is_public`
- `idx_merchants_verification_status`

### 3. `listings`
Stores buy/sell offers posted by users.

**Columns:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id, Not Null)
- `merchant_id` (UUID, Foreign Key → merchants.id, Nullable)
- `type` (VARCHAR(10), Not Null, Values: 'buy'|'sell')
- `token` (VARCHAR(10), Not Null, Values: 'USDC'|'CRCX'|'MXNX')
- `amount` (DECIMAL(20,7), Not Null, > 0)
- `rate` (DECIMAL(20,7), Not Null, > 0)
- `fiat_currency` (VARCHAR(3), Not Null, ISO currency code)
- `payment_method` (VARCHAR(50), Not Null)
- `min_amount` (DECIMAL(20,7), Nullable, > 0)
- `max_amount` (DECIMAL(20,7), Nullable, > 0)
- `description` (TEXT)
- `status` (VARCHAR(20), Default: 'active', Values: 'active'|'paused'|'completed'|'cancelled')
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Constraints:**
- `check_amount_range`: Ensures max_amount >= min_amount if both are set

**Indexes:**
- `idx_listings_user_id`
- `idx_listings_merchant_id`
- `idx_listings_token`
- `idx_listings_type`
- `idx_listings_status`
- `idx_listings_created_at`

### 4. `escrows`
Stores minimal platform-specific data for escrow contracts. All escrow details (amount, status, roles, milestones, etc.) are stored on-chain in the Stellar blockchain and can be retrieved via the Trustless Work API using the `engagement_id`.

**Columns:**
- `id` (UUID, Primary Key)
- `listing_id` (UUID, Foreign Key → listings.id, Nullable)
- `buyer_id` (UUID, Foreign Key → users.id, Not Null)
- `seller_id` (UUID, Foreign Key → users.id, Not Null)
- `engagement_id` (TEXT, Unique, Not Null) - On-chain identifier for fetching full escrow details
- `fiat_amount` (DECIMAL(20,2), Not Null, > 0) - Used for platform statistics
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Note:** All other escrow details (token, amount, status, roles, trustline, milestones, balance, etc.) are available on-chain and should be fetched using the Trustless Work API with the `engagement_id`.

**Indexes:**
- `idx_escrows_listing_id`
- `idx_escrows_buyer_id`
- `idx_escrows_seller_id`
- `idx_escrows_engagement_id`
- `idx_escrows_created_at`

### 5. `escrow_milestones`
Tracks milestone status for escrows.

**Columns:**
- `id` (UUID, Primary Key)
- `escrow_id` (UUID, Foreign Key → escrows.id, Not Null)
- `milestone_index` (INTEGER, Not Null, >= 0)
- `description` (TEXT, Not Null)
- `status` (VARCHAR(20), Default: 'pending', Values: 'pending'|'pendingApproval'|'approved'|'rejected')
- `evidence` (TEXT)
- `approved` (BOOLEAN, Default: false)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Constraints:**
- Unique constraint on (`escrow_id`, `milestone_index`)

**Indexes:**
- `idx_escrow_milestones_escrow_id`
- `idx_escrow_milestones_status`

### 6. `trades`
Stores completed trade transactions.

**Columns:**
- `id` (UUID, Primary Key)
- `escrow_id` (UUID, Foreign Key → escrows.id, Not Null)
- `listing_id` (UUID, Foreign Key → listings.id, Nullable)
- `buyer_id` (UUID, Foreign Key → users.id, Not Null)
- `seller_id` (UUID, Foreign Key → users.id, Not Null)
- `token` (VARCHAR(10), Not Null, Values: 'USDC'|'CRCX'|'MXNX')
- `token_amount` (DECIMAL(20,7), Not Null, > 0)
- `fiat_amount` (DECIMAL(20,2), Not Null, > 0)
- `fiat_currency` (VARCHAR(3), Not Null)
- `rate` (DECIMAL(20,7), Not Null, > 0)
- `payment_method` (VARCHAR(50), Not Null)
- `stellar_transaction_hash` (VARCHAR(64))
- `stellar_operation_id` (VARCHAR(64))
- `status` (VARCHAR(20), Default: 'pending', Values: 'pending'|'completed'|'failed'|'cancelled'|'disputed'|'resolved')
- `completed_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_trades_escrow_id`
- `idx_trades_listing_id`
- `idx_trades_buyer_id`
- `idx_trades_seller_id`
- `idx_trades_status`
- `idx_trades_created_at`

### 7. `token_operations`
Tracks admin mint/burn operations.

**Columns:**
- `id` (UUID, Primary Key)
- `operation_type` (VARCHAR(10), Not Null, Values: 'mint'|'burn')
- `token` (VARCHAR(10), Not Null, Values: 'USDC'|'CRCX'|'MXNX')
- `amount` (DECIMAL(20,7), Not Null, > 0)
- `stellar_address` (VARCHAR(56), Not Null)
- `transaction_hash` (VARCHAR(64))
- `memo` (TEXT)
- `status` (VARCHAR(20), Default: 'pending', Values: 'pending'|'completed'|'failed')
- `created_by` (UUID, Foreign Key → users.id, Nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_token_operations_type`
- `idx_token_operations_token`
- `idx_token_operations_status`
- `idx_token_operations_stellar_address`
- `idx_token_operations_created_at`

### 8. `waitlist_submissions`
Stores marketing waitlist entries with OTP verification.

**Columns:**
- `id` (UUID, Primary Key)
- `name` (TEXT, Not Null)
- `email` (TEXT, Unique, Not Null)
- `company` (TEXT)
- `role` (TEXT)
- `country` (TEXT)
- `source` (TEXT)
- `use_case` (TEXT)
- `notes` (TEXT)
- `otp` (VARCHAR(6))
- `otp_expires_at` (TIMESTAMPTZ)
- `verified_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_waitlist_email`
- `idx_waitlist_otp_expires`
- `idx_waitlist_verified_at`

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Users
- Users can view, update, and insert their own profile

### Merchants
- Anyone can view public merchants
- Merchants can view and manage their own profile

### Listings
- Anyone can view active listings
- Users can view, create, and update their own listings

### Escrows
- Users can view, create, and update escrows they're involved in (as buyer or seller)

### Escrow Milestones
- Users can view and manage milestones of escrows they're involved in

### Trades
- Users can view and create trades they're involved in

### Token Operations
- Anyone can view token operations
- Users can create token operations they initiated

### Waitlist Submissions
- Anyone can submit to waitlist
- Users can view their own submission by email

## Functions

### `update_updated_at_column()`
Trigger function that automatically updates the `updated_at` timestamp when a row is updated.

**Security:** `SECURITY DEFINER` with `SET search_path = public` to prevent search_path attacks.

## Triggers

All tables have an `update_updated_at` trigger that calls `update_updated_at_column()` on UPDATE operations.

## Relationships

```
users
  ├── merchants (1:1)
  ├── listings (1:many)
  ├── escrows as buyer (1:many)
  ├── escrows as seller (1:many)
  ├── trades as buyer (1:many)
  ├── trades as seller (1:many)
  └── token_operations (1:many)

merchants
  └── listings (1:many)

listings
  ├── escrows (1:many)
  └── trades (1:many)

escrows
  ├── escrow_milestones (1:many)
  └── trades (1:many)
```

## Notes

- All monetary values use DECIMAL for precision
- Stellar addresses are stored as VARCHAR(56)
- Trustless Work contract IDs are stored as VARCHAR(100) and are unique
- JSONB fields allow flexible schema evolution
- All tables include `created_at` and `updated_at` timestamps
- RLS policies ensure data privacy and security
