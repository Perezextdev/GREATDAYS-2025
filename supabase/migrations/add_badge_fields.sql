-- Migration: Add badge-related fields to registrations table
-- Run this migration in Supabase SQL editor or via CLI

ALTER TABLE registrations
    ADD COLUMN badge_number TEXT,
    ADD COLUMN badge_url TEXT,
    ADD COLUMN badge_generated BOOLEAN DEFAULT FALSE,
    ADD COLUMN print_status BOOLEAN DEFAULT FALSE,
    ADD COLUMN meals_included BOOLEAN DEFAULT FALSE;

-- Optional: create index for badge_number for faster lookup
CREATE INDEX IF NOT EXISTS idx_registrations_badge_number ON registrations(badge_number);
