-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own classes" ON classes;
DROP POLICY IF EXISTS "Users can insert their own classes" ON classes;
DROP POLICY IF EXISTS "Users can update their own classes" ON classes;
DROP POLICY IF EXISTS "Users can delete their own classes" ON classes;

DROP POLICY IF EXISTS "Users can view their own assignments" ON assignments;
DROP POLICY IF EXISTS "Users can insert their own assignments" ON assignments;
DROP POLICY IF EXISTS "Users can update their own assignments" ON assignments;
DROP POLICY IF EXISTS "Users can delete their own assignments" ON assignments;

DROP POLICY IF EXISTS "Users can view their own exams" ON exams;
DROP POLICY IF EXISTS "Users can insert their own exams" ON exams;
DROP POLICY IF EXISTS "Users can update their own exams" ON exams;
DROP POLICY IF EXISTS "Users can delete their own exams" ON exams;

DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

DROP POLICY IF EXISTS "Users can view their own events" ON events;
DROP POLICY IF EXISTS "Users can insert their own events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

DROP POLICY IF EXISTS "Users can view their own daily items" ON daily_items;
DROP POLICY IF EXISTS "Users can insert their own daily items" ON daily_items;
DROP POLICY IF EXISTS "Users can update their own daily items" ON daily_items;
DROP POLICY IF EXISTS "Users can delete their own daily items" ON daily_items;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
DROP TRIGGER IF EXISTS update_assignments_updated_at ON assignments;
DROP TRIGGER IF EXISTS update_exams_updated_at ON exams;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_daily_items_updated_at ON daily_items;

-- Drop existing tables
DROP TABLE IF EXISTS daily_items CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();
