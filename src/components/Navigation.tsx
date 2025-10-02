'use client';

import { Calendar as CalendarIcon, CheckSquare, Moon, Sun, ListChecks } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface NavigationProps {
  currentView: 'calendar' | 'todo' | 'daily';
  onViewChange: (view: 'calendar' | 'todo' | 'daily') => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();

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

  console.log('Navigation current view:', currentView);

  return (
    <>
      <nav className="nav px-6 py-4">
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
        </div>
      </nav>
    </>
  );
}