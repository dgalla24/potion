'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { usePotion } from '@/hooks/usePotion';
import { getCalendarDays, isToday } from '@/lib/utils';
import { Assignment, Task, Exam, Event } from '@/types';
import ItemModal from './ItemModal';

interface DayDetailModalProps {
  date: Date;
  assignments: Assignment[];
  tasks: Task[];
  exams: Exam[];
  events: Event[];
  onClose: () => void;
  onAddItem: () => void;
  onEditItem: (item: Assignment | Task | Exam | Event) => void;
  getClassById: (id: string) => import('@/types').Class | undefined;
}

function DayDetailModal({
  date,
  assignments,
  tasks,
  exams,
  events,
  onClose,
  onAddItem,
  onEditItem,
  getClassById
}: DayDetailModalProps) {
  const dateString = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const allItems = [
    ...assignments.map(a => ({ ...a, type: 'assignment' as const })),
    ...exams.map(e => ({ ...e, type: 'exam' as const })),
    ...tasks.map(t => ({ ...t, type: 'task' as const })),
    ...events.map(e => ({ ...e, type: 'event' as const }))
  ];

  const getItemColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'exam': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'task': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'event': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getItemStatusColors = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'not_submitted':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800';
      case 'completed':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      default:
        return 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-white dark:bg-gray-800 w-full md:max-w-2xl md:rounded-t-2xl md:rounded-b-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-bold">{dateString}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {allItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="mb-4">No items for this day</p>
              <button
                onClick={onAddItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Item
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {allItems.map((item) => {
                const itemClass = item.classId ? getClassById(item.classId) : null;
                return (
                  <div
                    key={item.id}
                    onClick={() => onEditItem(item)}
                    className={`p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer ${getItemStatusColors(item.status)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getItemColor(item.type)}`}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      {itemClass && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          {itemClass.emoji && <span>{itemClass.emoji}</span>}
                          <span>{itemClass.name}</span>
                        </span>
                      )}
                      {(item.type === 'task' || item.type === 'event') && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                          {item.hours}h
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {allItems.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onAddItem}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MobileCalendar() {
  const {
    getAssignmentsByDate,
    getTasksByDate,
    getExamsByDate,
    getEventsByDate,
    getClassById
  } = usePotion();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Assignment | Task | Exam | Event | null>(null);

  const days = getCalendarDays(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingItem(null);
  };

  const handleAddItem = () => {
    setShowItemModal(true);
  };

  const handleEditItem = (item: Assignment | Task | Exam | Event) => {
    setEditingItem(item);
    setShowItemModal(true);
  };

  const handleCloseItemModal = () => {
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleCloseDayModal = () => {
    setSelectedDate(null);
  };

  const hasItems = (date: Date) => {
    return (
      getAssignmentsByDate(date).length > 0 ||
      getTasksByDate(date).length > 0 ||
      getExamsByDate(date).length > 0 ||
      getEventsByDate(date).length > 0
    );
  };

  return (
    <div className="p-4 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{monthYear}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div
              key={i}
              className="p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const today = isToday(date);
            const currentMonth = date.getMonth() === currentDate.getMonth();
            const hasItemsToday = hasItems(date);

            return (
              <button
                key={index}
                onClick={() => handleDayClick(date)}
                className={`
                  aspect-square p-2 flex flex-col items-center justify-center relative
                  border-b border-r border-gray-100 dark:border-gray-700
                  ${today ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  ${!currentMonth ? 'text-gray-400 dark:text-gray-600' : ''}
                  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                `}
              >
                <span className={`
                  text-sm font-medium
                  ${today ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}
                `}>
                  {date.getDate()}
                </span>
                {hasItemsToday && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          assignments={getAssignmentsByDate(selectedDate)}
          tasks={getTasksByDate(selectedDate)}
          exams={getExamsByDate(selectedDate)}
          events={getEventsByDate(selectedDate)}
          onClose={handleCloseDayModal}
          onAddItem={handleAddItem}
          onEditItem={handleEditItem}
          getClassById={getClassById}
        />
      )}

      {/* Item Modal */}
      {showItemModal && (
        <ItemModal
          item={editingItem || undefined}
          defaultDate={selectedDate || undefined}
          onClose={handleCloseItemModal}
          isNew={!editingItem}
        />
      )}
    </div>
  );
}
