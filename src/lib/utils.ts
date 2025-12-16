import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Get the current "day" considering 4 AM as the cutoff
// If current time is before 4 AM, return yesterday's date
export function getCurrentDay(): Date {
  const now = new Date();
  const currentHour = now.getHours();

  // If it's before 4 AM, subtract one day
  if (currentHour < 4) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
  }

  // Otherwise, return today
  now.setHours(0, 0, 0, 0);
  return now;
}

// Get ISO date string for the current "day" (considering 4 AM cutoff)
export function getCurrentDayString(): string {
  return getCurrentDay().toISOString().split('T')[0];
}

export function isToday(date: Date): boolean {
  const today = getCurrentDay();
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return today.getTime() === checkDate.getTime();
}

export function isSameDay(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);
  return d1.getTime() === d2.getTime();
}

export function getDaysInMonth(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  return days;
}

export function getWeekDays(date: Date): Date[] {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }

  return days;
}

// Parse an ISO date string or Date object to a Date object in local timezone
export function parseLocalDate(dateInput: string | Date): Date {
  // If it's already a Date object, return a copy with time reset
  if (dateInput instanceof Date) {
    const date = new Date(dateInput);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // If it's a string, extract just the date part (YYYY-MM-DD) and create a local date
  const datePart = dateInput.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getCalendarDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Determine starting point based on whether we're showing a specific month or current week
  let startingDate: Date;

  // If the date is the 1st of the month, use traditional month view
  if (day === 1) {
    startingDate = new Date(year, month, 1);
  } else {
    // Otherwise, start from the current date (for initial "current week" view)
    startingDate = new Date(date);
  }

  // Get the day of the week for the starting date (0 = Sunday, 1 = Monday, etc.)
  const startDayOfWeek = startingDate.getDay();

  // Calculate the Sunday of the week containing the starting date
  const firstCalendarDay = new Date(startingDate);
  firstCalendarDay.setDate(startingDate.getDate() - startDayOfWeek);

  // Generate 6 weeks (42 days) to ensure we always show full weeks
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const day = new Date(firstCalendarDay);
    day.setDate(firstCalendarDay.getDate() + i);
    days.push(day);
  }

  return days;
}