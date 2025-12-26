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
  const [modalStartTime, setModalStartTime] = useState<number | undefined>(undefined);
  const [draggedItem, setDraggedItem] = useState<ScheduleItem | null>(null);
  const [dragMode, setDragMode] = useState<'move' | 'resize-top' | 'resize-bottom' | null>(null);
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [dragStartTime, setDragStartTime] = useState<number>(0);
  const [dragStartDuration, setDragStartDuration] = useState<number>(0);
  const hasDraggedRef = useRef<boolean>(false);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: Task | Event } | null>(null);

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

    console.log('=== Schedule Debug ===');
    console.log('Total tasks:', tasks.length, 'Total events:', events.length);

    [...tasks, ...events].forEach((item) => {
      // Check if item has startTime property
      const startTime = (item as any).startTime;
      console.log(`Item: "${item.title}" | startTime:`, startTime, '| hours:', item.hours);
      if (startTime !== undefined && startTime !== null) {
        console.log('  ✓ Adding to schedule');
        items.push({
          item,
          startTime, // minutes from midnight
          duration: item.hours * 60, // convert hours to minutes
        });
      } else {
        console.log('  ✗ Skipping (no startTime)');
      }
    });

    console.log('Final schedule items count:', items.length);
    console.log('===================');
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

    console.log('=== Mouse Down on Item ===');
    console.log('Item:', scheduleItem.item.title);

    // Determine drag mode
    let mode: 'move' | 'resize-top' | 'resize-bottom';
    if (relativeY < 8) {
      mode = 'resize-top';
      console.log('Mode: resize-top');
    } else if (relativeY > rect.height - 8) {
      mode = 'resize-bottom';
      console.log('Mode: resize-bottom');
    } else {
      mode = 'move';
      console.log('Mode: move');
    }
    console.log('==========================');

    const startY = e.clientY;
    const startTime = scheduleItem.startTime;
    const startDuration = scheduleItem.duration;
    let currentItem = scheduleItem;
    let hasMoved = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT) * 60 / 15) * 15;

      // Mark that we've moved if there's any mouse movement
      if (Math.abs(deltaY) > 5) {
        if (!hasMoved) {
          console.log('>>> Setting hasMoved to TRUE, deltaY:', deltaY);
        }
        hasMoved = true;
      }

      if (mode === 'move') {
        const newStartTime = Math.max(0, Math.min(24 * 60 - currentItem.duration, startTime + deltaMinutes));
        currentItem = {
          ...currentItem,
          startTime: newStartTime,
        };
        setDraggedItem(currentItem);
      } else if (mode === 'resize-top') {
        const newStartTime = Math.max(0, startTime + deltaMinutes);
        const newDuration = Math.max(15, startDuration - deltaMinutes);
        currentItem = {
          ...currentItem,
          startTime: newStartTime,
          duration: newDuration,
        };
        setDraggedItem(currentItem);
      } else if (mode === 'resize-bottom') {
        const newDuration = Math.max(15, startDuration + deltaMinutes);
        currentItem = {
          ...currentItem,
          duration: newDuration,
        };
        setDraggedItem(currentItem);
      }
    };

    const handleMouseUp = async () => {
      console.log('=== Mouse Up ===');
      console.log('hasMoved:', hasMoved);
      console.log('currentItem startTime:', currentItem.startTime);
      console.log('startTime:', startTime);
      console.log('================');

      // If we actually dragged, save the changes
      if (hasMoved) {
        const item = currentItem.item;
        const updates: any = {
          hours: currentItem.duration / 60,
          startTime: currentItem.startTime,
        };

        if (item.type === 'task') {
          await updateTask(item.id, updates);
        } else if (item.type === 'event') {
          await updateEvent(item.id, updates);
        }
      } else {
        // If we didn't move, it's a click - open the modal
        setEditingItem(currentItem.item);
        setShowModal(true);
      }

      // Clean up
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setDraggedItem(null);
      setDragMode(null);
    };

    // Attach listeners immediately
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Set state for visual feedback
    setDragMode(mode);
    setDraggedItem(scheduleItem);
    setDragStartY(startY);
    setDragStartTime(startTime);
    setDragStartDuration(startDuration);
    hasDraggedRef.current = false;
  };


  // Handle click on empty time slot
  const handleTimeSlotClick = (hour: number, minute: number) => {
    const clickedDate = new Date(currentDate);
    clickedDate.setHours(hour, minute, 0, 0);
    const calculatedStartTime = hour * 60 + minute;
    console.log('=== Clicked Time Slot ===');
    console.log('Hour:', hour, 'Minute:', minute);
    console.log('Clicked date:', clickedDate);
    console.log('Calculated startTime:', calculatedStartTime);
    console.log('========================');
    setSelectedTime(clickedDate);
    setModalStartTime(calculatedStartTime);
    setEditingItem(null);
    setShowModal(true);
  };

  // Calculate startTime from selectedTime (minutes from midnight)
  const getStartTimeFromDate = (date: Date): number => {
    return date.getHours() * 60 + date.getMinutes();
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
  const handleItemClick = (item: Task | Event | Assignment | Exam) => {
    setEditingItem(item);
    setSelectedTime(null);
    setShowModal(true);
  };

  // Handle right-click on scheduled item
  const handleItemContextMenu = (e: React.MouseEvent, item: Task | Event) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  // Handle remove from schedule
  const handleRemoveFromSchedule = async () => {
    if (!contextMenu) return;

    const item = contextMenu.item;
    const updates: any = {
      startTime: null, // Remove the scheduled time
    };

    if (item.type === 'task') {
      await updateTask(item.id, updates);
    } else if (item.type === 'event') {
      await updateEvent(item.id, updates);
    }

    setContextMenu(null);
  };

  // Close context menu when clicking anywhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  // Get item colors
  const getItemColors = (item: Task | Event) => {
    if (item.type === 'task') {
      return 'bg-blue-500/90 hover:bg-blue-600 border-blue-600';
    }
    return 'bg-indigo-500/90 hover:bg-indigo-600 border-indigo-600';
  };

  // Get item status colors for schedule grid
  const getItemStatusColors = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'rgb(167, 243, 208)', // emerald-200
          bgDark: 'rgb(6, 95, 70)', // emerald-800
          border: 'rgb(52, 211, 153)', // emerald-400
          borderDark: 'rgb(5, 150, 105)', // emerald-600
        };
      case 'in_progress':
        return {
          bg: 'rgb(186, 230, 253)', // sky-200
          bgDark: 'rgb(7, 89, 133)', // sky-800
          border: 'rgb(56, 189, 248)', // sky-400
          borderDark: 'rgb(2, 132, 199)', // sky-600
        };
      case 'not_submitted':
        return {
          bg: 'rgb(233, 213, 255)', // purple-200
          bgDark: 'rgb(88, 28, 135)', // purple-800
          border: 'rgb(192, 132, 252)', // purple-400
          borderDark: 'rgb(147, 51, 234)', // purple-600
        };
      default:
        return {
          bg: 'rgb(203, 213, 225)', // slate-300
          bgDark: 'rgb(51, 65, 85)', // slate-700
          border: 'rgb(148, 163, 184)', // slate-400
          borderDark: 'rgb(71, 85, 105)', // slate-600
        };
    }
  };

  // Get sidebar status colors (lighter backgrounds)
  const getSidebarStatusColors = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'in_progress':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'not_submitted':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
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
                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getSidebarStatusColors(assignment.status)}`}
                    onClick={() => handleItemClick(assignment as any)}
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
                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getSidebarStatusColors(exam.status)}`}
                    onClick={() => handleItemClick(exam as any)}
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
                      className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${getSidebarStatusColors(task.status)}`}
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
                      className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${getSidebarStatusColors(event.status)}`}
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
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const rect = scheduleRef.current?.getBoundingClientRect();
              if (!rect || !scheduleRef.current) return;

              const relativeY = e.clientY - rect.top + scheduleRef.current.scrollTop;
              const totalMinutes = Math.round((relativeY / HOUR_HEIGHT) * 60 / 15) * 15;
              const hour = Math.floor(totalMinutes / 60);
              const minute = totalMinutes % 60;

              handleDropOnSchedule(e, hour, minute);
            }}
          >
            {/* Time labels and grid lines */}
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className="absolute w-full border-t border-gray-200 dark:border-gray-700 pointer-events-none"
                style={{ top: `${hour * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
              >
                <div className="flex h-full">
                  <div className="w-20 flex-shrink-0 pr-4 text-right">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {formatTime(hour)}
                    </span>
                  </div>
                  <div className="flex-1 relative">
                    {/* 15-minute slots - visual only */}
                    {[0, 1, 2, 3].map((quarter) => (
                      <div
                        key={quarter}
                        className={`absolute w-full ${
                          quarter === 0 ? 'border-t border-gray-200 dark:border-gray-700' : 'border-t border-gray-100 dark:border-gray-800'
                        }`}
                        style={{
                          top: `${quarter * SLOT_HEIGHT}px`,
                          height: `${SLOT_HEIGHT}px`
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
                const colors = getItemStatusColors(item.item.status);
                const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

                return (
                  <div
                    key={scheduleItem.item.id}
                    className={`absolute left-2 right-2 rounded-lg border-2 shadow-lg cursor-move transition-colors pointer-events-auto ${
                      draggedItem?.item.id === item.item.id ? 'opacity-75 z-50' : 'z-10'
                    }`}
                    style={{
                      top: `${top}px`,
                      height: `${Math.max(height, SLOT_HEIGHT)}px`,
                      backgroundColor: isDarkMode ? colors.bgDark : colors.bg,
                      borderColor: isDarkMode ? colors.borderDark : colors.border,
                    }}
                    onMouseDown={(e) => handleItemMouseDown(e, scheduleItem)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onContextMenu={(e) => handleItemContextMenu(e, scheduleItem.item)}
                  >
                    <div className="p-2 h-full overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {item.item.title}
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300">
                          {Math.floor(item.startTime / 60)}:{(item.startTime % 60).toString().padStart(2, '0')} - {Math.floor((item.startTime + item.duration) / 60)}:{((item.startTime + item.duration) % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                      {height > SLOT_HEIGHT * 2 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {item.item.hours}h
                        </div>
                      )}
                    </div>

                    {/* Resize handles */}
                    <div className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 hover:opacity-100 bg-gray-400/30 dark:bg-gray-500/30" />
                    <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 hover:opacity-100 bg-gray-400/30 dark:bg-gray-500/30" />
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-[60]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={handleRemoveFromSchedule}
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Remove from Schedule
          </button>
        </div>
      )}

      {/* Item Modal */}
      {showModal && (() => {
        console.log('=== Opening Modal ===');
        console.log('selectedTime:', selectedTime);
        console.log('Passing defaultStartTime:', modalStartTime);
        console.log('====================');
        return (
          <ItemModal
            item={editingItem || undefined}
            defaultDate={selectedTime || currentDate}
            defaultStartTime={modalStartTime}
            onClose={() => {
              setShowModal(false);
              setEditingItem(null);
              setSelectedTime(null);
              setModalStartTime(undefined);
            }}
            isNew={!editingItem}
          />
        );
      })()}
    </div>
  );
}
