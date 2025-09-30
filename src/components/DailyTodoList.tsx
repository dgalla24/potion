'use client';

import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { usePotion } from '@/hooks/usePotion';
import { formatDate } from '@/lib/utils';
import { Task, TaskStatus } from '@/types';
import ItemModal from './ItemModal';
import ContextMenu from './ContextMenu';

interface CheckboxItem {
  id: string;
  text: string;
  checked: boolean;
}

const parseCheckboxes = (text: string): (string | CheckboxItem)[] => {
  const checkboxRegex = /\[([ xX])\]\s*([^\n\r]*)/gm;
  const parts: (string | CheckboxItem)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = checkboxRegex.exec(text)) !== null) {
    // Add text before the checkbox
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index).trim();
      if (beforeText) {
        parts.push(beforeText);
      }
    }

    // Add the checkbox
    parts.push({
      id: Math.random().toString(36).substr(2, 9),
      text: match[2].trim(),
      checked: match[1].toLowerCase() === 'x'
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex).trim();
    if (remainingText) {
      parts.push(remainingText);
    }
  }

  return parts;
};

const renderDescriptionWithCheckboxes = (
  description: string,
  onCheckboxToggle: (newDescription: string) => void
) => {
  const parts = parseCheckboxes(description);

  if (parts.every(part => typeof part === 'string')) {
    // No checkboxes found, render as plain text
    return <span>{description}</span>;
  }

  return (
    <div className="space-y-1">
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return (
            <div key={index} className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed py-1">
              {part}
            </div>
          );
        }

        const handleToggle = () => {
          // Handle both uppercase and lowercase x
          const currentPattern = part.checked
            ? new RegExp(`\\[([xX])\\]\\s*${part.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
            : new RegExp(`\\[\\s\\]\\s*${part.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);

          const replacement = part.checked
            ? `[ ] ${part.text}`
            : `[x] ${part.text}`;

          const newDescription = description.replace(currentPattern, replacement);
          onCheckboxToggle(newDescription);
        };

        return (
          <div key={part.id} className="flex items-start gap-3 py-1">
            <button
              onClick={handleToggle}
              className={`flex-shrink-0 w-4 h-4 mt-0.5 border-2 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                part.checked
                  ? 'bg-green-500 border-green-500 text-white shadow-sm'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-white dark:bg-gray-800'
              }`}
            >
              {part.checked && (
                <Check className="w-3 h-3" />
              )}
            </button>
            <span className={`text-sm leading-relaxed ${part.checked ? 'line-through text-muted' : 'text-gray-700 dark:text-gray-300'}`}>
              {part.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onUpdateDescription: (id: string, description: string) => void;
  onHighlight: (task: Task) => void;
  highlightedItems: Set<string>;
  getClassById: (id: string) => import('@/types').Class | undefined;
}

function TaskItem({ task, onStatusChange, onEdit, onDelete, onUpdateDescription, onHighlight, highlightedItems, getClassById }: TaskItemProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'in_progress':
        return <div className="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />;
    }
  };

  const getNextStatus = (currentStatus: TaskStatus): TaskStatus => {
    switch (currentStatus) {
      case 'not_started':
        return 'in_progress';
      case 'in_progress':
        return 'completed';
      case 'completed':
        return 'not_started';
      default:
        return 'not_started';
    }
  };

  const getHoursColor = (hours: number) => {
    // Color based on hours: 0-1 green, 1-3 blue, 3-5 yellow, 5-8 orange, 8+ red
    if (hours <= 1) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (hours <= 3) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    if (hours <= 5) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (hours <= 8) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const getHighlightStyles = () => {
    if (highlightedItems.size === 0) {
      return ''; // No highlighting active
    }

    if (highlightedItems.has(task.id)) {
      return 'ring-2 ring-blue-500 shadow-lg'; // Highlighted
    } else {
      return 'opacity-30'; // Dimmed
    }
  };

  const handleTaskClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      onHighlight(task);
    } else {
      onEdit(task);
    }
  };

  return (
    <>
      <div
        className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
          task.status === 'completed'
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
            : 'surface border-gray-200 dark:border-gray-700 hover:scale-[1.01]'
        } ${getHighlightStyles()}`}
        onContextMenu={handleRightClick}
      >
        <button
          onClick={() => onStatusChange(task.id, getNextStatus(task.status))}
          className="flex-shrink-0 hover:scale-110 transition-transform"
        >
          {getStatusIcon(task.status)}
        </button>

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={handleTaskClick}
        >
          <div className={`font-semibold text-sm ${
            task.status === 'completed' ? 'line-through text-muted' : ''
          }`}>
            {task.title}
          </div>
          {task.description && (
            <div className="text-xs text-muted mt-1">
              {renderDescriptionWithCheckboxes(
                task.description,
                (newDescription) => onUpdateDescription(task.id, newDescription)
              )}
            </div>
          )}
          {task.classId && (
            <div className="flex items-center gap-1 mt-2">
              {(() => {
                const taskClass = getClassById(task.classId);
                return taskClass ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium">
                    <span>{taskClass.emoji}</span>
                    <span>{taskClass.name}</span>
                  </span>
                ) : null;
              })()}
            </div>
          )}
          {task.assignmentId && (
            <div className="text-xs text-subtle mt-1">
              Part of assignment
            </div>
          )}
        </div>

        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHoursColor(task.hours)}`}>
          {task.hours}h
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={() => onDelete(task)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}

