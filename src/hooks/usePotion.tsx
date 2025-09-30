'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Assignment, Task, Class, CalendarFilters, AssignmentStatus } from '@/types';
import { storage } from '@/lib/storage';
import { parseLocalDate } from '@/lib/utils';

interface PotionContextType {
  assignments: Assignment[];
  tasks: Task[];
  classes: Class[];
  filters: CalendarFilters;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => Assignment;
  updateAssignment: (id: string, updates: Partial<Omit<Assignment, 'id' | 'createdAt'>>) => void;
  deleteAssignment: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  addClass: (class_: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>) => Class;
  updateClass: (id: string, updates: Partial<Omit<Class, 'id' | 'createdAt'>>) => void;
  deleteClass: (id: string) => void;
  setFilters: (filters: CalendarFilters) => void;
  getTodayTasks: () => Task[];
  getTasksByDate: (date: Date) => Task[];
  getAssignmentsByDate: (date: Date) => Assignment[];
  getClassById: (id: string) => Class | undefined;
  toggleClassFilter: (classId: string) => void;
  highlightItem: (item: Assignment | Task) => void;
  clearHighlight: () => void;
  selectedItems: Set<string>;
  toggleSelectItem: (itemId: string) => void;
  selectMultipleItems: (itemIds: string[]) => void;
  clearSelection: () => void;
  deleteSelectedItems: () => void;
  isDragging: boolean;
  dragStartPos: { x: number; y: number } | null;
  dragCurrentPos: { x: number; y: number } | null;
  startDragSelection: (x: number, y: number) => void;
  updateDragSelection: (x: number, y: number) => void;
  endDragSelection: () => void;
}

const PotionContext = createContext<PotionContextType | undefined>(undefined);

export function PotionProvider({ children }: { children: ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filters, setFilters] = useState<CalendarFilters>({
    showAssignments: true,
    showTasks: true,
    filteredClasses: new Set<string>(),
    highlightedItems: new Set<string>(),
  });
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrentPos, setDragCurrentPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setAssignments(storage.assignments.getAll());
    setTasks(storage.tasks.getAll());
    setClasses(storage.classes.getAll());
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
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);

    // Sync assignment status if task is linked to an assignment
    if (newTask.assignmentId) {
      syncAssignmentStatus(newTask.assignmentId!, updatedTasks);
    }

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

      // Sync assignment status if deleted task was linked to an assignment
      if (taskToDelete?.assignmentId) {
        syncAssignmentStatus(taskToDelete.assignmentId!, updatedTasks);
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
      // Remove class reference from assignments and tasks
      const updatedAssignments = assignments.map(a => a.classId === id ? { ...a, classId: undefined } : a);
      const updatedTasks = tasks.map(t => t.classId === id ? { ...t, classId: undefined } : t);
      setAssignments(updatedAssignments);
      setTasks(updatedTasks);
      storage.assignments.save(updatedAssignments);
      storage.tasks.save(updatedTasks);
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
    const inProgressTasks = assignmentTasks.filter(task => task.status === 'in_progress');

    if (completedTasks.length === assignmentTasks.length) {
      return 'completed'; // All tasks completed → Completed
    } else if (inProgressTasks.length > 0 || completedTasks.length > 0) {
      return 'in_progress'; // At least one task completed or in progress → In Progress
    } else {
      return 'not_started';
    }
  };

  const syncAssignmentStatus = (assignmentId: string, tasksArray: Task[] = tasks) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const newStatus = calculateAssignmentStatus(assignmentId, tasksArray);
    if (assignment.status !== newStatus) {
      updateAssignment(assignmentId, { status: newStatus });
    }
  };

  const highlightItem = (item: Assignment | Task) => {
    // Check if the item is already highlighted - if so, clear highlighting
    if (filters.highlightedItems.has(item.id)) {
      clearHighlight();
      return;
    }

    const itemsToHighlight = new Set<string>();

    if ('dueDate' in item) {
      // It's an assignment - highlight it and all related tasks
      itemsToHighlight.add(item.id);
      const relatedTasks = tasks.filter(task => task.assignmentId === item.id);
      relatedTasks.forEach(task => itemsToHighlight.add(task.id));
    } else {
      // It's a task - highlight it, parent assignment, and sibling tasks
      itemsToHighlight.add(item.id);

      if (item.assignmentId) {
        // Add parent assignment
        itemsToHighlight.add(item.assignmentId);
        // Add sibling tasks
        const siblingTasks = tasks.filter(task => task.assignmentId === item.assignmentId);
        siblingTasks.forEach(task => itemsToHighlight.add(task.id));
      }
    }

    setFilters(prev => ({
      ...prev,
      highlightedItems: itemsToHighlight,
    }));
  };

  const clearHighlight = () => {
    setFilters(prev => ({
      ...prev,
      highlightedItems: new Set<string>(),
    }));
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }
      return newSelection;
    });
  };

  const selectMultipleItems = (itemIds: string[]) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      itemIds.forEach(id => newSelection.add(id));
      return newSelection;
    });
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const deleteSelectedItems = () => {
    selectedItems.forEach(itemId => {
      // Check if it's a task first
      const task = tasks.find(t => t.id === itemId);
      if (task) {
        deleteTask(itemId);
        return;
      }

      // Check if it's an assignment
      const assignment = assignments.find(a => a.id === itemId);
      if (assignment) {
        deleteAssignment(itemId);
      }
    });
    clearSelection();
  };

  const startDragSelection = (x: number, y: number) => {
    setIsDragging(true);
    setDragStartPos({ x, y });
    setDragCurrentPos({ x, y });
    // Clear existing selection when starting new drag
    clearSelection();
  };

  const updateDragSelection = (x: number, y: number) => {
    if (isDragging) {
      setDragCurrentPos({ x, y });
    }
  };

  const endDragSelection = () => {
    setIsDragging(false);
    setDragStartPos(null);
    setDragCurrentPos(null);
  };

  return (
    <PotionContext.Provider
      value={{
        assignments,
        tasks,
        classes,
        filters,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        addTask,
        updateTask,
        deleteTask,
        addClass,
        updateClass,
        deleteClass,
        setFilters,
        getTodayTasks,
        getTasksByDate,
        getAssignmentsByDate,
        getClassById,
        toggleClassFilter,
        highlightItem,
        clearHighlight,
        selectedItems,
        toggleSelectItem,
        selectMultipleItems,
        clearSelection,
        deleteSelectedItems,
        isDragging,
        dragStartPos,
        dragCurrentPos,
        startDragSelection,
        updateDragSelection,
        endDragSelection,
      }}
    >
      {children}
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