import { supabase } from './supabase';
import { Assignment, Task, Class, Exam, Event, DailyItem } from '@/types';

// Helper to convert snake_case from DB to camelCase for app
const toCamelCase = (obj: any) => {
  if (!obj) return obj;
  return {
    ...obj,
    dueDate: obj.due_date ? new Date(obj.due_date) : undefined,
    scheduledDate: obj.scheduled_date ? new Date(obj.scheduled_date) : undefined,
    classId: obj.class_id,
    assignmentId: obj.assignment_id,
    examId: obj.exam_id,
    userId: obj.user_id,
    lastResetDate: obj.last_reset_date,
    createdAt: new Date(obj.created_at),
    updatedAt: new Date(obj.updated_at),
  };
};

// Helper to convert camelCase to snake_case for DB
const toSnakeCase = (obj: any) => {
  const result: any = { ...obj };
  if (obj.dueDate) result.due_date = obj.dueDate;
  if (obj.scheduledDate) result.scheduled_date = obj.scheduledDate;
  if (obj.classId !== undefined) result.class_id = obj.classId;
  if (obj.assignmentId !== undefined) result.assignment_id = obj.assignmentId;
  if (obj.examId !== undefined) result.exam_id = obj.examId;
  if (obj.lastResetDate) result.last_reset_date = obj.lastResetDate;

  // Remove camelCase versions
  delete result.dueDate;
  delete result.scheduledDate;
  delete result.classId;
  delete result.assignmentId;
  delete result.examId;
  delete result.userId;
  delete result.lastResetDate;
  delete result.createdAt;
  delete result.updatedAt;

  return result;
};

export const supabaseStorage = {
  assignments: {
    async getAll(): Promise<Assignment[]> {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (data || []).map(toCamelCase);
    },

    async add(assignment: Omit<Assignment, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Assignment> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('assignments')
        .insert([{ ...toSnakeCase(assignment), user_id: user.id, type: 'assignment' }])
        .select()
        .single();

      if (error) throw error;
      return toCamelCase(data);
    },

    async update(id: string, updates: Partial<Omit<Assignment, 'id' | 'createdAt'>>): Promise<Assignment | null> {
      const { data, error } = await supabase
        .from('assignments')
        .update(toSnakeCase(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? toCamelCase(data) : null;
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);

      return !error;
    },
  },

  tasks: {
    async getAll(): Promise<Task[]> {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return (data || []).map(toCamelCase);
    },

    async add(task: Omit<Task, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Task> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...toSnakeCase(task), user_id: user.id, type: 'task' }])
        .select()
        .single();

      if (error) throw error;
      return toCamelCase(data);
    },

    async update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
      const { data, error } = await supabase
        .from('tasks')
        .update(toSnakeCase(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? toCamelCase(data) : null;
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      return !error;
    },
  },

  exams: {
    async getAll(): Promise<Exam[]> {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (data || []).map(toCamelCase);
    },

    async add(exam: Omit<Exam, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Exam> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('exams')
        .insert([{ ...toSnakeCase(exam), user_id: user.id, type: 'exam' }])
        .select()
        .single();

      if (error) throw error;
      return toCamelCase(data);
    },

    async update(id: string, updates: Partial<Omit<Exam, 'id' | 'createdAt'>>): Promise<Exam | null> {
      const { data, error } = await supabase
        .from('exams')
        .update(toSnakeCase(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? toCamelCase(data) : null;
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      return !error;
    },
  },

  events: {
    async getAll(): Promise<Event[]> {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('scheduled_date', { ascending: true});

      if (error) throw error;
      return (data || []).map(toCamelCase);
    },

    async add(event: Omit<Event, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<Event> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('events')
        .insert([{ ...toSnakeCase(event), user_id: user.id, type: 'event' }])
        .select()
        .single();

      if (error) throw error;
      return toCamelCase(data);
    },

    async update(id: string, updates: Partial<Omit<Event, 'id' | 'createdAt'>>): Promise<Event | null> {
      const { data, error } = await supabase
        .from('events')
        .update(toSnakeCase(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? toCamelCase(data) : null;
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      return !error;
    },
  },

  classes: {
    async getAll(): Promise<Class[]> {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return (data || []).map(toCamelCase);
    },

    async add(class_: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): Promise<Class> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('classes')
        .insert([{ ...class_, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return toCamelCase(data);
    },

    async update(id: string, updates: Partial<Omit<Class, 'id' | 'createdAt'>>): Promise<Class | null> {
      const { data, error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? toCamelCase(data) : null;
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      return !error;
    },
  },

  dailyItems: {
    async getAll(): Promise<DailyItem[]> {
      const { data, error } = await supabase
        .from('daily_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(toCamelCase);
    },

    async add(item: Omit<DailyItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyItem> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('daily_items')
        .insert([{ ...toSnakeCase(item), user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return toCamelCase(data);
    },

    async update(id: string, updates: Partial<Omit<DailyItem, 'id' | 'createdAt'>>): Promise<DailyItem | null> {
      const { data, error } = await supabase
        .from('daily_items')
        .update(toSnakeCase(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? toCamelCase(data) : null;
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await supabase
        .from('daily_items')
        .delete()
        .eq('id', id);

      return !error;
    },

    async resetForNewDay(today: string): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('daily_items')
        .update({ completed: false, last_reset_date: today })
        .eq('user_id', user.id)
        .neq('last_reset_date', today);
    },
  },
};
