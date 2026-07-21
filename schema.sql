-- ============================================================
-- schema.sql — Run this ONCE in your PostgreSQL database
-- Creates the busbudget database and entries table
-- ============================================================

-- Create database (run this line separately if needed)
-- CREATE DATABASE busbudget;

-- Connect to busbudget database first, then run below:

CREATE TABLE IF NOT EXISTS entries (
  id         TEXT        PRIMARY KEY,
  date       DATE        NOT NULL UNIQUE,
  budget     NUMERIC     NOT NULL DEFAULT 0,
  spent      NUMERIC     NOT NULL DEFAULT 0,
  saved      NUMERIC     NOT NULL DEFAULT 0,
  expenses   JSONB       NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast date-based queries
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date DESC);
