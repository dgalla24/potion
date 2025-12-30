'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Check } from 'lucide-react';
import { usePotion } from '@/hooks/usePotion';
import { getCalendarDays, isToday, formatDate } from '@/lib/utils';
import { Assignment, Task, Exam, Event, ClassInstance } from '@/types';
import ItemModal from './ItemModal';
import ClassInstanceModal from './ClassInstanceModal';

interface DailyGoalsModalProps {
  date: Date;
  onClose: () => void;
}

function DailyGoalsModal({ date, onClose }: DailyGoalsModalProps) {
  const { dailyItems, getDailyInstancesForDate, getDailyHoursForDate, updateDailyGoalInstance } = usePotion();

  const dateString = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const instances = getDailyInstancesForDate(date);
  const totalHours = getDailyHoursForDate(date);
  const completedCount = instances.filter(i => i.completed).length;

  const handleToggleComplete = async (instanceId: string, currentStatus: boolean) => {
    await updateDailyGoalInstance(instanceId, { completed: !currentStatus });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-white dark:bg-gray-800 w-full md:max-w-2xl md:rounded-t-2xl md:rounded-b-2xl rounded-t-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">Daily Goals</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{dateString}</p>
          </div>
          <div className="flex items-center gap-3">
            {totalHours > 0 && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium">
                {totalHours}h
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {instances.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No daily goals for this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {instances.map((instance) => {
                const dailyItem = dailyItems.find(item => item.id === instance.dailyItemId);
                if (!dailyItem) return null;

                return (
                  <div
                    key={instance.id}
                    onClick={() => handleToggleComplete(instance.id, instance.completed)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      instance.completed
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        instance.completed
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {instance.completed && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          instance.completed
                            ? 'text-gray-500 dark:text-gray-400 line-through'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {dailyItem.title}
                        </h3>
                      </div>
                      {dailyItem.hours > 0 && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                          {dailyItem.hours}h
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with stats */}
        {instances.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">{completedCount}</span> of <span className="font-semibold">{instances.length}</span> completed
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface DayDetailModalProps {
  date: Date;
  assignments: Assignment[];
  tasks: Task[];
  exams: Exam[];
  events: Event[];
  onClose: () => void;
  onAddItem: () => void;
  onEditItem: (item: Assignment | Task | Exam | Event) => void;
  onOpenDailyGoals: () => void;
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
  onOpenDailyGoals,
  getClassById
}: DayDetailModalProps) {
  const { getDailyHoursForDate, getDailyInstancesForDate, getDailyStatusForDate, dailyItems, getClassInstancesForDate, getClassHoursForDate, classes, updateClassInstance, deleteClassInstance } = usePotion();
  const [selectedClassInstance, setSelectedClassInstance] = useState<ClassInstance | null>(null);

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

  // Calculate total hours (tasks + events + daily goals + classes)
  const totalHours =
    tasks.reduce((sum, task) => sum + task.hours, 0) +
    events.reduce((sum, event) => sum + event.hours, 0) +
    getDailyHoursForDate(date) +
    getClassHoursForDate(date);

  // Daily goals data
  const dailyInstances = getDailyInstancesForDate(date);
  const dailyStatus = getDailyStatusForDate(date);
  const dailyHours = getDailyHoursForDate(date);
  const dailyCompletedCount = dailyInstances.filter(i => i.completed).length;

  // Class instances data
  const classInstances = getClassInstancesForDate(date);

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
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{dateString}</h2>
            {totalHours > 0 && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium">
                {totalHours}h
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Daily Goals Section */}
          {dailyItems.length > 0 && (
            <div className="mb-4">
              <div
                onClick={onOpenDailyGoals}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  dailyStatus === 'completed'
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : dailyStatus === 'in_progress'
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                      : 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Daily Goals
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dailyCompletedCount}/{dailyInstances.length} completed
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {dailyHours > 0 && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                        {dailyHours}h
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Class Instances Section */}
          {classInstances.length > 0 && (
            <div className="mb-4 space-y-2">
              {classInstances.map((instance) => {
                const classItem = classes.find(c => c.id === instance.classId);
                if (!classItem) return null;

                return (
                  <div
                    key={instance.id}
                    onClick={() => setSelectedClassInstance(instance)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      instance.completed
                        ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                        : 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{classItem.emoji}</span>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          instance.completed
                            ? 'text-gray-500 dark:text-gray-400'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {classItem.name}
                        </h3>
                        {classItem.startTime && classItem.endTime && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {classItem.startTime} - {classItem.endTime}
                          </p>
                        )}
                      </div>
                      {classItem.duration && classItem.duration > 0 && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                          {classItem.duration}h
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Regular Items */}
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

      {/* Class Instance Modal */}
      {selectedClassInstance && (
        <ClassInstanceModal
          instance={selectedClassInstance}
          classInfo={classes.find(c => c.id === selectedClassInstance.classId)!}
          onClose={() => setSelectedClassInstance(null)}
          onToggleComplete={async (instanceId: string, currentStatus: boolean) => {
            await updateClassInstance(instanceId, { completed: !currentStatus });
          }}
          onDelete={async (instanceId: string) => {
            await deleteClassInstance(instanceId);
            setSelectedClassInstance(null);
          }}
        />
      )}
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
  const [dailyGoalsDate, setDailyGoalsDate] = useState<Date | null>(null);

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

  const handleOpenDailyGoals = (date: Date) => {
    setDailyGoalsDate(date);
  };

  const handleCloseDailyGoals = () => {
    setDailyGoalsDate(null);
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
          onOpenDailyGoals={() => handleOpenDailyGoals(selectedDate)}
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

      {/* Daily Goals Modal */}
      {dailyGoalsDate && (
        <DailyGoalsModal
          date={dailyGoalsDate}
          onClose={handleCloseDailyGoals}
        />
      )}
    </div>
  );
}
