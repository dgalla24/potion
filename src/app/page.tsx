'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PotionProvider } from '@/hooks/usePotion';
import { ThemeProvider } from '@/hooks/useTheme';
import Navigation from '@/components/Navigation';
import Calendar from '@/components/Calendar';
import DailyTodoList from '@/components/DailyTodoList';
import DailyChecklist from '@/components/DailyChecklist';
import InstallPrompt from '@/components/InstallPrompt';
import Auth from '@/components/Auth';
import { usePWA } from '@/hooks/usePWA';

export default function HomePage() {
  const [currentView, setCurrentView] = useState<'calendar' | 'todo' | 'daily'>('todo');
  const { user, loading } = useAuth();

  usePWA();

  const handleViewChange = (view: 'calendar' | 'todo' | 'daily') => {
    setCurrentView(view);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <ThemeProvider>
      <PotionProvider>
        <div className="min-h-screen">
          <Navigation
            currentView={currentView}
            onViewChange={handleViewChange}
          />

          <main className="flex-1 pb-20 md:pb-0">
            {currentView === 'calendar' && <Calendar />}
            {currentView === 'todo' && <DailyTodoList />}
            {currentView === 'daily' && <DailyChecklist />}
          </main>

          <InstallPrompt />
        </div>
      </PotionProvider>
    </ThemeProvider>
  );
}