-- Enable Row Level Security
ALTER DATABASE postgres SET timezone TO 'UTC';

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'assignment' NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  planned BOOLEAN DEFAULT FALSE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'exam' NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  planned BOOLEAN DEFAULT FALSE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'task' NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
  hours NUMERIC DEFAULT 1,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'event' NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
  hours NUMERIC DEFAULT 1,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_items table
CREATE TABLE IF NOT EXISTS daily_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_items ENABLE ROW LEVEL SECURITY;

-- Create policies for classes
CREATE POLICY "Users can view their own classes" ON classes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own classes" ON classes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own classes" ON classes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own classes" ON classes FOR DELETE USING (auth.uid() = user_id);

-- Create policies for assignments
CREATE POLICY "Users can view their own assignments" ON assignments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own assignments" ON assignments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assignments" ON assignments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assignments" ON assignments FOR DELETE USING (auth.uid() = user_id);

-- Create policies for exams
CREATE POLICY "Users can view their own exams" ON exams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own exams" ON exams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own exams" ON exams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own exams" ON exams FOR DELETE USING (auth.uid() = user_id);

-- Create policies for tasks
CREATE POLICY "Users can view their own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Create policies for events
CREATE POLICY "Users can view their own events" ON events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own events" ON events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own events" ON events FOR DELETE USING (auth.uid() = user_id);

-- Create policies for daily_items
CREATE POLICY "Users can view their own daily items" ON daily_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily items" ON daily_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily items" ON daily_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own daily items" ON daily_items FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_items_updated_at BEFORE UPDATE ON daily_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
