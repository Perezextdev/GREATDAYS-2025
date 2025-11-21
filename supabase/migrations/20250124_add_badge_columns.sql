-- Add missing columns for Badge System and Analytics
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS badge_number TEXT UNIQUE;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS badge_generated BOOLEAN DEFAULT false;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS badge_url TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS print_status BOOLEAN DEFAULT false;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS meal_ticket_issued BOOLEAN DEFAULT false;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS departure_date DATE;

-- Update location_type check constraint to be more flexible or match new values
-- Dropping the constraint for now to allow 'Local', 'International', etc.
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_location_type_check;
