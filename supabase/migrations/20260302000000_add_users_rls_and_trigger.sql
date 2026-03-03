-- Migration: Add RLS policies and handle_new_user trigger for users table
-- Required for issue #31: Connect Personal Information card to database
-- Enables users to read/update their own profile and auto-creates profile on signup

-- Ensure update_updated_at trigger exists for users (uses function from merchants migration)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on users (idempotent - may already be enabled by seed)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS users_insert_own ON users;

-- Users can read their own profile (by auth.uid() or by stellar_address for wallet-only)
-- For Supabase auth: id = auth.uid()
-- For wallet-only: we use a service role API, so this policy covers authenticated users
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users can insert their own profile (for signup flow when trigger doesn't run)
-- Only when the inserted row's id matches the authenticated user
CREATE POLICY users_insert_own ON users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Trigger function: create users profile when auth.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, reputation_score, total_trades, total_volume)
  VALUES (
    NEW.id,
    -- Ensure unique email: use auth email or synthetic for anonymous/wallet users
    COALESCE(NULLIF(TRIM(NEW.email), ''), NEW.id::text || '@auth.local'),
    0,
    0,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (runs in auth schema context)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
