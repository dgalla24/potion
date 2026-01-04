export type AssignmentStatus = 'not_started' | 'in_progress' | 'completed' | 'not_submitted';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed';
export type ExamStatus = 'not_started' | 'in_progress' | 'completed';
export type EventStatus = 'not_started' | 'in_progress' | 'completed';

export interface Class {
  id: string;
  name: string;
  emoji: string;
  daysOfWeek?: number[]; // Array of day numbers: 1=Monday, 7=Sunday
  startTime?: string; // HH:MM format (e.g., "09:00")
  endTime?: string; // HH:MM format (e.g., "10:30")
  duration?: number; // Hours (e.g., 1.5)
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
  startTime?: number; // minutes from midnight (0-1439) for schedule view
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
  startTime?: number; // minutes from midnight (0-1439) for schedule view
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
  hours: number;
  createdAt: Date;
  updatedAt: Date;
}

// Daily goal instance for a specific day
export interface DailyGoalInstance {
  id: string;
  dailyItemId: string; // Reference to the DailyItem template
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type DailyStatus = 'not_started' | 'in_progress' | 'completed';

// Class instance for a specific day (a single class session)
export interface ClassInstance {
  id: string;
  classId: string; // Reference to the Class template
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  cancelled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Track when daily goals and classes were last repopulated
export interface RepopulationTracking {
  id: string;
  entityType: 'daily_goals' | 'classes';
  lastRepopulatedDate: string; // ISO date string (YYYY-MM-DD)
  createdAt: Date;
  updatedAt: Date;
}