-- Migration: Add class schedules and instances
-- This allows classes to have recurring schedules and track individual sessions

-- Step 1: Add schedule fields to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS days_of_week TEXT; -- JSON array of day numbers: 1=Monday, 7=Sunday
ALTER TABLE classes ADD COLUMN IF NOT EXISTS start_time TEXT; -- HH:MM format (e.g., "09:00")
ALTER TABLE classes ADD COLUMN IF NOT EXISTS end_time TEXT; -- HH:MM format (e.g., "10:30")
ALTER TABLE classes ADD COLUMN IF NOT EXISTS duration NUMERIC DEFAULT 0; -- Hours (e.g., 1.5)

-- Step 2: Create class_instances table for individual class sessions
CREATE TABLE IF NOT EXISTS class_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  cancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, class_id, date)
);

-- Step 3: Enable Row Level Security
ALTER TABLE class_instances ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "Users can view their own class instances"
  ON class_instances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own class instances"
  ON class_instances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own class instances"
  ON class_instances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own class instances"
  ON class_instances FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Create trigger for updated_at
CREATE TRIGGER update_class_instances_updated_at
  BEFORE UPDATE ON class_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Create indexes for faster lookups
CREATE INDEX idx_class_instances_user_date
  ON class_instances(user_id, date);

CREATE INDEX idx_class_instances_class_id
  ON class_instances(class_id);
