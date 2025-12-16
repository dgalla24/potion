'use client';

import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { usePotion } from '@/hooks/usePotion';
import { formatDate } from '@/lib/utils';
import { Task, TaskStatus, Event, EventStatus, Assignment, AssignmentStatus } from '@/types';
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
  getClassById: (id: string) => import('@/types').Class | undefined;
}

function TaskItem({ task, onStatusChange, onEdit, onDelete, onUpdateDescription, getClassById }: TaskItemProps) {
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


  const handleTaskClick = (e: React.MouseEvent) => {
    onEdit(task);
  };

  return (
    <>
      <div
        className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
          task.status === 'completed'
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
            : 'surface border-gray-200 dark:border-gray-700 hover:scale-[1.01]'
        }`}
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

interface EventItemProps {
  event: Event;
  onStatusChange: (id: string, status: EventStatus) => void;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onUpdateDescription: (id: string, description: string) => void;
  getClassById: (id: string) => import('@/types').Class | undefined;
}

function EventItem({ event, onStatusChange, onEdit, onDelete, onUpdateDescription, getClassById }: EventItemProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const getStatusIcon = (status: EventStatus) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'in_progress':
        return <div className="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />;
    }
  };

  const getNextStatus = (currentStatus: EventStatus): EventStatus => {
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

  const handleEventClick = (e: React.MouseEvent) => {
    onEdit(event);
  };

  return (
    <>
      <div
        className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
          event.status === 'completed'
            ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
            : 'surface border-gray-200 dark:border-gray-700 hover:scale-[1.01]'
        }`}
        onContextMenu={handleRightClick}
      >
        <button
          onClick={() => onStatusChange(event.id, getNextStatus(event.status))}
          className="flex-shrink-0 hover:scale-110 transition-transform"
        >
          {getStatusIcon(event.status)}
        </button>

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={handleEventClick}
        >
          <div className="flex items-center gap-2">
            <div className={`font-semibold text-sm ${
              event.status === 'completed' ? 'line-through text-muted' : ''
            }`}>
              {event.title}
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              Event
            </span>
          </div>
          {event.description && (
            <div className="text-xs text-muted mt-1">
              {renderDescriptionWithCheckboxes(
                event.description,
                (newDescription) => onUpdateDescription(event.id, newDescription)
              )}
            </div>
          )}
          {event.classId && (
            <div className="flex items-center gap-1 mt-2">
              {(() => {
                const eventClass = getClassById(event.classId);
                return eventClass ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium">
                    <span>{eventClass.emoji}</span>
                    <span>{eventClass.name}</span>
                  </span>
                ) : null;
              })()}
            </div>
          )}
        </div>

        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHoursColor(event.hours)}`}>
          {event.hours}h
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={() => onDelete(event)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}

interface AssignmentItemProps {
  assignment: Assignment;
  onStatusChange: (id: string, status: AssignmentStatus) => void;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignment: Assignment) => void;
  getClassById: (id: string) => import('@/types').Class | undefined;
}

function AssignmentItem({ assignment, onStatusChange, onEdit, onDelete, getClassById }: AssignmentItemProps) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const getStatusIcon = (status: AssignmentStatus) => {
    switch (status) {
      case 'completed':
      case 'not_submitted':
        return <Check className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'in_progress':
        return <div className="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />;
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleAssignmentClick = (e: React.MouseEvent) => {
    onEdit(assignment);
  };

  const getStatusDisplay = (status: AssignmentStatus) => {
    switch (status) {
      case 'not_started':
        return 'Not Started';
      case 'in_progress':
        return 'In Progress';
      case 'not_submitted':
        return 'Not Submitted';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <>
      <div
        className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-sm ${
          assignment.status === 'completed' || assignment.status === 'not_submitted'
            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
            : 'surface border-gray-200 dark:border-gray-700 hover:scale-[1.01]'
        }`}
        onContextMenu={handleRightClick}
      >
        <button
          onClick={handleAssignmentClick}
          className="flex-shrink-0 hover:scale-110 transition-transform"
        >
          {getStatusIcon(assignment.status)}
        </button>

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={handleAssignmentClick}
        >
          <div className="flex items-center gap-2">
            <div className={`font-semibold text-sm ${
              assignment.status === 'completed' || assignment.status === 'not_submitted' ? 'line-through text-muted' : ''
            }`}>
              {assignment.title}
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              Assignment
            </span>
          </div>
          {assignment.description && (
            <div className="text-xs text-muted mt-1 whitespace-pre-wrap">
              {assignment.description}
            </div>
          )}
          {assignment.classId && (
            <div className="flex items-center gap-1 mt-2">
              {(() => {
                const assignmentClass = getClassById(assignment.classId);
                return assignmentClass ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium">
                    <span>{assignmentClass.emoji}</span>
                    <span>{assignmentClass.name}</span>
                  </span>
                ) : null;
              })()}
            </div>
          )}
        </div>

        <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {getStatusDisplay(assignment.status)}
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={() => onDelete(assignment)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}

