'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Assignment, Task, Class, CalendarFilters, AssignmentStatus, Exam, Event, ExamStatus, TaskStatus, EventStatus, DailyItem, DailyTaskInstance, DailyStatus } from '@/types';
import { supabaseStorage as storage } from '@/lib/supabase-storage';
import { parseLocalDate, getCurrentDay, getCurrentDayString } from '@/lib/utils';
import { useAuth } from './useAuth';

interface PotionContextType {
  assignments: Assignment[];
  tasks: Task[];
  exams: Exam[];
  events: Event[];
  classes: Class[];
  dailyItems: DailyItem[];
  dailyTaskInstances: DailyTaskInstance[];
  filters: CalendarFilters;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => Promise<Assignment>;
  updateAssignment: (id: string, updates: Partial<Omit<Assignment, 'id' | 'createdAt'>>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addExam: (exam: Omit<Exam, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => Promise<Exam>;
  updateExam: (id: string, updates: Partial<Omit<Exam, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  addEvent: (event: Omit<Event, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => Promise<Event>;
  updateEvent: (id: string, updates: Partial<Omit<Event, 'id' | 'createdAt'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  addClass: (class_: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Class>;
  updateClass: (id: string, updates: Partial<Omit<Class, 'id' | 'createdAt'>>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  addDailyItem: (item: Omit<DailyItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<DailyItem>;
  updateDailyItem: (id: string, updates: Partial<Omit<DailyItem, 'id' | 'createdAt'>>) => Promise<void>;
  deleteDailyItem: (id: string) => Promise<void>;
  getDailyInstancesForDate: (date: Date) => DailyTaskInstance[];
  updateDailyTaskInstance: (id: string, updates: Partial<Omit<DailyTaskInstance, 'id' | 'createdAt'>>) => Promise<void>;
  getDailyStatusForDate: (date: Date) => DailyStatus;
  setFilters: (filters: CalendarFilters) => void;
  getTodayTasks: () => Task[];
  getTodayEvents: () => Event[];
  getTodayAssignments: () => Assignment[];
  getTasksByDate: (date: Date) => Task[];
  getEventsByDate: (date: Date) => Event[];
  getAssignmentsByDate: (date: Date) => Assignment[];
  getExamsByDate: (date: Date) => Exam[];
  getClassById: (id: string) => Class | undefined;
  toggleClassFilter: (classId: string) => void;
}

const PotionContext = createContext<PotionContextType | undefined>(undefined);

export function PotionProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [dailyItems, setDailyItems] = useState<DailyItem[]>([]);
  const [dailyTaskInstances, setDailyTaskInstances] = useState<DailyTaskInstance[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filters, setFilters] = useState<CalendarFilters>({
    showAssignments: true,
    showTasks: true,
    showExams: true,
    showEvents: true,
    filteredClasses: new Set<string>(),
  });

  const { user, loading } = useAuth();

  useEffect(() => {
    // Only load data if user is authenticated
    if (loading || !user) return;

    const loadData = async () => {
      try {
        const [assignmentsData, tasksData, examsData, eventsData, classesData, dailyItemsData] = await Promise.all([
          storage.assignments.getAll(),
          storage.tasks.getAll(),
          storage.exams.getAll(),
          storage.events.getAll(),
          storage.classes.getAll(),
          storage.dailyItems.getAll(),
        ]);

        setAssignments(assignmentsData);
        setTasks(tasksData);
        setExams(examsData);
        setEvents(eventsData);
        setClasses(classesData);
        setDailyItems(dailyItemsData);

        // Reset daily items for new day (considering 4 AM cutoff)
        const today = getCurrentDayString();
        await storage.dailyItems.resetForNewDay(today);

        setIsHydrated(true);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [user, loading]);

  const addAssignment = async (assignmentData: Omit<Assignment, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => {
    const newAssignment = await storage.assignments.add(assignmentData);
    setAssignments(prev => [...prev, newAssignment]);
    return newAssignment;
  };

  const updateAssignment = async (id: string, updates: Partial<Omit<Assignment, 'id' | 'createdAt'>>) => {
    const updated = await storage.assignments.update(id, updates);
    if (updated) {
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));
    }
  };

  const deleteAssignment = async (id: string) => {
    const success = await storage.assignments.delete(id);
    if (success) {
      setAssignments(prev => prev.filter(a => a.id !== id));
      // Delete related tasks
      const relatedTasks = tasks.filter(t => t.assignmentId === id);
      for (const task of relatedTasks) {
        await storage.tasks.delete(task.id);
      }
      setTasks(prev => prev.filter(t => t.assignmentId !== id));
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => {
    const newTask = await storage.tasks.add(taskData);
    setTasks(prev => {
      const updatedTasks = [...prev, newTask];

      // Sync assignment status if task is linked to an assignment
      if (newTask.assignmentId) {
        syncAssignmentStatus(newTask.assignmentId!, updatedTasks);
      }

      return updatedTasks;
    });

    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    const originalTask = tasks.find(t => t.id === id);
    const updated = await storage.tasks.update(id, updates);
    if (updated) {
      const updatedTasks = tasks.map(t => t.id === id ? updated : t);
      setTasks(updatedTasks);

      // Sync assignment status if task is linked to an assignment
      if (updated.assignmentId) {
        syncAssignmentStatus(updated.assignmentId!, updatedTasks);
      }

      // Also sync if the original task had a different assignment
      if (originalTask?.assignmentId && originalTask.assignmentId !== updated.assignmentId) {
        syncAssignmentStatus(originalTask.assignmentId!, updatedTasks);
      }
    }
  };

  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    const success = await storage.tasks.delete(id);
    if (success) {
      const updatedTasks = tasks.filter(t => t.id !== id);
      setTasks(updatedTasks);

      // Sync assignment/exam status if deleted task was linked
      if (taskToDelete?.assignmentId) {
        syncAssignmentStatus(taskToDelete.assignmentId!, updatedTasks);
      }
      if (taskToDelete?.examId) {
        syncExamStatus(taskToDelete.examId!, updatedTasks, events);
      }
    }
  };

  const addExam = async (examData: Omit<Exam, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => {
    const newExam = await storage.exams.add(examData);
    setExams(prev => [...prev, newExam]);
    return newExam;
  };

  const updateExam = async (id: string, updates: Partial<Omit<Exam, 'id' | 'createdAt'>>) => {
    const updated = await storage.exams.update(id, updates);
    if (updated) {
      setExams(prev => prev.map(e => e.id === id ? updated : e));
    }
  };

  const deleteExam = async (id: string) => {
    const success = await storage.exams.delete(id);
    if (success) {
      setExams(prev => prev.filter(e => e.id !== id));
      // Delete related tasks and events
      const relatedTasks = tasks.filter(t => t.examId === id);
      const relatedEvents = events.filter(e => e.examId === id);
      for (const task of relatedTasks) {
        await storage.tasks.delete(task.id);
      }
      for (const event of relatedEvents) {
        await storage.events.delete(event.id);
      }
      setTasks(prev => prev.filter(t => t.examId !== id));
      setEvents(prev => prev.filter(e => e.examId !== id));
    }
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'type' | 'createdAt' | 'updatedAt'>) => {
    const newEvent = await storage.events.add(eventData);
    setEvents(prev => {
      const updatedEvents = [...prev, newEvent];

      // Sync assignment/exam status if event is linked
      if (newEvent.assignmentId) {
        syncAssignmentStatus(newEvent.assignmentId!, tasks);
      }
      if (newEvent.examId) {
        syncExamStatus(newEvent.examId!, tasks, updatedEvents);
      }

      return updatedEvents;
    });

    return newEvent;
  };

  const updateEvent = async (id: string, updates: Partial<Omit<Event, 'id' | 'createdAt'>>) => {
    const originalEvent = events.find(e => e.id === id);
    const updated = await storage.events.update(id, updates);
    if (updated) {
      const updatedEvents = events.map(e => e.id === id ? updated : e);
      setEvents(updatedEvents);

      // Sync assignment/exam status if event is linked
      if (updated.assignmentId) {
        syncAssignmentStatus(updated.assignmentId!, tasks);
      }
      if (updated.examId) {
        syncExamStatus(updated.examId!, tasks, updatedEvents);
      }

      // Also sync if the original event had a different assignment/exam
      if (originalEvent?.assignmentId && originalEvent.assignmentId !== updated.assignmentId) {
        syncAssignmentStatus(originalEvent.assignmentId!, tasks);
      }
      if (originalEvent?.examId && originalEvent.examId !== updated.examId) {
        syncExamStatus(originalEvent.examId!, tasks, updatedEvents);
      }
    }
  };

  const deleteEvent = async (id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    const success = await storage.events.delete(id);
    if (success) {
      const updatedEvents = events.filter(e => e.id !== id);
      setEvents(updatedEvents);

      // Sync assignment/exam status if deleted event was linked
      if (eventToDelete?.assignmentId) {
        syncAssignmentStatus(eventToDelete.assignmentId!, tasks);
      }
      if (eventToDelete?.examId) {
        syncExamStatus(eventToDelete.examId!, tasks, updatedEvents);
      }
    }
  };

  const addClass = async (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClass = await storage.classes.add(classData);
    setClasses(prev => [...prev, newClass]);
    return newClass;
  };

  const updateClass = async (id: string, updates: Partial<Omit<Class, 'id' | 'createdAt'>>) => {
    const updated = await storage.classes.update(id, updates);
    if (updated) {
      setClasses(prev => prev.map(c => c.id === id ? updated : c));
    }
  };

  const deleteClass = async (id: string) => {
    const success = await storage.classes.delete(id);
    if (success) {
      setClasses(prev => prev.filter(c => c.id !== id));
      // Remove class reference from all entities
      const assignmentsWithClass = assignments.filter(a => a.classId === id);
      const tasksWithClass = tasks.filter(t => t.classId === id);
      const examsWithClass = exams.filter(e => e.classId === id);
      const eventsWithClass = events.filter(e => e.classId === id);

      for (const assignment of assignmentsWithClass) {
        await storage.assignments.update(assignment.id, { classId: undefined });
      }
      for (const task of tasksWithClass) {
        await storage.tasks.update(task.id, { classId: undefined });
      }
      for (const exam of examsWithClass) {
        await storage.exams.update(exam.id, { classId: undefined });
      }
      for (const event of eventsWithClass) {
        await storage.events.update(event.id, { classId: undefined });
      }

      setAssignments(prev => prev.map(a => a.classId === id ? { ...a, classId: undefined } : a));
      setTasks(prev => prev.map(t => t.classId === id ? { ...t, classId: undefined } : t));
      setExams(prev => prev.map(e => e.classId === id ? { ...e, classId: undefined } : e));
      setEvents(prev => prev.map(e => e.classId === id ? { ...e, classId: undefined } : e));
    }
  };

  const getTodayTasks = () => {
    if (!isHydrated) return [];
    const today = getCurrentDay();
    return tasks.filter(task => {
      const taskDate = parseLocalDate(task.scheduledDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });
  };

  const getTodayEvents = () => {
    if (!isHydrated) return [];
    const today = getCurrentDay();
    return events.filter(event => {
      const eventDate = parseLocalDate(event.scheduledDate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });
  };

  const getTodayAssignments = () => {
    if (!isHydrated) return [];
    const today = getCurrentDay();
    return assignments.filter(assignment => {
      const dueDate = parseLocalDate(assignment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
  };

  const getTasksByDate = (date: Date) => {
    if (!isHydrated) return [];
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return tasks.filter(task => {
      const taskDate = parseLocalDate(task.scheduledDate);
      taskDate.setHours(0, 0, 0, 0);
      const dateMatch = taskDate.getTime() === targetDate.getTime();

      // Apply class filter if any classes are selected
      if (filters.filteredClasses.size > 0) {
        const classMatch = task.classId && filters.filteredClasses.has(task.classId);
        return dateMatch && classMatch;
      }

      return dateMatch;
    });
  };

  const getAssignmentsByDate = (date: Date) => {
    if (!isHydrated) return [];
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return assignments.filter(assignment => {
      const dueDate = parseLocalDate(assignment.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const dateMatch = dueDate.getTime() === targetDate.getTime();

      // Apply class filter if any classes are selected
      if (filters.filteredClasses.size > 0) {
        const classMatch = assignment.classId && filters.filteredClasses.has(assignment.classId);
        return dateMatch && classMatch;
      }

      return dateMatch;
    });
  };

  const getExamsByDate = (date: Date) => {
    if (!isHydrated) return [];
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return exams.filter(exam => {
      const dueDate = parseLocalDate(exam.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const dateMatch = dueDate.getTime() === targetDate.getTime();

      // Apply class filter if any classes are selected
      if (filters.filteredClasses.size > 0) {
        const classMatch = exam.classId && filters.filteredClasses.has(exam.classId);
        return dateMatch && classMatch;
      }

      return dateMatch;
    });
  };

  const getEventsByDate = (date: Date) => {
    if (!isHydrated) return [];
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return events.filter(event => {
      const eventDate = parseLocalDate(event.scheduledDate);
      eventDate.setHours(0, 0, 0, 0);
      const dateMatch = eventDate.getTime() === targetDate.getTime();

      // Apply class filter if any classes are selected
      if (filters.filteredClasses.size > 0) {
        const classMatch = event.classId && filters.filteredClasses.has(event.classId);
        return dateMatch && classMatch;
      }

      return dateMatch;
    });
  };

  const getClassById = (id: string) => {
    return classes.find(c => c.id === id);
  };

  const toggleClassFilter = (classId: string) => {
    setFilters(prev => {
      const newFilteredClasses = new Set(prev.filteredClasses);
      if (newFilteredClasses.has(classId)) {
        newFilteredClasses.delete(classId);
      } else {
        newFilteredClasses.add(classId);
      }
      return {
        ...prev,
        filteredClasses: newFilteredClasses,
      };
    });
  };

  const calculateAssignmentStatus = (assignmentId: string, tasksArray: Task[] = tasks): AssignmentStatus => {
    const assignmentTasks = tasksArray.filter(task => task.assignmentId === assignmentId);

    if (assignmentTasks.length === 0) {
      return 'not_started';
    }

    const completedTasks = assignmentTasks.filter(task => task.status === 'completed');
    const notStartedTasks = assignmentTasks.filter(task => task.status === 'not_started');

    // All tasks are completed → Not Submitted
    if (completedTasks.length === assignmentTasks.length) {
      return 'not_submitted';
    }

    // All tasks are not started → Not Started
    if (notStartedTasks.length === assignmentTasks.length) {
      return 'not_started';
    }

    // Any task is in progress, completed, or anything other than not_started → In Progress
    return 'in_progress';
  };

  const syncAssignmentStatus = (assignmentId: string, tasksArray: Task[] = tasks) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const newStatus = calculateAssignmentStatus(assignmentId, tasksArray);
    if (assignment.status !== newStatus) {
      updateAssignment(assignmentId, { status: newStatus });
    }
  };

  const calculateExamStatus = (examId: string, tasksArray: Task[] = tasks, eventsArray: Event[] = events): ExamStatus => {
    const examTasks = tasksArray.filter(task => task.examId === examId);
    const examEvents = eventsArray.filter(event => event.examId === examId);
    const allChildren = [...examTasks, ...examEvents];

    if (allChildren.length === 0) {
      return 'not_started';
    }

    const completedChildren = allChildren.filter(child => child.status === 'completed');
    const notStartedChildren = allChildren.filter(child => child.status === 'not_started');

    // All children are completed → Completed
    if (completedChildren.length === allChildren.length) {
      return 'completed';
    }

    // All children are not started → Not Started
    if (notStartedChildren.length === allChildren.length) {
      return 'not_started';
    }

    // Any child is in progress, completed, or anything other than not_started → In Progress
    return 'in_progress';
  };

  const syncExamStatus = (examId: string, tasksArray: Task[] = tasks, eventsArray: Event[] = events) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;

    const newStatus = calculateExamStatus(examId, tasksArray, eventsArray);
    if (exam.status !== newStatus) {
      updateExam(examId, { status: newStatus });
    }
  };

  const addDailyItem = async (itemData: Omit<DailyItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem = await storage.dailyItems.add(itemData);
    setDailyItems(prev => [...prev, newItem]);
    return newItem;
  };

  const updateDailyItem = async (id: string, updates: Partial<Omit<DailyItem, 'id' | 'createdAt'>>) => {
    const updated = await storage.dailyItems.update(id, updates);
    if (updated) {
      setDailyItems(prev => prev.map(item => item.id === id ? updated : item));
    }
  };

  const deleteDailyItem = async (id: string) => {
    const success = await storage.dailyItems.delete(id);
    if (success) {
      setDailyItems(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <PotionContext.Provider
      value={{
        assignments,
        tasks,
        exams,
        events,
        classes,
        dailyItems,
        filters,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        addTask,
        updateTask,
        deleteTask,
        addExam,
        updateExam,
        deleteExam,
        addEvent,
        updateEvent,
        deleteEvent,
        addClass,
        updateClass,
        deleteClass,
        addDailyItem,
        updateDailyItem,
        deleteDailyItem,
        setFilters,
        getTodayTasks,
        getTodayEvents,
        getTodayAssignments,
        getTasksByDate,
        getEventsByDate,
        getAssignmentsByDate,
        getExamsByDate,
        getClassById,
        toggleClassFilter,
      }}
    >
      {isHydrated ? children : null}
    </PotionContext.Provider>
  );
}

export function usePotion() {
  const context = useContext(PotionContext);
  if (context === undefined) {
    throw new Error('usePotion must be used within a PotionProvider');
  }
  return context;
}