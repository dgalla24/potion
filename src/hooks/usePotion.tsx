'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Assignment, Task, Class, CalendarFilters, AssignmentStatus, Exam, Event, ExamStatus, TaskStatus, EventStatus, DailyItem } from '@/types';
import { storage } from '@/lib/storage';
import { parseLocalDate } from '@/lib/utils';

interface PotionContextType {
  assignments: Assignment[];
  tasks: Task[];
  exams: Exam[];
  events: Event[];
  classes: Class[];
  dailyItems: DailyItem[];
  filters: CalendarFilters;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => Assignment;
  updateAssignment: (id: string, updates: Partial<Omit<Assignment, 'id' | 'createdAt'>>) => void;
  deleteAssignment: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  addExam: (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => Exam;
  updateExam: (id: string, updates: Partial<Omit<Exam, 'id' | 'createdAt'>>) => void;
  deleteExam: (id: string) => void;
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Event;
  updateEvent: (id: string, updates: Partial<Omit<Event, 'id' | 'createdAt'>>) => void;
  deleteEvent: (id: string) => void;
  addClass: (class_: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>) => Class;
  updateClass: (id: string, updates: Partial<Omit<Class, 'id' | 'createdAt'>>) => void;
  deleteClass: (id: string) => void;
  addDailyItem: (item: Omit<DailyItem, 'id' | 'createdAt' | 'updatedAt'>) => DailyItem;
  updateDailyItem: (id: string, updates: Partial<Omit<DailyItem, 'id' | 'createdAt'>>) => void;
  deleteDailyItem: (id: string) => void;
  setFilters: (filters: CalendarFilters) => void;
  getTodayTasks: () => Task[];
  getTodayEvents: () => Event[];
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
  const [isHydrated, setIsHydrated] = useState(false);
  const [filters, setFilters] = useState<CalendarFilters>({
    showAssignments: true,
    showTasks: true,
    showExams: true,
    showEvents: true,
    filteredClasses: new Set<string>(),
  });

  useEffect(() => {
    // Load data from storage
    setAssignments(storage.assignments.getAll());
    setTasks(storage.tasks.getAll());
    setExams(storage.exams.getAll());
    setEvents(storage.events.getAll());
    setClasses(storage.classes.getAll());

    // Reset daily items for new day
    const today = new Date().toISOString().split('T')[0];
    storage.dailyItems.resetForNewDay(today);
    setDailyItems(storage.dailyItems.getAll());

    setIsHydrated(true);
  }, []);

  const addAssignment = (assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAssignment = storage.assignments.add(assignmentData);
    setAssignments(prev => [...prev, newAssignment]);
    return newAssignment;
  };

  const updateAssignment = (id: string, updates: Partial<Omit<Assignment, 'id' | 'createdAt'>>) => {
    const updated = storage.assignments.update(id, updates);
    if (updated) {
      setAssignments(prev => prev.map(a => a.id === id ? updated : a));
    }
  };

  const deleteAssignment = (id: string) => {
    const success = storage.assignments.delete(id);
    if (success) {
      setAssignments(prev => prev.filter(a => a.id !== id));
      setTasks(prev => prev.filter(t => t.assignmentId !== id));
      storage.tasks.save(tasks.filter(t => t.assignmentId !== id));
    }
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask = storage.tasks.add(taskData);
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

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    const originalTask = tasks.find(t => t.id === id);
    const updated = storage.tasks.update(id, updates);
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

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    const success = storage.tasks.delete(id);
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

  const addExam = (examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExam = storage.exams.add(examData);
    setExams(prev => [...prev, newExam]);
    return newExam;
  };

  const updateExam = (id: string, updates: Partial<Omit<Exam, 'id' | 'createdAt'>>) => {
    const updated = storage.exams.update(id, updates);
    if (updated) {
      setExams(prev => prev.map(e => e.id === id ? updated : e));
    }
  };

  const deleteExam = (id: string) => {
    const success = storage.exams.delete(id);
    if (success) {
      setExams(prev => prev.filter(e => e.id !== id));
      // Remove exam reference from tasks and events
      setTasks(prev => prev.filter(t => t.examId !== id));
      setEvents(prev => prev.filter(e => e.examId !== id));
      storage.tasks.save(tasks.filter(t => t.examId !== id));
      storage.events.save(events.filter(e => e.examId !== id));
    }
  };

  const addEvent = (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent = storage.events.add(eventData);
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

  const updateEvent = (id: string, updates: Partial<Omit<Event, 'id' | 'createdAt'>>) => {
    const originalEvent = events.find(e => e.id === id);
    const updated = storage.events.update(id, updates);
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

  const deleteEvent = (id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    const success = storage.events.delete(id);
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

  const addClass = (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClass = storage.classes.add(classData);
    setClasses(prev => [...prev, newClass]);
    return newClass;
  };

  const updateClass = (id: string, updates: Partial<Omit<Class, 'id' | 'createdAt'>>) => {
    const updated = storage.classes.update(id, updates);
    if (updated) {
      setClasses(prev => prev.map(c => c.id === id ? updated : c));
    }
  };

  const deleteClass = (id: string) => {
    const success = storage.classes.delete(id);
    if (success) {
      setClasses(prev => prev.filter(c => c.id !== id));
      // Remove class reference from all entities
      const updatedAssignments = assignments.map(a => a.classId === id ? { ...a, classId: undefined } : a);
      const updatedTasks = tasks.map(t => t.classId === id ? { ...t, classId: undefined } : t);
      const updatedExams = exams.map(e => e.classId === id ? { ...e, classId: undefined } : e);
      const updatedEvents = events.map(e => e.classId === id ? { ...e, classId: undefined } : e);
      setAssignments(updatedAssignments);
      setTasks(updatedTasks);
      setExams(updatedExams);
      setEvents(updatedEvents);
      storage.assignments.save(updatedAssignments);
      storage.tasks.save(updatedTasks);
      storage.exams.save(updatedExams);
      storage.events.save(updatedEvents);
    }
  };

  const getTodayTasks = () => {
    if (!isHydrated) return [];
    const today = new Date();
    return tasks.filter(task => {
      const taskDate = parseLocalDate(task.scheduledDate);
      taskDate.setHours(0, 0, 0, 0);
      const todayDate = new Date(today);
      todayDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === todayDate.getTime();
    });
  };

  const getTodayEvents = () => {
    if (!isHydrated) return [];
    const today = new Date();
    return events.filter(event => {
      const eventDate = parseLocalDate(event.scheduledDate);
      eventDate.setHours(0, 0, 0, 0);
      const todayDate = new Date(today);
      todayDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === todayDate.getTime();
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

    // All tasks are completed → Completed
    if (completedTasks.length === assignmentTasks.length) {
      return 'completed';
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

  const addDailyItem = (itemData: Omit<DailyItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem = storage.dailyItems.add(itemData);
    setDailyItems(prev => [...prev, newItem]);
    return newItem;
  };

  const updateDailyItem = (id: string, updates: Partial<Omit<DailyItem, 'id' | 'createdAt'>>) => {
    const updated = storage.dailyItems.update(id, updates);
    if (updated) {
      setDailyItems(prev => prev.map(item => item.id === id ? updated : item));
    }
  };

  const deleteDailyItem = (id: string) => {
    const success = storage.dailyItems.delete(id);
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