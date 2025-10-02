import { Assignment, Task, Class, Exam, Event, DailyItem } from '@/types';

const ASSIGNMENTS_KEY = 'potion_assignments';
const TASKS_KEY = 'potion_tasks';
const CLASSES_KEY = 'potion_classes';
const EXAMS_KEY = 'potion_exams';
const EVENTS_KEY = 'potion_events';
const DAILY_ITEMS_KEY = 'potion_daily_items';

export const storage = {
  assignments: {
    getAll(): Assignment[] {
      if (typeof window === 'undefined') return [];
      try {
        const data = localStorage.getItem(ASSIGNMENTS_KEY);
        if (!data) return [];
        const assignments = JSON.parse(data);
        return assignments.map((assignment: any) => ({
          ...assignment,
          dueDate: new Date(assignment.dueDate),
          createdAt: new Date(assignment.createdAt),
          updatedAt: new Date(assignment.updatedAt),
        }));
      } catch (error) {
        console.error('Error loading assignments:', error);
        return [];
      }
    },

    save(assignments: Assignment[]): void {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
      } catch (error) {
        console.error('Error saving assignments:', error);
      }
    },

    add(assignment: Omit<Assignment, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Assignment {
      const newAssignment: Assignment = {
        ...assignment,
        type: 'assignment',
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const assignments = this.getAll();
      assignments.push(newAssignment);
      this.save(assignments);
      return newAssignment;
    },

    update(id: string, updates: Partial<Omit<Assignment, 'id' | 'createdAt'>>): Assignment | null {
      const assignments = this.getAll();
      const index = assignments.findIndex(a => a.id === id);
      if (index === -1) return null;

      assignments[index] = {
        ...assignments[index],
        ...updates,
        updatedAt: new Date(),
      };

      this.save(assignments);
      return assignments[index];
    },

    delete(id: string): boolean {
      const assignments = this.getAll();
      const filtered = assignments.filter(a => a.id !== id);
      if (filtered.length === assignments.length) return false;

      this.save(filtered);
      return true;
    },
  },

  tasks: {
    getAll(): Task[] {
      if (typeof window === 'undefined') return [];
      try {
        const data = localStorage.getItem(TASKS_KEY);
        if (!data) return [];
        const tasks = JSON.parse(data);
        return tasks.map((task: any) => ({
          ...task,
          scheduledDate: new Date(task.scheduledDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }));
      } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
      }
    },

    save(tasks: Task[]): void {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    },

    add(task: Omit<Task, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Task {
      const newTask: Task = {
        ...task,
        type: 'task',
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tasks = this.getAll();
      tasks.push(newTask);
      this.save(tasks);
      return newTask;
    },

    update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
      const tasks = this.getAll();
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) return null;

      tasks[index] = {
        ...tasks[index],
        ...updates,
        updatedAt: new Date(),
      };

      this.save(tasks);
      return tasks[index];
    },

    delete(id: string): boolean {
      const tasks = this.getAll();
      const filtered = tasks.filter(t => t.id !== id);
      if (filtered.length === tasks.length) return false;

      this.save(filtered);
      return true;
    },

    getByAssignment(assignmentId: string): Task[] {
      return this.getAll().filter(task => task.assignmentId === assignmentId);
    },

    getByExam(examId: string): Task[] {
      return this.getAll().filter(task => task.examId === examId);
    },

    getByDate(date: Date): Task[] {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      return this.getAll().filter(task => {
        const taskDate = new Date(task.scheduledDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === targetDate.getTime();
      });
    },
  },

  classes: {
    getAll(): Class[] {
      if (typeof window === 'undefined') return [];
      try {
        const data = localStorage.getItem(CLASSES_KEY);
        if (!data) return [];
        const classes = JSON.parse(data);
        return classes.map((class_: any) => ({
          ...class_,
          createdAt: new Date(class_.createdAt),
          updatedAt: new Date(class_.updatedAt),
        }));
      } catch (error) {
        console.error('Error loading classes:', error);
        return [];
      }
    },

    save(classes: Class[]): void {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
      } catch (error) {
        console.error('Error saving classes:', error);
      }
    },

    add(class_: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): Class {
      const newClass: Class = {
        ...class_,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const classes = this.getAll();
      classes.push(newClass);
      this.save(classes);
      return newClass;
    },

    update(id: string, updates: Partial<Omit<Class, 'id' | 'createdAt'>>): Class | null {
      const classes = this.getAll();
      const index = classes.findIndex(c => c.id === id);
      if (index === -1) return null;

      classes[index] = {
        ...classes[index],
        ...updates,
        updatedAt: new Date(),
      };

      this.save(classes);
      return classes[index];
    },

    delete(id: string): boolean {
      const classes = this.getAll();
      const filtered = classes.filter(c => c.id !== id);
      if (filtered.length === classes.length) return false;

      this.save(filtered);
      return true;
    },
  },

  exams: {
    getAll(): Exam[] {
      if (typeof window === 'undefined') return [];
      try {
        const data = localStorage.getItem(EXAMS_KEY);
        if (!data) return [];
        const exams = JSON.parse(data);
        return exams.map((exam: any) => ({
          ...exam,
          dueDate: new Date(exam.dueDate),
          createdAt: new Date(exam.createdAt),
          updatedAt: new Date(exam.updatedAt),
        }));
      } catch (error) {
        console.error('Error loading exams:', error);
        return [];
      }
    },

    save(exams: Exam[]): void {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
      } catch (error) {
        console.error('Error saving exams:', error);
      }
    },

    add(exam: Omit<Exam, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Exam {
      const newExam: Exam = {
        ...exam,
        type: 'exam',
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const exams = this.getAll();
      exams.push(newExam);
      this.save(exams);
      return newExam;
    },

    update(id: string, updates: Partial<Omit<Exam, 'id' | 'createdAt'>>): Exam | null {
      const exams = this.getAll();
      const index = exams.findIndex(e => e.id === id);
      if (index === -1) return null;

      exams[index] = {
        ...exams[index],
        ...updates,
        updatedAt: new Date(),
      };

      this.save(exams);
      return exams[index];
    },

    delete(id: string): boolean {
      const exams = this.getAll();
      const filtered = exams.filter(e => e.id !== id);
      if (filtered.length === exams.length) return false;

      this.save(filtered);
      return true;
    },
  },

  events: {
    getAll(): Event[] {
      if (typeof window === 'undefined') return [];
      try {
        const data = localStorage.getItem(EVENTS_KEY);
        if (!data) return [];
        const events = JSON.parse(data);
        return events.map((event: any) => ({
          ...event,
          scheduledDate: new Date(event.scheduledDate),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
        }));
      } catch (error) {
        console.error('Error loading events:', error);
        return [];
      }
    },

    save(events: Event[]): void {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
      } catch (error) {
        console.error('Error saving events:', error);
      }
    },

    add(event: Omit<Event, 'id' | 'type' | 'createdAt' | 'updatedAt'>): Event {
      const newEvent: Event = {
        ...event,
        type: 'event',
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const events = this.getAll();
      events.push(newEvent);
      this.save(events);
      return newEvent;
    },

    update(id: string, updates: Partial<Omit<Event, 'id' | 'createdAt'>>): Event | null {
      const events = this.getAll();
      const index = events.findIndex(e => e.id === id);
      if (index === -1) return null;

      events[index] = {
        ...events[index],
        ...updates,
        updatedAt: new Date(),
      };

      this.save(events);
      return events[index];
    },

    delete(id: string): boolean {
      const events = this.getAll();
      const filtered = events.filter(e => e.id !== id);
      if (filtered.length === events.length) return false;

      this.save(filtered);
      return true;
    },

    getByAssignment(assignmentId: string): Event[] {
      return this.getAll().filter(event => event.assignmentId === assignmentId);
    },

    getByExam(examId: string): Event[] {
      return this.getAll().filter(event => event.examId === examId);
    },

    getByDate(date: Date): Event[] {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      return this.getAll().filter(event => {
        const eventDate = new Date(event.scheduledDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === targetDate.getTime();
      });
    },
  },

  dailyItems: {
    getAll(): DailyItem[] {
      if (typeof window === 'undefined') return [];
      try {
        const data = localStorage.getItem(DAILY_ITEMS_KEY);
        if (!data) return [];
        const items = JSON.parse(data);
        return items.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
      } catch (error) {
        console.error('Error loading daily items:', error);
        return [];
      }
    },

    save(items: DailyItem[]): void {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(DAILY_ITEMS_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Error saving daily items:', error);
      }
    },

    add(item: Omit<DailyItem, 'id' | 'createdAt' | 'updatedAt'>): DailyItem {
      const newItem: DailyItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const items = this.getAll();
      items.push(newItem);
      this.save(items);
      return newItem;
    },

    update(id: string, updates: Partial<Omit<DailyItem, 'id' | 'createdAt'>>): DailyItem | null {
      const items = this.getAll();
      const index = items.findIndex(i => i.id === id);
      if (index === -1) return null;

      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date(),
      };

      this.save(items);
      return items[index];
    },

    delete(id: string): boolean {
      const items = this.getAll();
      const filtered = items.filter(i => i.id !== id);
      if (filtered.length === items.length) return false;

      this.save(filtered);
      return true;
    },

    // Reset all items' completed status to false for a new day
    resetForNewDay(today: string): void {
      const items = this.getAll();
      const updatedItems = items.map(item => {
        // Only reset if it's a new day
        if (item.lastResetDate !== today) {
          return {
            ...item,
            completed: false,
            lastResetDate: today,
            updatedAt: new Date(),
          };
        }
        return item;
      });
      this.save(updatedItems);
    },
  },
};