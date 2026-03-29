-- Migration: Allow authenticated users to read public profile fields of other users
-- Required so listing cards can display merchant avatar, name, reputation, and trade count
-- Previously, users_select_own only allowed reading your own row (id = auth.uid()),
-- which meant the `user:users(*)` join on listings returned null for other users.

DROP POLICY IF EXISTS users_select_public ON users;

-- Any authenticated user can read basic public profile info of any user
CREATE POLICY users_select_public ON users
  FOR SELECT
  USING (auth.role() = 'authenticated');
