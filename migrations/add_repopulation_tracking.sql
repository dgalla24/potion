-- Migration: Add repopulation tracking
-- This migration adds a table to track when daily goals and class instances
-- were last repopulated to avoid regenerating already-populated dates

-- Create repopulation_tracking table
CREATE TABLE IF NOT EXISTS repopulation_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('daily_goals', 'classes')),
  last_repopulated_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entity_type)
);

-- Add RLS policies
ALTER TABLE repopulation_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own repopulation tracking"
  ON repopulation_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own repopulation tracking"
  ON repopulation_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repopulation tracking"
  ON repopulation_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repopulation tracking"
  ON repopulation_tracking FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_repopulation_tracking_updated_at
  BEFORE UPDATE ON repopulation_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
