-- =============================================================================
-- Add user_status and user_type fields to users table
-- =============================================================================

-- This migration is intentionally idempotent so `supabase db reset` and
-- repeated local runs won't fail if columns/indexes already exist.

-- ---------------------------------------------------------------------------
-- user_status
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'user_status'
  ) THEN
    ALTER TABLE public.users
      ADD COLUMN user_status VARCHAR(20);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_user_status_check'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_user_status_check
      CHECK (user_status IN ('active', 'pending', 'denied'));
  END IF;

  UPDATE public.users
    SET user_status = 'active'
  WHERE user_status IS NULL;

  ALTER TABLE public.users
    ALTER COLUMN user_status SET DEFAULT 'active';

  ALTER TABLE public.users
    ALTER COLUMN user_status SET NOT NULL;
END
$$;

CREATE INDEX IF NOT EXISTS idx_users_user_status ON public.users(user_status);

-- ---------------------------------------------------------------------------
-- user_type
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'user_type'
  ) THEN
    ALTER TABLE public.users
      ADD COLUMN user_type VARCHAR(20);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_user_type_check'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_user_type_check
      CHECK (user_type IN ('admin', 'user', 'merchant'));
  END IF;

  UPDATE public.users
    SET user_type = 'user'
  WHERE user_type IS NULL;

  ALTER TABLE public.users
    ALTER COLUMN user_type SET DEFAULT 'user';

  ALTER TABLE public.users
    ALTER COLUMN user_type SET NOT NULL;
END
$$;

CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
