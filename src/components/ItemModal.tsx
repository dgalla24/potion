'use client';

import { useState, useEffect } from 'react';
import { usePotion } from '@/hooks/usePotion';
import { Assignment, Task, Class } from '@/types';
import { X, Calendar, ChevronDown } from 'lucide-react';
import ContextMenu from './ContextMenu';

interface ItemModalProps {
  item?: Assignment | Task;
  defaultDate?: Date;
  defaultAssignmentId?: string;
  onClose: () => void;
}

type ItemType = 'task' | 'assignment';
type ItemStatus = 'not_started' | 'in_progress' | 'completed' | 'not_submitted' | 'submitted';

export default function ItemModal({ item, defaultDate, defaultAssignmentId, onClose }: ItemModalProps) {
  const {
    addAssignment,
    updateAssignment,
    addTask,
    updateTask,
    classes,
    addClass,
    deleteClass,
    assignments,
    filters,
    highlightItem
  } = usePotion();

  const [itemType, setItemType] = useState<ItemType>(() => {
    if (item) {
      return 'dueDate' in item ? 'assignment' : 'task';
    }
    return defaultAssignmentId ? 'task' : 'assignment';
  });

  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [classId, setClassId] = useState<string>(item?.classId || '');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (item) {
      if ('dueDate' in item) {
        // Handle both string and Date formats
        const dateValue = typeof item.dueDate === 'string' ? item.dueDate : item.dueDate.toISOString();
        return dateValue.split('T')[0];
      } else {
        // Handle both string and Date formats
        const dateValue = typeof item.scheduledDate === 'string' ? item.scheduledDate : item.scheduledDate.toISOString();
        return dateValue.split('T')[0];
      }
    }
    if (defaultDate) {
      return defaultDate.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });

  const [hours, setHours] = useState(() => {
    if (item && 'hours' in item) {
      return item.hours.toString();
    }
    return '1';
  });

  const [assignmentId, setAssignmentId] = useState(() => {
    if (item && 'assignmentId' in item) {
      return item.assignmentId || '';
    }
    return defaultAssignmentId || (() => {
      // Auto-link to highlighted assignment
      const highlightedAssignments = assignments.filter(a => filters.highlightedItems.has(a.id));
      return highlightedAssignments.length === 1 ? highlightedAssignments[0].id : '';
    })();
  });

  const [status, setStatus] = useState<ItemStatus>(() => {
    if (item) {
      return item.status as ItemStatus;
    }
    return 'not_started';
  });

  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showAssignmentDropdown, setShowAssignmentDropdown] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    classId: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    // Create date in local timezone to avoid timezone shifts
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateValue = new Date(year, month - 1, day);

    if (itemType === 'assignment') {
      const assignmentData = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dateValue.toISOString(),
        classId: classId || undefined,
        status: status as any,
      };

      if (item && 'dueDate' in item) {
        updateAssignment(item.id, assignmentData);
      } else {
        addAssignment(assignmentData);
      }
    } else {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        scheduledDate: dateValue.toISOString(),
        hours: parseFloat(hours) || 1,
        classId: classId || undefined,
        assignmentId: assignmentId || undefined,
        status: status as any,
      };

      if (item && 'scheduledDate' in item) {
        updateTask(item.id, taskData);
      } else {
        const newTask = addTask(taskData);

        // If the task is linked to a highlighted assignment, highlight the new task
        if (assignmentId && filters.highlightedItems.has(assignmentId)) {
          setTimeout(() => {
            highlightItem(newTask);
          }, 100);
        }
      }
    }

    onClose();
  };

  const handleAddClass = (className: string) => {
    if (!className.trim()) return;

    const newClass = addClass({
      name: className.trim(),
      emoji: '',
      color: '#3B82F6'
    });

    setClassId(newClass.id);
    setNewClassName('');
    setShowClassDropdown(false);
  };

  const handleClassRightClick = (e: React.MouseEvent, classToDeleteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      classId: classToDeleteId,
    });
  };

  const handleDeleteClass = () => {
    if (contextMenu?.classId) {
      deleteClass(contextMenu.classId);
      if (classId === contextMenu.classId) {
        setClassId('');
      }
      setContextMenu(null);
    }
  };

  const handleClassKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newClassName.trim()) {
      handleAddClass(newClassName);
    }
  };

  const availableAssignments = assignments.filter(a => !classId || a.classId === classId);

  const renderDescriptionWithCheckboxes = (description: string) => {
    const lines = description.split('\n');

    return lines.map((line, index) => {
      const checkboxMatch = line.match(/^(\s*)\[([ xX])\]\s*(.*)$/);

      if (checkboxMatch) {
        const [, indent, checked, text] = checkboxMatch;
        const isChecked = checked.toLowerCase() === 'x';

        const toggleCheckbox = () => {
          const newLines = [...lines];
          newLines[index] = `${indent}[${isChecked ? ' ' : 'x'}] ${text}`;
          setDescription(newLines.join('\n'));
        };

        return (
          <div key={index} className="flex items-start gap-3 py-1" style={{ marginLeft: indent.length * 16 }}>
            <button
              type="button"
              onClick={toggleCheckbox}
              className={`flex-shrink-0 w-4 h-4 mt-0.5 border-2 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                isChecked
                  ? 'bg-green-500 border-green-500 text-white shadow-sm'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-white dark:bg-gray-800'
              }`}
            >
              {isChecked && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <span className={`text-sm leading-relaxed ${isChecked ? 'line-through text-gray-500 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
              {text}
            </span>
          </div>
        );
      }

      return (
        <div key={index} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed py-1 whitespace-pre-wrap">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100">
            {item ? 'Edit' : 'New'} {itemType === 'assignment' ? 'Assignment' : 'Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Title - Page heading style */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
              placeholder={`${itemType === 'assignment' ? 'Assignment' : 'Task'} title...`}
              required
            />
          </div>

          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Type Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <div className="relative">
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value as ItemType)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer text-gray-900 dark:text-gray-100"
                >
                  <option value="task">Task</option>
                  <option value="assignment">Assignment</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ItemStatus)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer text-gray-900 dark:text-gray-100"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  {itemType === 'assignment' && (
                    <>
                      <option value="not_submitted">Not Submitted</option>
                      <option value="submitted">Submitted</option>
                    </>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {itemType === 'assignment' ? 'Due Date' : 'Scheduled Date'}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            {/* Hours (Tasks only) */}
            {itemType === 'task' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hours</label>
                <input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ MozAppearance: 'textfield' }}
                />
              </div>
            )}
          </div>

          {/* Class Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowClassDropdown(!showClassDropdown)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-left transition-all duration-200 text-gray-900 dark:text-gray-100"
              >
                <span>
                  {classId ? (() => {
                    const selectedClass = classes.find(c => c.id === classId);
                    return selectedClass ? `${selectedClass.emoji} ${selectedClass.name}`.trim() : 'Select a class';
                  })() : 'Select a class'}
                </span>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </button>

              {showClassDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setClassId('');
                      setShowClassDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                  >
                    No class
                  </button>
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => {
                        setClassId(cls.id);
                        setShowClassDropdown(false);
                      }}
                      onContextMenu={(e) => handleClassRightClick(e, cls.id)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-900 dark:text-gray-100"
                    >
                      {cls.emoji && <span>{cls.emoji}</span>}
                      <span>{cls.name}</span>
                    </button>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-600 p-4">
                    <input
                      type="text"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      onKeyDown={handleClassKeyDown}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                      placeholder="Type new class name and press Enter"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Link (Tasks only) */}
          {itemType === 'task' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignment (Optional)</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAssignmentDropdown(!showAssignmentDropdown)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-left transition-all duration-200 text-gray-900 dark:text-gray-100"
                >
                  <span>
                    {assignmentId ? (() => {
                      const selectedAssignment = assignments.find(a => a.id === assignmentId);
                      return selectedAssignment ? selectedAssignment.title : 'Select an assignment';
                    })() : 'Link to assignment'}
                  </span>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </button>

                {showAssignmentDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setAssignmentId('');
                        setShowAssignmentDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                    >
                      No assignment
                    </button>
                    {availableAssignments.map((assignment) => (
                      <button
                        key={assignment.id}
                        type="button"
                        onClick={() => {
                          setAssignmentId(assignment.id);
                          setShowAssignmentDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                      >
                        {assignment.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              {item ? 'Update' : 'Create'} {itemType === 'assignment' ? 'Assignment' : 'Task'}
            </button>
          </div>

          {/* Description - At the bottom */}
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>

            {/* Preview Mode */}
            {description && (
              <div className="max-h-48 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl space-y-2">
                {renderDescriptionWithCheckboxes(description)}
              </div>
            )}

            {/* Edit Mode */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-900 dark:text-gray-100"
              rows={4}
              placeholder="Add description... (Use [ ] for checkboxes, e.g., '[ ] Item to check')"
            />

            <div className="text-xs text-gray-500 dark:text-gray-400">
              💡 Type [ ] to create checkboxes that you can interact with
            </div>
          </div>
        </form>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDelete={handleDeleteClass}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}