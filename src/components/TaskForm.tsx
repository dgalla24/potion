'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { usePotion } from '@/hooks/usePotion';
import { Task, TaskStatus, TaskDifficulty } from '@/types';

interface TaskFormProps {
  task?: Task;
  defaultDate?: Date;
  onClose: () => void;
  onSave?: (task: Task) => void;
}

export default function TaskForm({ task, defaultDate, onClose, onSave }: TaskFormProps) {
  const { addTask, updateTask, assignments } = usePotion();
  const [formData, setFormData] = useState({
    title: task?.title || '',
    scheduledDate: task?.scheduledDate
      ? task.scheduledDate.toISOString().split('T')[0]
      : defaultDate
      ? defaultDate.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    status: task?.status || 'not_started' as TaskStatus,
    assignmentId: task?.assignmentId || '',
    difficulty: task?.difficulty || 3 as TaskDifficulty,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.scheduledDate) {
      return;
    }

    const taskData = {
      title: formData.title.trim(),
      scheduledDate: new Date(formData.scheduledDate),
      status: formData.status,
      assignmentId: formData.assignmentId || undefined,
      difficulty: formData.difficulty,
    };

    if (task) {
      updateTask(task.id, taskData);
      onSave?.(task);
    } else {
      const newTask = addTask(taskData);
      onSave?.(newTask);
    }

    onClose();
  };

  const getDifficultyLabel = (difficulty: TaskDifficulty) => {
    const labels = {
      1: '1 - Very Easy',
      2: '2 - Easy',
      3: '3 - Medium',
      4: '4 - Hard',
      5: '5 - Very Hard',
    };
    return labels[difficulty];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date
            </label>
            <input
              type="date"
              id="scheduledDate"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty / Time Estimate
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) as TaskDifficulty })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>
                  {getDifficultyLabel(num as TaskDifficulty)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assignmentId" className="block text-sm font-medium text-gray-700 mb-1">
              Link to Assignment (Optional)
            </label>
            <select
              id="assignmentId"
              value={formData.assignmentId}
              onChange={(e) => setFormData({ ...formData, assignmentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">No assignment</option>
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
            >
              {task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}