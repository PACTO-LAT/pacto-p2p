# Profile Update Migration Guide

## Overview

This guide helps you verify and update your Supabase database to ensure compatibility with the new profile update implementation.

## Database Verification

### 1. Check Users Table Structure

Run this query in Supabase SQL Editor to verify the `users` table has all required columns:

```sql
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

### 2. Required Columns

Ensure these columns exist:

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | uuid | NO | Primary key |
| email | varchar(255) | NO | Unique |
| stellar_address | varchar(56) | YES | Unique |
| full_name | text | YES | |
| username | varchar(50) | YES | Unique |
| bio | text | YES | |
| avatar_url | text | YES | |
| phone | varchar(20) | YES | |
| country | varchar(2) | YES | ISO code |
| kyc_status | varchar(20) | YES | Default: 'pending' |
| reputation_score | numeric(3,2) | YES | Default: 0.00 |
| total_trades | integer | YES | Default: 0 |
| total_volume | numeric(20,7) | YES | Default: 0 |
| notifications | jsonb | YES | |
| security | jsonb | YES | |
| payment_methods | jsonb | YES | |
| created_at | timestamptz | YES | |
| updated_at | timestamptz | YES | |

### 3. Add Missing Columns (if needed)

If any columns are missing, add them:

```sql
-- Add username column if missing
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- Add bio column if missing
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add phone column if missing
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add country column if missing
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS country VARCHAR(2);

-- Add notifications JSONB column if missing
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS notifications JSONB;

-- Add security JSONB column if missing
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS security JSONB;

-- Add payment_methods JSONB column if missing
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS payment_methods JSONB;
```

### 4. Create Indexes

Ensure these indexes exist for optimal performance:

```sql
-- Index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- Index on username for uniqueness checks
CREATE INDEX IF NOT EXISTS idx_users_username 
ON users(username);

-- Index on stellar_address for wallet lookups
CREATE INDEX IF NOT EXISTS idx_users_stellar_address 
ON users(stellar_address);

-- Index on kyc_status for filtering
CREATE INDEX IF NOT EXISTS idx_users_kyc_status 
ON users(kyc_status);
```

### 5. Update Trigger

Ensure the `updated_at` trigger exists:

```sql
-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Create trigger on users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 6. Row Level Security (RLS)

Verify RLS policies allow users to update their own profiles:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 7. Verify Constraints

Check unique constraints:

```sql
-- Verify unique constraints exist
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_name = 'users';
```

Expected constraints:
- `users_email_key` on `email`
- `users_username_key` on `username`
- `users_stellar_address_key` on `stellar_address`

### 8. Add Constraints (if missing)

```sql
-- Add unique constraint on email
ALTER TABLE users 
ADD CONSTRAINT users_email_key 
UNIQUE (email);

-- Add unique constraint on username
ALTER TABLE users 
ADD CONSTRAINT users_username_key 
UNIQUE (username);

-- Add unique constraint on stellar_address
ALTER TABLE users 
ADD CONSTRAINT users_stellar_address_key 
UNIQUE (stellar_address);
```

## Data Migration

### Migrate Existing Payment Methods

If you have existing users with old payment_methods structure, migrate them:

```sql
-- Backup existing data
CREATE TABLE users_payment_methods_backup AS
SELECT id, payment_methods
FROM users
WHERE payment_methods IS NOT NULL;

-- Migrate to new structure (example)
UPDATE users
SET payment_methods = jsonb_build_object(
  'sinpe_number', payment_methods->>'sinpe_number',
  'preferred_method', COALESCE(payment_methods->>'preferred_method', 'sinpe'),
  'bank_accounts', CASE
    WHEN payment_methods->>'bank_iban' IS NOT NULL THEN
      jsonb_build_array(
        jsonb_build_object(
          'bank_iban', payment_methods->>'bank_iban',
          'bank_name', payment_methods->>'bank_name',
          'bank_account_holder', payment_methods->>'bank_account_holder'
        )
      )
    ELSE '[]'::jsonb
  END
)
WHERE payment_methods IS NOT NULL;
```

### Set Default Values

Set default values for existing users:

```sql
-- Set default notifications for existing users
UPDATE users
SET notifications = jsonb_build_object(
  'email_trades', true,
  'email_escrows', true,
  'push_notifications', true,
  'sms_notifications', false
)
WHERE notifications IS NULL;

-- Set default security settings for existing users
UPDATE users
SET security = jsonb_build_object(
  'two_factor_enabled', false,
  'login_notifications', true
)
WHERE security IS NULL;

-- Set default payment_methods for existing users
UPDATE users
SET payment_methods = jsonb_build_object(
  'sinpe_number', '',
  'preferred_method', 'sinpe',
  'bank_accounts', '[]'::jsonb
)
WHERE payment_methods IS NULL;
```

## Testing

### 1. Test Profile Update

```sql
-- Test updating a user profile
UPDATE users
SET 
  full_name = 'Test User',
  username = 'testuser123',
  bio = 'Test bio',
  phone = '+15551234567',
  country = 'US'
WHERE id = 'YOUR_USER_ID';

-- Verify updated_at was updated
SELECT id, full_name, updated_at
FROM users
WHERE id = 'YOUR_USER_ID';
```

### 2. Test Unique Constraints

```sql
-- This should fail with unique constraint violation
UPDATE users
SET email = 'existing@example.com'
WHERE id = 'DIFFERENT_USER_ID';
```

### 3. Test JSONB Updates

```sql
-- Test updating notifications
UPDATE users
SET notifications = jsonb_build_object(
  'email_trades', false,
  'email_escrows', true,
  'push_notifications', false,
  'sms_notifications', true
)
WHERE id = 'YOUR_USER_ID';

-- Verify JSONB structure
SELECT id, notifications
FROM users
WHERE id = 'YOUR_USER_ID';
```

## Rollback Plan

If you need to rollback changes:

```sql
-- Restore from backup (if you created one)
UPDATE users u
SET payment_methods = b.payment_methods
FROM users_payment_methods_backup b
WHERE u.id = b.id;

-- Drop new columns (if needed)
ALTER TABLE users DROP COLUMN IF EXISTS notifications;
ALTER TABLE users DROP COLUMN IF EXISTS security;

-- Remove new indexes
DROP INDEX IF EXISTS idx_users_username;
```

## Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Verification Checklist

- [ ] All required columns exist in `users` table
- [ ] Unique constraints on email, username, stellar_address
- [ ] Indexes created for performance
- [ ] `updated_at` trigger working
- [ ] RLS policies allow user updates
- [ ] JSONB columns have correct structure
- [ ] Existing data migrated (if applicable)
- [ ] Test profile update works
- [ ] Test unique constraint violations
- [ ] Test JSONB updates
- [ ] Environment variables configured

## Support

If you encounter issues:

1. Check Supabase logs for detailed error messages
2. Verify RLS policies are not blocking updates
3. Ensure user is authenticated (auth.uid() returns valid ID)
4. Check browser console for client-side errors
5. Review validation error messages in toast notifications
