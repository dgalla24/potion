export type AssignmentStatus = 'not_started' | 'in_progress' | 'not_submitted' | 'completed';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export interface Class {
  id: string;
  name: string;
  emoji: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
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
  title: string;
  description?: string;
  scheduledDate: Date;
  status: TaskStatus;
  assignmentId?: string;
  hours: number;
  classId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarFilters {
  showAssignments: boolean;
  showTasks: boolean;
  filteredClasses: Set<string>; // Class IDs to show (empty = show all)
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'assignment' | 'task';
  status: AssignmentStatus | TaskStatus;
  hours?: number;
}

export interface DayData {
  date: Date;
  tasks: Task[];
  assignments: Assignment[];
  totalHours: number;
}