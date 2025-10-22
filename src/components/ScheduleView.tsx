'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { usePotion } from '@/hooks/usePotion';
import { formatShortDate, isSameDay, isToday } from '@/lib/utils';
import { Assignment, Task, Exam, Event } from '@/types';
import ItemModal from './ItemModal';

interface ScheduleItem {
  item: Task | Event;
  startTime: number; // minutes from midnight
  duration: number; // minutes
}

export default function ScheduleView() {
  const {
    getAssignmentsByDate,
    getTasksByDate,
    getExamsByDate,
    getEventsByDate,
    updateTask,
    updateEvent,
    filters,
    getClassById,
  } = usePotion();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Assignment | Task | Exam | Event | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [draggedItem, setDraggedItem] = useState<ScheduleItem | null>(null);
  const [dragMode, setDragMode] = useState<'move' | 'resize-top' | 'resize-bottom' | null>(null);
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [dragStartTime, setDragStartTime] = useState<number>(0);
  const [dragStartDuration, setDragStartDuration] = useState<number>(0);
  const scheduleRef = useRef<HTMLDivElement>(null);

  // Time constants
  const HOUR_HEIGHT = 60; // pixels per hour
  const SLOT_HEIGHT = HOUR_HEIGHT / 4; // 15 minutes = 1/4 hour
  const START_HOUR = 7;
  const END_HOUR = 20;
  const VISIBLE_HOURS = END_HOUR - START_HOUR;

  // Navigate days
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get all items for the current date
  const assignments = getAssignmentsByDate(currentDate);
  const tasks = getTasksByDate(currentDate);
  const exams = getExamsByDate(currentDate);
  const events = getEventsByDate(currentDate);

  // Convert tasks and events to schedule items with time info
  const getScheduleItems = (): ScheduleItem[] => {
    const items: ScheduleItem[] = [];

    [...tasks, ...events].forEach((item) => {
      // Check if item has startTime property (we'll add this)
      const startTime = (item as any).startTime;
      if (startTime !== undefined) {
        items.push({
          item,
          startTime, // minutes from midnight
          duration: item.hours * 60, // convert hours to minutes
        });
      }
    });

    return items.sort((a, b) => a.startTime - b.startTime);
  };

  const scheduleItems = getScheduleItems();

  // Generate time slots (7am to 8pm by default)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Format time
  const formatTime = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  // Convert Y position to time in minutes
  const yToMinutes = (y: number): number => {
    const rect = scheduleRef.current?.getBoundingClientRect();
    if (!rect) return 0;

    const relativeY = y - rect.top;
    const minutes = Math.round((relativeY / HOUR_HEIGHT) * 60 / 15) * 15; // Snap to 15-minute intervals
    return Math.max(0, Math.min(24 * 60 - 15, minutes));
  };

  // Handle mouse down on schedule item (for resizing/moving already scheduled items)
  const handleItemMouseDown = (e: React.MouseEvent, scheduleItem: ScheduleItem) => {
    // Only handle left mouse button
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;

    // Check if clicking near top edge (resize top)
    if (relativeY < 8) {
      setDragMode('resize-top');
    }
    // Check if clicking near bottom edge (resize bottom)
    else if (relativeY > rect.height - 8) {
      setDragMode('resize-bottom');
    }
    // Otherwise, move mode
    else {
      setDragMode('move');
    }

    setDraggedItem(scheduleItem);
    setDragStartY(e.clientY);
    setDragStartTime(scheduleItem.startTime);
    setDragStartDuration(scheduleItem.duration);
  };

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedItem || !dragMode) return;

    const deltaY = e.clientY - dragStartY;
    const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT) * 60 / 15) * 15;

    if (dragMode === 'move') {
      const newStartTime = Math.max(0, Math.min(24 * 60 - draggedItem.duration, dragStartTime + deltaMinutes));
      setDraggedItem({
        ...draggedItem,
        startTime: newStartTime,
      });
    } else if (dragMode === 'resize-top') {
      const newStartTime = Math.max(0, dragStartTime + deltaMinutes);
      const newDuration = Math.max(15, dragStartDuration - deltaMinutes);
      setDraggedItem({
        ...draggedItem,
        startTime: newStartTime,
        duration: newDuration,
      });
    } else if (dragMode === 'resize-bottom') {
      const newDuration = Math.max(15, dragStartDuration + deltaMinutes);
      setDraggedItem({
        ...draggedItem,
        duration: newDuration,
      });
    }
  }, [draggedItem, dragMode, dragStartY, dragStartTime, dragStartDuration]);

  // Handle mouse up to save changes
  const handleMouseUp = useCallback(async () => {
    if (!draggedItem || !dragMode) return;

    const item = draggedItem.item;
    const updates: any = {
      hours: draggedItem.duration / 60,
      startTime: draggedItem.startTime,
    };

    if (item.type === 'task') {
      await updateTask(item.id, updates);
    } else if (item.type === 'event') {
      await updateEvent(item.id, updates);
    }

    setDraggedItem(null);
    setDragMode(null);
  }, [draggedItem, dragMode, updateTask, updateEvent]);

  // Add event listeners for drag
  useEffect(() => {
    if (dragMode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragMode, draggedItem, handleMouseMove, handleMouseUp]);

  // Handle click on empty time slot
  const handleTimeSlotClick = (hour: number, minute: number) => {
    const clickedDate = new Date(currentDate);
    clickedDate.setHours(hour, minute, 0, 0);
    setSelectedTime(clickedDate);
    setEditingItem(null);
    setShowModal(true);
  };

  // Handle drop from sidebar to schedule grid
  const handleDropOnSchedule = async (e: React.DragEvent, hour: number, minute: number) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const startTime = hour * 60 + minute;

      if (data.type === 'task') {
        await updateTask(data.id, { startTime });
      } else if (data.type === 'event') {
        await updateEvent(data.id, { startTime });
      }
    } catch (error) {
      console.error('Error dropping item:', error);
    }
  };

  // Handle click on schedule item
  const handleItemClick = (item: Task | Event) => {
    setEditingItem(item);
    setSelectedTime(null);
    setShowModal(true);
  };

  // Get item colors
  const getItemColors = (item: Task | Event) => {
    if (item.type === 'task') {
      return 'bg-blue-500/90 hover:bg-blue-600 border-blue-600';
    }
    return 'bg-indigo-500/90 hover:bg-indigo-600 border-indigo-600';
  };

  // Get item status colors
  const getItemStatusColors = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/90 hover:bg-green-600 border-green-600';
      case 'in_progress':
        return 'bg-blue-500/90 hover:bg-blue-600 border-blue-600';
      default:
        return 'bg-gray-500/90 hover:bg-gray-600 border-gray-600';
    }
  };

  const dateString = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar with all daily items */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Items for {formatShortDate(currentDate)}
          </h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Assignments */}
          {filters.showAssignments && assignments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Assignments ({assignments.length})
              </h3>
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {assignment.title}
                    </div>
                    {assignment.classId && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {getClassById(assignment.classId)?.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exams */}
          {filters.showExams && exams.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Exams ({exams.length})
              </h3>
              <div className="space-y-2">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {exam.title}
                    </div>
                    {exam.classId && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {getClassById(exam.classId)?.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Tasks */}
          {filters.showTasks && tasks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tasks ({tasks.length})
              </h3>
              <div className="space-y-2">
                {tasks.map((task) => {
                  const isScheduled = (task as any).startTime !== undefined;
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify({
                          type: 'task',
                          id: task.id,
                        }));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                        isScheduled
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={(e) => {
                        // Only handle click if not dragging
                        handleItemClick(task);
                      }}
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {task.title}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {task.hours}h {isScheduled ? '(Scheduled)' : '(Unscheduled)'}
                      </div>
                      {task.classId && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {getClassById(task.classId)?.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Events */}
          {filters.showEvents && events.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Events ({events.length})
              </h3>
              <div className="space-y-2">
                {events.map((event) => {
                  const isScheduled = (event as any).startTime !== undefined;
                  return (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify({
                          type: 'event',
                          id: event.id,
                        }));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                        isScheduled
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={(e) => {
                        // Only handle click if not dragging
                        handleItemClick(event);
                      }}
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {event.title}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {event.hours}h {isScheduled ? '(Scheduled)' : '(Unscheduled)'}
                      </div>
                      {event.classId && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {getClassById(event.classId)?.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {assignments.length === 0 && tasks.length === 0 && exams.length === 0 && events.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No items for this day
            </div>
          )}
        </div>
      </div>

      {/* Main schedule grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                {dateString}
              </h1>
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                Today
              </button>
            </div>

            <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <button
                onClick={goToPreviousDay}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-r border-gray-200 dark:border-gray-700 rounded-l-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNextDay}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 rounded-r-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div
          ref={scheduleRef}
          className="flex-1 overflow-y-auto bg-white dark:bg-gray-800"
          style={{
            scrollBehavior: 'smooth',
            paddingBottom: '50vh' // Allow scrolling past the last hour
          }}
        >
          <div
            className="relative"
            style={{ height: `${24 * HOUR_HEIGHT}px` }}
          >
            {/* Time labels and grid lines */}
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className="absolute w-full border-t border-gray-200 dark:border-gray-700"
                style={{ top: `${hour * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
              >
                <div className="flex h-full">
                  <div className="w-20 flex-shrink-0 pr-4 text-right">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {formatTime(hour)}
                    </span>
                  </div>
                  <div className="flex-1 relative">
                    {/* 15-minute slots - each takes up 1/4 of the hour */}
                    {[0, 1, 2, 3].map((quarter) => (
                      <div
                        key={quarter}
                        className={`absolute w-full cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${
                          quarter === 0 ? 'border-t border-gray-200 dark:border-gray-700' : 'border-t border-gray-100 dark:border-gray-800'
                        }`}
                        style={{
                          top: `${quarter * SLOT_HEIGHT}px`,
                          height: `${SLOT_HEIGHT}px`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTimeSlotClick(hour, quarter * 15);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.stopPropagation();
                          handleDropOnSchedule(e, hour, quarter * 15);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Schedule items */}
            <div className="absolute left-20 right-0 top-0 bottom-0 pointer-events-none">
              {scheduleItems.map((scheduleItem, index) => {
                const item = draggedItem?.item.id === scheduleItem.item.id ? draggedItem : scheduleItem;
                const top = (item.startTime / 60) * HOUR_HEIGHT;
                const height = (item.duration / 60) * HOUR_HEIGHT;

                return (
                  <div
                    key={scheduleItem.item.id}
                    className={`absolute left-2 right-2 rounded-lg border-2 shadow-lg cursor-move transition-colors pointer-events-auto ${
                      getItemStatusColors(item.item.status)
                    } ${draggedItem?.item.id === item.item.id ? 'opacity-75 z-50' : 'z-10'}`}
                    style={{
                      top: `${top}px`,
                      height: `${Math.max(height, SLOT_HEIGHT)}px`,
                    }}
                    onMouseDown={(e) => handleItemMouseDown(e, scheduleItem)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item.item);
                    }}
                  >
                    <div className="p-2 h-full overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white truncate">
                          {item.item.title}
                        </div>
                        <div className="text-xs text-white/90">
                          {Math.floor(item.startTime / 60)}:{(item.startTime % 60).toString().padStart(2, '0')} - {Math.floor((item.startTime + item.duration) / 60)}:{((item.startTime + item.duration) % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                      {height > SLOT_HEIGHT * 2 && (
                        <div className="text-xs text-white/80">
                          {item.item.hours}h
                        </div>
                      )}
                    </div>

                    {/* Resize handles */}
                    <div className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 hover:opacity-100 bg-white/20" />
                    <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 hover:opacity-100 bg-white/20" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll to current time on mount */}
        {scheduleRef.current && isToday(currentDate) && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                const now = new Date();
                const currentHour = now.getHours();
                const scrollTarget = ${START_HOUR * HOUR_HEIGHT};
                document.querySelector('[data-schedule-grid]')?.scrollTo({ top: scrollTarget });
              `,
            }}
          />
        )}
      </div>

      {/* Item Modal */}
      {showModal && (
        <ItemModal
          item={editingItem || undefined}
          defaultDate={selectedTime || currentDate}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
            setSelectedTime(null);
          }}
          isNew={!editingItem}
        />
      )}
    </div>
  );
}
