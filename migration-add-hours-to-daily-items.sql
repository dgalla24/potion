-- Add hours column to daily_items table
ALTER TABLE daily_items ADD COLUMN IF NOT EXISTS hours NUMERIC DEFAULT 0;
