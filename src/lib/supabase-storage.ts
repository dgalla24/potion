import { supabase } from './supabase';
import { Assignment, Task, Class, Exam, Event, DailyItem, DailyGoalInstance, ClassInstance } from '@/types';

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
    startTime: obj.start_time,
    endTime: obj.end_time,
    daysOfWeek: obj.days_of_week ? JSON.parse(obj.days_of_week) : undefined,
    dailyItemId: obj.daily_item_id,
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
  if (obj.startTime !== undefined) result.start_time = obj.startTime;
  if (obj.endTime !== undefined) result.end_time = obj.endTime;
  if (obj.daysOfWeek !== undefined) result.days_of_week = JSON.stringify(obj.daysOfWeek);
  if (obj.dailyItemId !== undefined) result.daily_item_id = obj.dailyItemId;

  // Remove camelCase versions
  delete result.dueDate;
  delete result.scheduledDate;
  delete result.classId;
  delete result.assignmentId;
  delete result.examId;
  delete result.userId;
  delete result.startTime;
  delete result.endTime;
  delete result.daysOfWeek;
  delete result.dailyItemId;
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
        .insert([{ ...toSnakeCase(class_), user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return toCamelCase(data);
    },

    async update(id: string, updates: Partial<Omit<Class, 'id' | 'createdAt'>>): Promise<Class | null> {
      const { data, error } = await supabase
        .from('classes')
        .update(toSnakeCase(updates))
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
  },

  dailyGoalInstances: {
    async getAll(): Promise<DailyGoalInstance[]> {
      const { data, error } = await supabase
        .from('daily_goal_instances')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return (data || []).map(toCamelCase);
    },

    async getByDateRange(startDate: string, endDate: string): Promise<DailyGoalInstance[]> {
      const { data, error } = await supabase
        .from('daily_goal_instances')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return (data || []).map(toCamelCase);
    },

    async add(instance: Omit<DailyGoalInstance, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyGoalInstance> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('daily_goal_instances')
        .insert([{ ...toSnakeCase(instance), user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return toCamelCase(data);
    },

    async addBatch(instances: Omit<DailyGoalInstance, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<DailyGoalInstance[]> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('daily_goal_instances')
        .insert(instances.map(inst => ({ ...toSnakeCase(inst), user_id: user.id })))
        .select();

      if (error) throw error;
      return (data || []).map(toCamelCase);
    },

    async update(id: string, updates: Partial<Omit<DailyGoalInstance, 'id' | 'createdAt'>>): Promise<DailyGoalInstance | null> {
      const { data, error } = await supabase
        .from('daily_goal_instances')
        .update(toSnakeCase(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? toCamelCase(data) : null;
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await supabase
        .from('daily_goal_instances')
        .delete()
        .eq('id', id);

      return !error;
    },

    async deleteByDailyItemId(dailyItemId: string): Promise<boolean> {
      const { error } = await supabase
        .from('daily_goal_instances')
        .delete()
        .eq('daily_item_id', dailyItemId);

      return !error;
    },

    async updateFutureInstances(dailyItemId: string, fromDate: string): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete all future instances for this daily item
      await supabase
        .from('daily_goal_instances')
        .delete()
        .eq('user_id', user.id)
        .eq('daily_item_id', dailyItemId)
        .gte('date', fromDate);
    },

    async generateInstancesForDateRange(dailyItems: DailyItem[], startDate: string, endDate: string): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, get all existing instances in this date range
      const { data: existingInstances } = await supabase
        .from('daily_goal_instances')
        .select('daily_item_id, date')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      // Create a Set of existing instance keys for quick lookup
      const existingKeys = new Set(
        (existingInstances || []).map(inst => `${inst.daily_item_id}_${inst.date}`)
      );

      const instances: any[] = [];

      // Parse dates as local dates to avoid timezone issues
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
      const start = new Date(startYear, startMonth - 1, startDay);
      const end = new Date(endYear, endMonth - 1, endDay);

      for (const item of dailyItems) {
        const current = new Date(start);
        while (current <= end) {
          const year = current.getFullYear();
          const month = String(current.getMonth() + 1).padStart(2, '0');
          const day = String(current.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          const key = `${item.id}_${dateStr}`;

          // Only add if this instance doesn't already exist
          if (!existingKeys.has(key)) {
            instances.push({
              user_id: user.id,
              daily_item_id: item.id,
              date: dateStr,
              completed: false,
            });
          }

          current.setDate(current.getDate() + 1);
        }
      }

      if (instances.length > 0) {
        // Insert only new instances (no upsert to avoid overwriting completed status)
        await supabase
          .from('daily_goal_instances')
          .insert(instances);
      }
    },

    async deleteByDate(date: string): Promise<boolean> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('daily_goal_instances')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);

      return !error;
    },
  },

  classInstances: {
    async getAll(): Promise<ClassInstance[]> {
      const { data, error } = await supabase
        .from('class_instances')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return (data || []).map(toCamelCase);
    },

    async getByDateRange(startDate: string, endDate: string): Promise<ClassInstance[]> {
      const { data, error } = await supabase
        .from('class_instances')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return (data || []).map(toCamelCase);
    },

    async add(instance: Omit<ClassInstance, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClassInstance> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('class_instances')
        .insert([{ ...toSnakeCase(instance), user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return toCamelCase(data);
    },

    async addBatch(instances: Omit<ClassInstance, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ClassInstance[]> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('class_instances')
        .insert(instances.map(inst => ({ ...toSnakeCase(inst), user_id: user.id })))
        .select();

      if (error) throw error;
      return (data || []).map(toCamelCase);
    },

    async update(id: string, updates: Partial<Omit<ClassInstance, 'id' | 'createdAt'>>): Promise<ClassInstance | null> {
      const { data, error } = await supabase
        .from('class_instances')
        .update(toSnakeCase(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? toCamelCase(data) : null;
    },

    async delete(id: string): Promise<boolean> {
      const { error } = await supabase
        .from('class_instances')
        .delete()
        .eq('id', id);

      return !error;
    },

    async deleteByClassId(classId: string): Promise<boolean> {
      const { error } = await supabase
        .from('class_instances')
        .delete()
        .eq('class_id', classId);

      return !error;
    },

    async updateFutureInstances(classId: string, fromDate: string): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete all future instances for this class
      await supabase
        .from('class_instances')
        .delete()
        .eq('user_id', user.id)
        .eq('class_id', classId)
        .gte('date', fromDate);
    },

    async generateInstancesForDateRange(classes: Class[], startDate: string, endDate: string): Promise<void> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, get all existing instances in this date range
      const { data: existingInstances } = await supabase
        .from('class_instances')
        .select('class_id, date')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      // Create a Set of existing instance keys for quick lookup
      const existingKeys = new Set(
        (existingInstances || []).map(inst => `${inst.class_id}_${inst.date}`)
      );

      const instances: any[] = [];

      // Parse dates as local dates to avoid timezone issues
      const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
      const start = new Date(startYear, startMonth - 1, startDay);
      const end = new Date(endYear, endMonth - 1, endDay);

      for (const classItem of classes) {
        // Skip classes without a schedule
        if (!classItem.daysOfWeek || classItem.daysOfWeek.length === 0) {
          continue;
        }

        const current = new Date(start);
        while (current <= end) {
          const year = current.getFullYear();
          const month = String(current.getMonth() + 1).padStart(2, '0');
          const day = String(current.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;

          const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

          // Convert to ISO day (1 = Monday, 7 = Sunday)
          const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

          // Check if this class meets on this day of the week
          if (classItem.daysOfWeek.includes(isoDayOfWeek)) {
            const key = `${classItem.id}_${dateStr}`;

            // Only add if this instance doesn't already exist
            if (!existingKeys.has(key)) {
              instances.push({
                user_id: user.id,
                class_id: classItem.id,
                date: dateStr,
                completed: false,
                cancelled: false,
              });
            }
          }

          current.setDate(current.getDate() + 1);
        }
      }

      if (instances.length > 0) {
        // Insert only new instances (no upsert to avoid overwriting cancelled status)
        await supabase
          .from('class_instances')
          .insert(instances);
      }
    },

    async deleteByDate(date: string, classId: string): Promise<boolean> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('class_instances')
        .delete()
        .eq('user_id', user.id)
        .eq('class_id', classId)
        .eq('date', date);

      return !error;
    },
  },
};
