import { Assignment, Task, Class } from '@/types';

const ASSIGNMENTS_KEY = 'potion_assignments';
const TASKS_KEY = 'potion_tasks';
const CLASSES_KEY = 'potion_classes';

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

    add(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Assignment {
      const newAssignment: Assignment = {
        ...assignment,
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

    add(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
      const newTask: Task = {
        ...task,
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
};