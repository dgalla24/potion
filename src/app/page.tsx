'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Calendar from '@/components/Calendar';
import DailyTodoList from '@/components/DailyTodoList';
import DailyChecklist from '@/components/DailyChecklist';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'calendar' | 'todo' | 'daily'>('todo');

  const handleViewChange = (view: 'calendar' | 'todo' | 'daily') => {
    console.log('View change requested:', view);
    setCurrentView(view);
  };

  console.log('Current view:', currentView);

  return (
    <div className="min-h-screen">
      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      <main className="flex-1">
        {currentView === 'calendar' && <Calendar />}
        {currentView === 'todo' && <DailyTodoList />}
        {currentView === 'daily' && <DailyChecklist />}
      </main>
    </div>
  );
}