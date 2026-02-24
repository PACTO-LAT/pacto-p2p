-- Migration: Create users table (app-level profile)
-- This table extends auth.users with application-specific fields.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL UNIQUE,
  stellar_address VARCHAR,
  reputation_score NUMERIC(5,2) DEFAULT 0 CHECK (reputation_score >= 0 AND reputation_score <= 5),
  total_trades INTEGER DEFAULT 0 CHECK (total_trades >= 0),
  total_volume NUMERIC(20,7) DEFAULT 0 CHECK (total_volume >= 0),
  full_name TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  phone VARCHAR,
  country VARCHAR,
  kyc_status VARCHAR,
  notifications JSONB DEFAULT '{}'::jsonb,
  security JSONB DEFAULT '{}'::jsonb,
  payment_methods JSONB DEFAULT '[]'::jsonb,
  user_status VARCHAR DEFAULT 'active',
  user_type VARCHAR DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_stellar_address ON users(stellar_address);

