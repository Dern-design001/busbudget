-- ============================================================
-- schema_users.sql — Run in pgAdmin on busbudget database
-- Adds users table + links entries to users
-- ============================================================

-- Users table (populated by Google OAuth on first login)
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL      PRIMARY KEY,
  google_id    TEXT        UNIQUE NOT NULL,
  email        TEXT        UNIQUE NOT NULL,
  name         TEXT,
  avatar       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add user_id column to entries (links each entry to a user)
ALTER TABLE entries ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Sessions table (stores login sessions in DB)
CREATE TABLE IF NOT EXISTS session (
  sid    VARCHAR      NOT NULL COLLATE "default",
  sess   JSON         NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  CONSTRAINT session_pkey PRIMARY KEY (sid)
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);