export default function DailyTodoList() {
  const { getTodayTasks, updateTask, deleteTask, getClassById, filters, highlightItem, clearHighlight } = usePotion();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayTasks = getTodayTasks();
  const totalHours = todayTasks.reduce((sum, task) => sum + task.hours, 0);
  const completedTasks = todayTasks.filter(task => task.status === 'completed').length;

  const handleStatusChange = (id: string, status: TaskStatus) => {
    updateTask(id, { status });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleDeleteTask = (task: Task) => {
    deleteTask(task.id);
  };

  const handleUpdateDescription = (id: string, description: string) => {
    updateTask(id, { description });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const today = formatDate(new Date());

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Today's Tasks</h1>
        <p className="text-muted text-lg">{today}</p>

        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <div className="status-pill bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Total Hours: {totalHours}h
          </div>
          <div className="status-pill bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            {completedTasks}/{todayTasks.length} completed
          </div>
        </div>

        {/* Active Highlighting */}
        {filters.highlightedItems.size > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                Highlighting {filters.highlightedItems.size} related items
              </span>
              <button
                onClick={clearHighlight}
                className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 font-medium"
              >
                Clear highlight
              </button>
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              💡 Shift+click on any task to change the highlight
            </p>
          </div>
        )}
      </div>

      {todayTasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-muted mb-6">
            <Check className="w-20 h-20 mx-auto opacity-40" />
          </div>
          <h3 className="text-xl font-semibold mb-3">No tasks for today</h3>
          <p className="text-muted mb-6 text-lg">You're all caught up! Add some tasks to stay productive.</p>
          <button
            onClick={handleAddTask}
            className="btn btn-primary"
          >
            Add Your First Task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {todayTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onUpdateDescription={handleUpdateDescription}
              onHighlight={highlightItem}
              highlightedItems={filters.highlightedItems}
              getClassById={getClassById}
            />
          ))}

          <button
            onClick={handleAddTask}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-muted hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Task</span>
          </button>
        </div>
      )}

      {completedTasks === todayTasks.length && todayTasks.length > 0 && (
        <div className="mt-8 text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="text-3xl mb-3">🎉</div>
          <h3 className="font-semibold text-green-800 dark:text-green-300 text-lg">All tasks completed!</h3>
          <p className="text-green-600 dark:text-green-400 text-sm mt-1">Great job finishing everything today.</p>
        </div>
      )}

      {showModal && (
        <ItemModal
          item={editingTask || undefined}
          defaultDate={new Date()}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}