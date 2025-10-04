export type AssignmentStatus = 'not_started' | 'in_progress' | 'completed' | 'not_submitted';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed';
export type ExamStatus = 'not_started' | 'in_progress' | 'completed';
export type EventStatus = 'not_started' | 'in_progress' | 'completed';

export interface Class {
  id: string;
  name: string;
  emoji: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  type: 'assignment';
  title: string;
  description?: string;
  dueDate: Date;
  status: AssignmentStatus;
  planned: boolean;
  classId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  type: 'task';
  title: string;
  description?: string;
  scheduledDate: Date;
  status: TaskStatus;
  assignmentId?: string;
  examId?: string;
  hours: number;
  classId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exam {
  id: string;
  type: 'exam';
  title: string;
  description?: string;
  dueDate: Date;
  status: ExamStatus;
  planned: boolean;
  classId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  type: 'event';
  title: string;
  description?: string;
  scheduledDate: Date;
  status: EventStatus;
  assignmentId?: string;
  examId?: string;
  hours: number;
  classId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarFilters {
  showAssignments: boolean;
  showTasks: boolean;
  showExams: boolean;
  showEvents: boolean;
  filteredClasses: Set<string>; // Class IDs to show (empty = show all)
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'assignment' | 'task' | 'exam' | 'event';
  status: AssignmentStatus | TaskStatus | ExamStatus | EventStatus;
  hours?: number;
}

export interface DayData {
  date: Date;
  tasks: Task[];
  assignments: Assignment[];
  exams: Exam[];
  events: Event[];
  totalHours: number;
}

export interface DailyItem {
  id: string;
  title: string;
  completed: boolean;
  lastResetDate: string; // ISO date string to track when status was last reset
  createdAt: Date;
  updatedAt: Date;
}