-- Migration: Add date_range generated column and exclusion constraint to prevent overlapping confirmed bookings
-- Run this with your Supabase migration tooling or psql as the DB owner

-- 1) Enable extension
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2) Add generated daterange column if it doesn't exist
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS date_range daterange GENERATED ALWAYS AS (daterange(check_in_date, check_out_date, '[]')) STORED;

-- 3) Add exclusion constraint to prevent overlapping confirmed bookings for the same property
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_no_overlap_confirmed'
  ) THEN
    EXECUTE 'ALTER TABLE bookings ADD CONSTRAINT bookings_no_overlap_confirmed EXCLUDE USING gist (property_id WITH =, date_range WITH &&) WHERE (status = ''confirmed'');';
  END IF;
END
$$ LANGUAGE plpgsql;

-- Notes:
-- - This prevents two rows with status = 'confirmed' for the same property with overlapping date_range.
-- - Test this in a development/staging environment first. Adding the constraint will fail if existing data violates it.
-- - If your existing data has overlaps, you must resolve them before adding the constraint (e.g., cancel/adjust duplicates or temporarily set status != 'confirmed').
