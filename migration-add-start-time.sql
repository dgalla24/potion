-- Add start_time column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_time INTEGER;

-- Add start_time column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_time INTEGER;

-- Add comment to explain the field
COMMENT ON COLUMN tasks.start_time IS 'Minutes from midnight (0-1439) for schedule view';
COMMENT ON COLUMN events.start_time IS 'Minutes from midnight (0-1439) for schedule view';
