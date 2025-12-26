-- Migration: Add daily goal instances for per-day tracking
-- This allows daily goals to have completion status tracked per day
-- while daily_items becomes the template

-- Step 1: Create daily_goal_instances table
CREATE TABLE IF NOT EXISTS daily_goal_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  daily_item_id UUID REFERENCES daily_items(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, daily_item_id, date)
);

-- Step 2: Enable Row Level Security
ALTER TABLE daily_goal_instances ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies
CREATE POLICY "Users can view their own daily goal instances"
  ON daily_goal_instances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily goal instances"
  ON daily_goal_instances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily goal instances"
  ON daily_goal_instances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily goal instances"
  ON daily_goal_instances FOR DELETE
  USING (auth.uid() = user_id);

-- Step 4: Create trigger for updated_at
CREATE TRIGGER update_daily_goal_instances_updated_at
  BEFORE UPDATE ON daily_goal_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Migrate existing daily_items completed status to today's instances
-- For each existing daily_item, create an instance for today with current completed status
INSERT INTO daily_goal_instances (user_id, daily_item_id, date, completed)
SELECT
  user_id,
  id as daily_item_id,
  CURRENT_DATE as date,
  completed
FROM daily_items
ON CONFLICT (user_id, daily_item_id, date) DO NOTHING;

-- Step 6: Remove completed and last_reset_date from daily_items (now just templates)
ALTER TABLE daily_items DROP COLUMN IF EXISTS completed;
ALTER TABLE daily_items DROP COLUMN IF EXISTS last_reset_date;

-- Step 7: Create index for faster lookups
CREATE INDEX idx_daily_goal_instances_user_date
  ON daily_goal_instances(user_id, date);

CREATE INDEX idx_daily_goal_instances_daily_item
  ON daily_goal_instances(daily_item_id);
