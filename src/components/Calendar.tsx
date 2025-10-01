'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Filter, Plus, X } from 'lucide-react';
import { usePotion } from '@/hooks/usePotion';
import { formatShortDate, getCalendarDays, isSameDay, isToday } from '@/lib/utils';
import { Assignment, Task } from '@/types';
import ItemModal from './ItemModal';
import ContextMenu from './ContextMenu';

interface CalendarDayProps {
  date: Date;
  currentMonth: number;
  assignments: Assignment[];
  tasks: Task[];
  showAssignments: boolean;
  showTasks: boolean;
  onAddItem: (date: Date) => void;
  onEditItem: (item: Assignment | Task) => void;
  onDeleteItem: (item: Assignment | Task) => void;
  getClassById: (id: string) => import('@/types').Class | undefined;
  onDropItem: (date: Date, itemData: any) => void;
  highlightedAssignmentId: string | null;
  onHighlightAssignment: (assignmentId: string | null) => void;
}

function CalendarDay({
  date,
  currentMonth,
  assignments,
  tasks,
  showAssignments,
  showTasks,
  onAddItem,
  onEditItem,
  onDeleteItem,
  getClassById,
  onDropItem,
  highlightedAssignmentId,
  onHighlightAssignment
}: CalendarDayProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: Assignment | Task;
  } | null>(null);

  const isCurrentDay = isToday(date);
  const isCurrentMonthDate = date.getMonth() === currentMonth;

  // Calculate total hours for the day
  const totalHours = tasks.reduce((sum, task) => sum + task.hours, 0);

  const handleRightClick = (e: React.MouseEvent, item: Assignment | Task) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
    });
  };

  const handleItemClick = (e: React.MouseEvent, item: Assignment | Task) => {
    // Handle shift+click for highlighting assignment and related tasks
    if (e.shiftKey) {
      e.stopPropagation();
      if ('dueDate' in item) {
        // Clicked on assignment - toggle highlight
        if (highlightedAssignmentId === item.id) {
          onHighlightAssignment(null);
        } else {
          onHighlightAssignment(item.id);
        }
      } else {
        // Clicked on task - highlight its parent assignment if it has one
        if (item.assignmentId) {
          if (highlightedAssignmentId === item.assignmentId) {
            onHighlightAssignment(null);
          } else {
            onHighlightAssignment(item.assignmentId);
          }
        }
      }
      return;
    }
    onEditItem(item);
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

  const getTypePillColors = (type: 'task' | 'assignment') => {
    return type === 'task'
      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
      : 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
  };


  return (
    <>
      <div
        className={`min-h-40 p-4 relative group border-b border-gray-100 dark:border-gray-700 transition-all duration-200 ${
          isCurrentDay
            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-l-blue-400'
            : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => {
          e.preventDefault();
          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
          onDropItem(date, data);
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`text-sm font-bold ${
              isCurrentDay
                ? 'text-blue-600 dark:text-blue-400'
                : isCurrentMonthDate
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-400 dark:text-gray-600'
            }`}>
              {date.getDate()}
            </div>
            {totalHours > 0 && (
              <div
                className="inline-flex items-center justify-center px-1.5 h-5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full"
                title={`Total hours: ${totalHours}`}
              >
                {totalHours}h
              </div>
            )}
          </div>
          <button
            onClick={() => onAddItem(date)}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            title="Add item"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {showAssignments && assignments.map(assignment => {
            const assignmentClass = assignment.classId ? getClassById(assignment.classId) : null;
            const assignmentTasks = tasks.filter(task => task.assignmentId === assignment.id);
            const isPlanned = assignment.planned; // Use the planned field from the assignment
            const isHighlighted = highlightedAssignmentId === assignment.id;
            const isDimmed = highlightedAssignmentId !== null && !isHighlighted;
            return (
              <div
                key={assignment.id}
                data-item-id={assignment.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'assignment',
                    id: assignment.id,
                    originalDate: assignment.dueDate
                  }));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                className={`p-3 rounded-lg border cursor-move transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] select-none ${
                  isHighlighted
                    ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900 shadow-lg scale-[1.02]'
                    : ''
                } ${isDimmed ? 'opacity-30' : ''} ${getItemStatusColors(assignment.status)}`}
                onClick={(e) => handleItemClick(e, assignment)}
                onContextMenu={(e) => handleRightClick(e, assignment)}
              >
                <div className="text-sm font-semibold mb-2 line-clamp-2 leading-tight text-gray-900 dark:text-gray-100">
                  {assignment.title}
                </div>
                <div className="flex flex-col gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${getTypePillColors('assignment')}`}>
                    Assignment
                  </span>
                  {isPlanned ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 w-fit">
                      Planned
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 w-fit">
                      Unplanned
                    </span>
                  )}
                </div>
                {assignmentClass && (
                  <div className="mt-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 w-fit">
                      {assignmentClass.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {showTasks && tasks.map(task => {
            const taskClass = task.classId ? getClassById(task.classId) : null;
            const isHighlighted = task.assignmentId && highlightedAssignmentId === task.assignmentId;
            const isDimmed = highlightedAssignmentId !== null && !isHighlighted;
            return (
              <div
                key={task.id}
                data-item-id={task.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'task',
                    id: task.id,
                    originalDate: task.scheduledDate
                  }));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                className={`p-3 rounded-lg border cursor-move transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] select-none ${
                  isHighlighted
                    ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 shadow-lg scale-[1.02]'
                    : ''
                } ${isDimmed ? 'opacity-30' : ''} ${getItemStatusColors(task.status)}`}
                onClick={(e) => handleItemClick(e, task)}
                onContextMenu={(e) => handleRightClick(e, task)}
              >
                <div className="text-sm font-semibold mb-2 line-clamp-2 leading-tight text-gray-900 dark:text-gray-100">
                  {task.title}
                </div>
                <div className="flex flex-col gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${getTypePillColors('task')}`}>
                    Task
                  </span>
                  <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium w-fit">
                    {task.hours}h
                  </span>
                </div>
                {taskClass && (
                  <div className="mt-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 w-fit">
                      {taskClass.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={() => onDeleteItem(contextMenu.item)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}

export default function Calendar() {
  const {
    getAssignmentsByDate,
    getTasksByDate,
    assignments,
    filters,
    setFilters,
    deleteAssignment,
    deleteTask,
    updateAssignment,
    updateTask,
    getClassById,
    toggleClassFilter
  } = usePotion();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingItem, setEditingItem] = useState<Assignment | Task | null>(null);
  const [highlightedAssignmentId, setHighlightedAssignmentId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const days = getCalendarDays(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDropItem = (date: Date, itemData: any) => {
    if (itemData.type === 'assignment') {
      updateAssignment(itemData.id, { dueDate: date });
    } else if (itemData.type === 'task') {
      updateTask(itemData.id, { scheduledDate: date });
    }
  };


  const handleAddItem = (date: Date) => {
    setSelectedDate(date);
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEditItem = (item: Assignment | Task) => {
    setEditingItem(item);
    setSelectedDate(null);
    setShowModal(true);
  };

  const handleDeleteItem = (item: Assignment | Task) => {
    if ('scheduledDate' in item) {
      deleteTask(item.id);
    } else {
      deleteAssignment(item.id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDate(null);
    setEditingItem(null);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-6">
            <h1 className="text-4xl font-black tracking-tight">{monthYear}</h1>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
            >
              Today
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filter</span>
              </button>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-10">
                  <div className="space-y-4">
                    <h3 className="font-medium text-xs text-subtle uppercase tracking-wider">Show items</h3>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.showAssignments}
                        onChange={(e) => setFilters({ ...filters, showAssignments: e.target.checked })}
                        className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Assignments</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.showTasks}
                        onChange={(e) => setFilters({ ...filters, showTasks: e.target.checked })}
                        className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Tasks</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <button
                onClick={goToPreviousMonth}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-r border-gray-200 dark:border-gray-700 rounded-l-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 rounded-r-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>


        {/* Active Class Filters */}
        {filters.filteredClasses.size > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Filtering by classes:
                </span>
                <div className="flex gap-2 flex-wrap">
                  {Array.from(filters.filteredClasses).map(classId => {
                    const class_ = getClassById(classId);
                    return class_ ? (
                      <span
                        key={classId}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-lg"
                      >
                        <span>{class_.emoji}</span>
                        <span>{class_.name}</span>
                        <button
                          onClick={() => toggleClassFilter(classId)}
                          className="ml-1 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-md transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              <button
                onClick={() => setFilters({ ...filters, filteredClasses: new Set() })}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
              >
                Clear all
              </button>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              💡 Shift+click on any assignment or task to filter by its class
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="p-4 text-center text-xs font-medium text-subtle uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/30">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            ref={containerRef}
            className="grid grid-cols-7 divide-x divide-gray-100 dark:divide-gray-700 relative"
          >
            {days.map(date => (
              <CalendarDay
                key={date.toISOString()}
                date={date}
                currentMonth={currentDate.getMonth()}
                assignments={getAssignmentsByDate(date)}
                tasks={getTasksByDate(date)}
                showAssignments={filters.showAssignments}
                showTasks={filters.showTasks}
                onAddItem={handleAddItem}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                getClassById={getClassById}
                onDropItem={handleDropItem}
                highlightedAssignmentId={highlightedAssignmentId}
                onHighlightAssignment={setHighlightedAssignmentId}
              />
            ))}
          </div>
        </div>

        {showModal && (
          <ItemModal
            item={editingItem || undefined}
            defaultDate={selectedDate || undefined}
            defaultAssignmentId={highlightedAssignmentId || undefined}
            onClose={handleCloseModal}
            isNew={!editingItem}
          />
        )}
      </div>
    </div>
  );
}