export default function DailyTodoList() {
  const { getTodayTasks, getTodayEvents, getTodayAssignments, updateTask, deleteTask, updateEvent, deleteEvent, updateAssignment, deleteAssignment, getClassById } = usePotion();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const todayTasks = getTodayTasks();
  const todayEvents = getTodayEvents();
  const todayAssignments = getTodayAssignments();

  const totalHours = todayTasks.reduce((sum, task) => sum + task.hours, 0) +
                     todayEvents.reduce((sum, event) => sum + event.hours, 0);
  const completedTasks = todayTasks.filter(task => task.status === 'completed').length;
  const completedEvents = todayEvents.filter(event => event.status === 'completed').length;
  const completedAssignments = todayAssignments.filter(assignment => assignment.status === 'completed' || assignment.status === 'not_submitted').length;
  const totalItems = todayTasks.length + todayEvents.length + todayAssignments.length;
  const totalCompleted = completedTasks + completedEvents + completedAssignments;

  const handleTaskStatusChange = (id: string, status: TaskStatus) => {
    updateTask(id, { status });
  };

  const handleEventStatusChange = (id: string, status: EventStatus) => {
    updateEvent(id, { status });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditingEvent(null);
    setEditingAssignment(null);
    setShowModal(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEditingTask(null);
    setEditingAssignment(null);
    setShowModal(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setEditingTask(null);
    setEditingEvent(null);
    setShowModal(true);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setEditingEvent(null);
    setEditingAssignment(null);
    setShowModal(true);
  };

  const handleDeleteTask = (task: Task) => {
    deleteTask(task.id);
  };

  const handleDeleteEvent = (event: Event) => {
    deleteEvent(event.id);
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    deleteAssignment(assignment.id);
  };

  const handleUpdateTaskDescription = (id: string, description: string) => {
    updateTask(id, { description });
  };

  const handleUpdateEventDescription = (id: string, description: string) => {
    updateEvent(id, { description });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setEditingEvent(null);
    setEditingAssignment(null);
  };

  const today = formatDate(new Date());

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Today&apos;s Tasks</h1>
        <p className="text-muted text-lg">{today}</p>

        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <div className="status-pill bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            Total Hours: {totalHours}h
          </div>
          <div className="status-pill bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            {totalCompleted}/{totalItems} completed
          </div>
        </div>

      </div>

      {totalItems === 0 ? (
        <div className="text-center py-16">
          <div className="text-muted mb-6">
            <Check className="w-20 h-20 mx-auto opacity-40" />
          </div>
          <h3 className="text-xl font-semibold mb-3">No items for today</h3>
          <p className="text-muted mb-6 text-lg">You&apos;re all caught up! Add some tasks to stay productive.</p>
          <button
            onClick={handleAddTask}
            className="btn btn-primary"
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {todayAssignments.map(assignment => (
            <AssignmentItem
              key={assignment.id}
              assignment={assignment}
              onStatusChange={() => {}}
              onEdit={handleEditAssignment}
              onDelete={handleDeleteAssignment}
              getClassById={getClassById}
            />
          ))}
          {todayTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={handleTaskStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onUpdateDescription={handleUpdateTaskDescription}
              getClassById={getClassById}
            />
          ))}
          {todayEvents.map(event => (
            <EventItem
              key={event.id}
              event={event}
              onStatusChange={handleEventStatusChange}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onUpdateDescription={handleUpdateEventDescription}
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

      {totalCompleted === totalItems && totalItems > 0 && (
        <div className="mt-8 text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="text-3xl mb-3">🎉</div>
          <h3 className="font-semibold text-green-800 dark:text-green-300 text-lg">All items completed!</h3>
          <p className="text-green-600 dark:text-green-400 text-sm mt-1">Great job finishing everything today.</p>
        </div>
      )}

      {showModal && (
        <ItemModal
          item={editingTask || editingEvent || editingAssignment || undefined}
          defaultDate={new Date()}
          onClose={handleCloseModal}
          isNew={!editingTask && !editingEvent && !editingAssignment}
        />
      )}
    </div>
  );
}