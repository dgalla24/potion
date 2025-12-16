'use client';

import { useState, useEffect, useRef } from 'react';
import { usePotion } from '@/hooks/usePotion';
import { Assignment, Task, Class, Exam, Event } from '@/types';
import { X, Calendar, ChevronDown, Clock, Tag, FileText, CheckSquare, Folder } from 'lucide-react';
import ContextMenu from './ContextMenu';

interface ItemModalProps {
  item?: Assignment | Task | Exam | Event;
  defaultDate?: Date;
  defaultAssignmentId?: string;
  defaultExamId?: string;
  defaultStartTime?: number; // minutes from midnight for schedule view
  onClose: () => void;
  isNew?: boolean;
}

type ItemType = 'task' | 'assignment' | 'exam' | 'event';
type ItemStatus = 'not_started' | 'in_progress' | 'completed' | 'not_submitted';

export default function ItemModal({ item, defaultDate, defaultAssignmentId, defaultExamId, defaultStartTime, onClose, isNew = false }: ItemModalProps) {
  const {
    addAssignment,
    updateAssignment,
    addTask,
    updateTask,
    deleteTask,
    deleteAssignment,
    addExam,
    updateExam,
    deleteExam,
    addEvent,
    updateEvent,
    deleteEvent,
    classes,
    addClass,
    deleteClass,
    assignments,
    exams
  } = usePotion();

  const titleRef = useRef<HTMLInputElement>(null);
  const hasCreatedRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const isConvertingTypeRef = useRef(false);
  const [currentItem, setCurrentItem] = useState<Assignment | Task | Exam | Event | null>(item || null);

  const [itemType, setItemType] = useState<ItemType>(() => {
    // Get type from the item itself
    if (item) return item.type;
    // If there's a default assignment ID or exam ID, create a task
    if (defaultAssignmentId || defaultExamId) return 'task';
    return 'assignment';
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
    return defaultAssignmentId || '';
  });

  const [examId, setExamId] = useState(() => {
    if (item && 'examId' in item) {
      return item.examId || '';
    }
    return defaultExamId || '';
  });

  const [status, setStatus] = useState<ItemStatus>(() => {
    if (item) {
      return item.status as ItemStatus;
    }
    return 'not_started';
  });

  const [planned, setPlanned] = useState(() => {
    if (item && 'planned' in item) {
      return item.planned;
    }
    return false;
  });

  const [title, setTitle] = useState(item?.title || 'Untitled');
  const [description, setDescription] = useState(item?.description || '');
  const [classId, setClassId] = useState<string>(() => {
    if (item?.classId) return item.classId;
    // If creating a task/event for a highlighted assignment/exam, inherit its class
    if (defaultAssignmentId) {
      const parentAssignment = assignments.find(a => a.id === defaultAssignmentId);
      return parentAssignment?.classId || '';
    }
    if (defaultExamId) {
      const parentExam = exams.find(e => e.id === defaultExamId);
      return parentExam?.classId || '';
    }
    return '';
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (item) {
      if ('dueDate' in item && item.dueDate != null) {
        // Handle both string and Date formats
        const dateValue = typeof item.dueDate === 'string' ? item.dueDate : item.dueDate.toISOString();
        return dateValue.split('T')[0];
      } else if ('scheduledDate' in item && item.scheduledDate != null) {
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

  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showAssignmentDropdown, setShowAssignmentDropdown] = useState(false);
  const [showExamDropdown, setShowExamDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    classId: string;
  } | null>(null);

  // Create item immediately if it's new
  useEffect(() => {
    console.log('=== Creation useEffect Running ===');
    console.log('isNew:', isNew);
    console.log('currentItem:', currentItem);
    console.log('hasCreatedRef.current:', hasCreatedRef.current);
    console.log('defaultStartTime:', defaultStartTime);
    console.log('==================================');
    if (isNew && !currentItem && !hasCreatedRef.current) {
      console.log('>>> CONDITIONS MET - Creating item...');
      hasCreatedRef.current = true;
      const [year, month, day] = selectedDate.split('-').map(Number);
      const dateValue = new Date(year, month - 1, day);

      const createItem = async () => {
        // Get initial class ID
        let initialClassId = '';
        if (item?.classId) {
          initialClassId = item.classId;
        } else if (defaultAssignmentId) {
          const parentAssignment = assignments.find(a => a.id === defaultAssignmentId);
          initialClassId = parentAssignment?.classId || '';
        } else if (defaultExamId) {
          const parentExam = exams.find(e => e.id === defaultExamId);
          initialClassId = parentExam?.classId || '';
        }

        const initialAssignmentId = item && 'assignmentId' in item ? (item.assignmentId || '') : (defaultAssignmentId || '');
        const initialExamId = item && 'examId' in item ? (item.examId || '') : (defaultExamId || '');
        const initialHours = item && 'hours' in item ? item.hours : 1;
        const initialStatus = item ? item.status : 'not_started';

        if (itemType === 'assignment') {
          const newAssignment = await addAssignment({
            title: 'Untitled',
            description: '',
            dueDate: dateValue,
            classId: initialClassId || undefined,
            status: initialStatus as any,
            planned: false,
          });
          setCurrentItem(newAssignment);
        } else if (itemType === 'exam') {
          const newExam = await addExam({
            title: 'Untitled',
            description: '',
            dueDate: dateValue,
            classId: initialClassId || undefined,
            status: initialStatus as any,
            planned: false,
          });
          setCurrentItem(newExam);
        } else if (itemType === 'task') {
          console.log('Creating task with defaultStartTime:', defaultStartTime);
          const taskData: any = {
            title: 'Untitled',
            description: '',
            scheduledDate: dateValue,
            hours: initialHours,
            classId: initialClassId || undefined,
            assignmentId: initialAssignmentId || undefined,
            examId: initialExamId || undefined,
            status: initialStatus as any,
          };
          // Only add startTime if it's defined (don't send undefined/null)
          if (defaultStartTime !== undefined && defaultStartTime !== null) {
            taskData.startTime = defaultStartTime;
          }
          console.log('Task data being sent:', taskData);
          const newTask = await addTask(taskData);
          console.log('Created task:', newTask);
          setCurrentItem(newTask);
        } else if (itemType === 'event') {
          console.log('Creating event with defaultStartTime:', defaultStartTime);
          const eventData: any = {
            title: 'Untitled',
            description: '',
            scheduledDate: dateValue,
            hours: initialHours,
            classId: initialClassId || undefined,
            assignmentId: initialAssignmentId || undefined,
            examId: initialExamId || undefined,
            status: initialStatus as any,
          };
          // Only add startTime if it's defined (don't send undefined/null)
          if (defaultStartTime !== undefined && defaultStartTime !== null) {
            eventData.startTime = defaultStartTime;
          }
          console.log('Event data being sent:', eventData);
          const newEvent = await addEvent(eventData);
          console.log('Created event:', newEvent);
          setCurrentItem(newEvent);
        }
      };

      createItem();
    }
  }, [isNew, currentItem, itemType, defaultStartTime, defaultAssignmentId, defaultExamId, item, assignments, exams, addAssignment, addExam, addTask, addEvent]);

  // Focus title on mount
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  // Handle type switching - convert between types
  useEffect(() => {
    if (!currentItem) return;

    const currentItemType = currentItem.type;

    // If type has changed, we need to delete the old item and create a new one
    if (currentItemType !== itemType) {
      isConvertingTypeRef.current = true;
      const [year, month, day] = selectedDate.split('-').map(Number);
      const dateValue = new Date(year, month - 1, day);

      const convertType = async () => {
        // Delete the old item based on its current type
        if (currentItemType === 'assignment') {
          await deleteAssignment(currentItem.id);
        } else if (currentItemType === 'task') {
          await deleteTask(currentItem.id);
        } else if (currentItemType === 'exam') {
          await deleteExam(currentItem.id);
        } else if (currentItemType === 'event') {
          await deleteEvent(currentItem.id);
        }

        // Create the new item with the same data
        if (itemType === 'assignment') {
          // Reset task/event-specific fields
          setAssignmentId('');
          setExamId('');
          setHours('1');
          const newAssignment = await addAssignment({
            title: title || 'Untitled',
            description: description,
            dueDate: dateValue,
            classId: classId || undefined,
            status: (status === 'not_started' || status === 'in_progress' || status === 'completed') ? status as any : 'not_started',
            planned: planned,
          });
          setCurrentItem(newAssignment);
        } else if (itemType === 'exam') {
          // Reset task/event-specific fields
          setAssignmentId('');
          setExamId('');
          setHours('1');
          const newExam = await addExam({
            title: title || 'Untitled',
            description: description,
            dueDate: dateValue,
            classId: classId || undefined,
            status: (status === 'not_started' || status === 'in_progress' || status === 'completed') ? status as any : 'not_started',
            planned: planned,
          });
          setCurrentItem(newExam);
        } else if (itemType === 'task') {
          // Reset assignment/exam-specific field
          setPlanned(false);
          const newTask = await addTask({
            title: title || 'Untitled',
            description: description,
            scheduledDate: dateValue,
            hours: parseFloat(hours) || 1,
            classId: classId || undefined,
            assignmentId: assignmentId || undefined,
            examId: examId || undefined,
            status: (status === 'not_started' || status === 'in_progress' || status === 'completed') ? status as any : 'not_started',
            startTime: currentItem && 'startTime' in currentItem ? currentItem.startTime : defaultStartTime,
          });
          setCurrentItem(newTask);
        } else if (itemType === 'event') {
          // Reset assignment/exam-specific field
          setPlanned(false);
          const newEvent = await addEvent({
            title: title || 'Untitled',
            description: description,
            scheduledDate: dateValue,
            hours: parseFloat(hours) || 1,
            classId: classId || undefined,
            assignmentId: assignmentId || undefined,
            examId: examId || undefined,
            status: (status === 'not_started' || status === 'in_progress' || status === 'completed') ? status as any : 'not_started',
            startTime: currentItem && 'startTime' in currentItem ? currentItem.startTime : defaultStartTime,
          });
          setCurrentItem(newEvent);
        }

        // Allow auto-save again after a short delay
        setTimeout(() => {
          isConvertingTypeRef.current = false;
        }, 100);
      };

      convertType();
    }
  }, [itemType]);

  // Auto-save function
  const autoSave = async () => {
    // Don't auto-save during type conversion
    if (isConvertingTypeRef.current) return;

    const targetItem = currentItem || item;
    if (!targetItem) return;

    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateValue = new Date(year, month - 1, day);

    // Determine actual item type from the item itself
    const actualItemType = targetItem.type;

    if (actualItemType === 'assignment') {
      await updateAssignment(targetItem.id, {
        title: title || 'Untitled',
        description: description,
        dueDate: dateValue,
        classId: classId || undefined,
        status: status as any,
        planned: planned,
      });
    } else if (actualItemType === 'exam') {
      await updateExam(targetItem.id, {
        title: title || 'Untitled',
        description: description,
        dueDate: dateValue,
        classId: classId || undefined,
        status: status as any,
        planned: planned,
      });
    } else if (actualItemType === 'task') {
      await updateTask(targetItem.id, {
        title: title || 'Untitled',
        description: description,
        scheduledDate: dateValue,
        hours: parseFloat(hours) || 1,
        classId: classId || undefined,
        assignmentId: assignmentId || undefined,
        examId: examId || undefined,
        status: status as any,
      });
    } else if (actualItemType === 'event') {
      await updateEvent(targetItem.id, {
        title: title || 'Untitled',
        description: description,
        scheduledDate: dateValue,
        hours: parseFloat(hours) || 1,
        classId: classId || undefined,
        assignmentId: assignmentId || undefined,
        examId: examId || undefined,
        status: status as any,
      });
    }
  };

  // Auto-save when values change
  useEffect(() => {
    // Skip the first render to avoid saving before user interacts
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      return;
    }

    if (currentItem || item) {
      const timeoutId = setTimeout(autoSave, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [title, description, selectedDate, hours, classId, assignmentId, examId, status, itemType, planned]);

  // Handle close with auto-save
  const handleClose = () => {
    autoSave();
    onClose();
  };

  const handleRemoveFromSchedule = async () => {
    if (!currentItem || !item) return;

    // Only tasks and events can be removed from schedule
    if (itemType === 'task' || itemType === 'event') {
      const updates: any = {
        startTime: null, // Remove the scheduled time
      };

      if (itemType === 'task') {
        await updateTask(currentItem.id, updates);
      } else if (itemType === 'event') {
        await updateEvent(currentItem.id, updates);
      }

      onClose();
    }
  };

  // Handle background click
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is inside any dropdown
      if (target.closest('[data-dropdown]')) {
        return;
      }
      setShowTypeDropdown(false);
      setShowStatusDropdown(false);
      setShowClassDropdown(false);
      setShowAssignmentDropdown(false);
      setShowExamDropdown(false);
    };

    if (showTypeDropdown || showStatusDropdown || showClassDropdown || showAssignmentDropdown || showExamDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTypeDropdown, showStatusDropdown, showClassDropdown, showAssignmentDropdown, showExamDropdown]);

  const handleAddClass = async (className: string) => {
    if (!className.trim()) return;

    const newClass = await addClass({
      name: className.trim(),
      emoji: ''
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

  const handleDeleteClass = async () => {
    if (contextMenu?.classId) {
      await deleteClass(contextMenu.classId);
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

  // Show all assignments in the dropdown, not just ones matching the current class
  const availableAssignments = assignments;


  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-end p-4">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-12 pb-10 space-y-8 max-h-[calc(85vh-80px)] overflow-y-auto">
          {/* Title - Document-style heading */}
          <div>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-6xl font-bold bg-transparent border-none outline-none placeholder-gray-300/60 dark:placeholder-gray-600/60 text-gray-900 dark:text-gray-100 leading-tight py-4"
              placeholder="Untitled"
            />
          </div>

          {/* Properties - Vertical stack with icons */}
          <div className="space-y-5">
            {/* Type */}
            <div className="flex items-center gap-4 group">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 w-28 flex-shrink-0 uppercase tracking-wide">
                <FileText className="w-3.5 h-3.5 opacity-60" />
                <span>Type</span>
              </div>
              <div className="flex-1">
                <div className="relative" data-dropdown>
                  <button
                    type="button"
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    className="flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 px-2 py-1.5 rounded-md transition-all duration-150 font-medium"
                  >
                    <span>
                      {itemType === 'task' && 'Task'}
                      {itemType === 'assignment' && 'Assignment'}
                      {itemType === 'exam' && 'Exam'}
                      {itemType === 'event' && 'Event'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                  </button>

                  {showTypeDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-xl z-10 min-w-[140px]">
                      <button
                        type="button"
                        onClick={() => {
                          setItemType('task');
                          setShowTypeDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 text-sm"
                      >
                        Task
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setItemType('assignment');
                          setShowTypeDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 text-sm"
                      >
                        Assignment
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setItemType('exam');
                          setShowTypeDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 text-sm"
                      >
                        Exam
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setItemType('event');
                          setShowTypeDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 text-sm"
                      >
                        Event
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4 group">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 w-28 flex-shrink-0 uppercase tracking-wide">
                <CheckSquare className="w-3.5 h-3.5 opacity-60" />
                <span>Status</span>
              </div>
              <div className="flex-1">
                <div className="relative" data-dropdown>
                  <button
                    type="button"
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="flex items-center gap-2 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 px-2 py-1.5 rounded-md transition-all duration-150 font-medium"
                  >
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${
                      status === 'not_started' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' :
                      status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      status === 'not_submitted' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {status === 'not_started' && 'Not Started'}
                      {status === 'in_progress' && 'In Progress'}
                      {status === 'completed' && 'Completed'}
                      {status === 'not_submitted' && 'Not Submitted'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                  </button>

                  {showStatusDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-xl z-10 min-w-[160px]">
                      <button
                        type="button"
                        onClick={() => {
                          setStatus('not_started');
                          setShowStatusDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                      >
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          Not Started
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStatus('in_progress');
                          setShowStatusDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                      >
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          In Progress
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStatus('completed');
                          setShowStatusDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                      >
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          Completed
                        </span>
                      </button>
                      {itemType === 'assignment' && (
                        <button
                          type="button"
                          onClick={() => {
                            setStatus('not_submitted');
                            setShowStatusDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                        >
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            Not Submitted
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Planned (Assignments and Exams only) */}
            {(itemType === 'assignment' || itemType === 'exam') && (
              <div className="flex items-center gap-4 group">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 w-28 flex-shrink-0 uppercase tracking-wide">
                  <CheckSquare className="w-3.5 h-3.5 opacity-60" />
                  <span>Planned</span>
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={planned}
                      onChange={(e) => setPlanned(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {planned ? 'Yes' : 'No'}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Date */}
            <div className="flex items-center gap-4 group">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 w-28 flex-shrink-0 uppercase tracking-wide">
                <Calendar className="w-3.5 h-3.5 opacity-60" />
                <span>{itemType === 'assignment' ? 'Due' : 'Date'}</span>
              </div>
              <div className="flex-1">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 cursor-pointer py-1.5 px-2 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 rounded-md transition-all duration-150 font-medium"
                />
              </div>
            </div>

            {/* Hours (Tasks and Events only) */}
            {(itemType === 'task' || itemType === 'event') && (
              <div className="flex items-center gap-4 group">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 w-28 flex-shrink-0 uppercase tracking-wide">
                  <Clock className="w-3.5 h-3.5 opacity-60" />
                  <span>Hours</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0.5"
                      max="24"
                      step="0.5"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="w-20 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none py-1.5 px-2 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 rounded-md transition-all duration-150 font-medium"
                      style={{ MozAppearance: 'textfield' }}
                    />
                    <span className="text-sm text-gray-400">hours</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Class Selection */}
          <div className="flex items-center gap-4 group">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 w-28 flex-shrink-0 uppercase tracking-wide">
              <Folder className="w-3.5 h-3.5 opacity-60" />
              <span>Class</span>
            </div>
            <div className="flex-1">
              <div className="relative" data-dropdown>
                <button
                  type="button"
                  onClick={() => setShowClassDropdown(!showClassDropdown)}
                  className="flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 px-2 py-1.5 rounded-md transition-all duration-150 font-medium"
                >
                  {classId ? (() => {
                    const selectedClass = classes.find(c => c.id === classId);
                    return selectedClass ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/80 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium">
                        {selectedClass.emoji && <span>{selectedClass.emoji}</span>}
                        <span>{selectedClass.name}</span>
                      </span>
                    ) : 'Select a class';
                  })() : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">Add class...</span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                </button>

                {showClassDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-xl z-10 min-w-48 max-h-64 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setClassId('');
                        setShowClassDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 text-sm"
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
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-900 dark:text-gray-100 text-sm"
                      >
                        {cls.emoji && <span>{cls.emoji}</span>}
                        <span>{cls.name}</span>
                      </button>
                    ))}
                    <div className="border-t border-gray-200/50 dark:border-gray-600/50 p-2">
                      <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        onKeyDown={handleClassKeyDown}
                        className="w-full px-2 py-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400"
                        placeholder="Type new class name..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assignment Link (Tasks and Events) */}
          {(itemType === 'task' || itemType === 'event') && (
            <div className="flex items-center gap-4 group">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 w-28 flex-shrink-0 uppercase tracking-wide">
                <Tag className="w-3.5 h-3.5 opacity-60" />
                <span>Assignment</span>
              </div>
              <div className="flex-1">
                <div className="relative" data-dropdown>
                  <button
                    type="button"
                    onClick={() => setShowAssignmentDropdown(!showAssignmentDropdown)}
                    className="flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 px-2 py-1.5 rounded-md transition-all duration-150 font-medium"
                  >
                    {assignmentId ? (() => {
                      const selectedAssignment = assignments.find(a => a.id === assignmentId);
                      return selectedAssignment ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50/80 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-md text-sm font-medium">
                          📋 {selectedAssignment.title}
                        </span>
                      ) : 'Select an assignment';
                    })() : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm">Link to assignment...</span>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                  </button>

                  {showAssignmentDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-xl z-10 min-w-48 max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setAssignmentId('');
                          setShowAssignmentDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 text-sm"
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
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 text-sm"
                        >
                          {assignment.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Exam Link (Tasks and Events) */}
          {(itemType === 'task' || itemType === 'event') && (
            <div className="flex items-center gap-4 group">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 dark:text-gray-500 w-28 flex-shrink-0 uppercase tracking-wide">
                <Tag className="w-3.5 h-3.5 opacity-60" />
                <span>Exam</span>
              </div>
              <div className="flex-1">
                <div className="relative" data-dropdown>
                  <button
                    type="button"
                    onClick={() => setShowExamDropdown(!showExamDropdown)}
                    className="flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:bg-gray-50/70 dark:hover:bg-gray-800/70 px-2 py-1.5 rounded-md transition-all duration-150 font-medium"
                  >
                    {examId ? (() => {
                      const selectedExam = exams.find(e => e.id === examId);
                      return selectedExam ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50/80 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-md text-sm font-medium">
                          📝 {selectedExam.title}
                        </span>
                      ) : 'Select an exam';
                    })() : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm">Link to exam...</span>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
                  </button>

                  {showExamDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-xl z-10 min-w-48 max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setExamId('');
                          setShowExamDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 text-sm"
                      >
                        No exam
                      </button>
                      {exams.map((exam) => (
                        <button
                          key={exam.id}
                          type="button"
                          onClick={() => {
                            setExamId(exam.id);
                            setShowExamDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100 text-sm"
                        >
                          {exam.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description - Notion-style editor */}
          <div className="pt-8 border-t border-gray-100/30 dark:border-gray-700/30 mt-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-1 py-3 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-300/70 dark:placeholder-gray-600/70 min-h-[200px] text-[15px] leading-relaxed focus:placeholder-gray-400/50"
              placeholder="Add a description..."
            />
          </div>

        </div>
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