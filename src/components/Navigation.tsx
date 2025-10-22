'use client';

import { Calendar as CalendarIcon, CheckSquare, Moon, Sun, ListChecks, LogOut, Clock } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';

interface NavigationProps {
  currentView: 'calendar' | 'todo' | 'daily' | 'schedule';
  onViewChange: (view: 'calendar' | 'todo' | 'daily' | 'schedule') => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const handleCalendarClick = () => {
    console.log('Calendar button clicked');
    onViewChange('calendar');
  };

  const handleTodoClick = () => {
    console.log('Todo button clicked');
    onViewChange('todo');
  };

  const handleDailyClick = () => {
    console.log('Daily button clicked');
    onViewChange('daily');
  };

  const handleScheduleClick = () => {
    console.log('Schedule button clicked');
    onViewChange('schedule');
  };

  console.log('Navigation current view:', currentView);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block nav px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold">Potion</h1>

            <div className="flex space-x-1">
              <button
                onClick={handleCalendarClick}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'calendar'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-muted surface-hover'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Calendar</span>
              </button>

              <button
                onClick={handleScheduleClick}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'schedule'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-muted surface-hover'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Schedule</span>
              </button>

              <button
                onClick={handleTodoClick}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'todo'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-muted surface-hover'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Today</span>
              </button>

              <button
                onClick={handleDailyClick}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'daily'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-muted surface-hover'
                }`}
              >
                <ListChecks className="w-4 h-4" />
                <span>Daily</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="btn-ghost p-2 rounded-lg"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={signOut}
              className="btn-ghost p-2 rounded-lg"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Top Bar */}
      <nav className="md:hidden nav px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Potion</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="btn-ghost p-2 rounded-lg"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={signOut}
              className="btn-ghost p-2 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 nav border-t border-gray-200 dark:border-gray-700 z-50 safe-bottom">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={handleCalendarClick}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 ${
              currentView === 'calendar'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-muted'
            }`}
          >
            <CalendarIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Calendar</span>
          </button>

          <button
            onClick={handleScheduleClick}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 ${
              currentView === 'schedule'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-muted'
            }`}
          >
            <Clock className="w-6 h-6" />
            <span className="text-xs mt-1">Schedule</span>
          </button>

          <button
            onClick={handleTodoClick}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 ${
              currentView === 'todo'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-muted'
            }`}
          >
            <CheckSquare className="w-6 h-6" />
            <span className="text-xs mt-1">Today</span>
          </button>

          <button
            onClick={handleDailyClick}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 ${
              currentView === 'daily'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-muted'
            }`}
          >
            <ListChecks className="w-6 h-6" />
            <span className="text-xs mt-1">Daily</span>
          </button>
        </div>
      </nav>
    </>
  );
}