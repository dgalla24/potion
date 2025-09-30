'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { usePotion } from '@/hooks/usePotion';
import { Assignment, AssignmentStatus } from '@/types';

interface AssignmentFormProps {
  assignment?: Assignment;
  onClose: () => void;
  onSave?: (assignment: Assignment) => void;
}

export default function AssignmentForm({ assignment, onClose, onSave }: AssignmentFormProps) {
  const { addAssignment, updateAssignment } = usePotion();
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    dueDate: assignment?.dueDate ? assignment.dueDate.toISOString().split('T')[0] : '',
    status: assignment?.status || 'not_started' as AssignmentStatus,
    planned: assignment?.planned || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.dueDate) {
      return;
    }

    const assignmentData = {
      title: formData.title.trim(),
      dueDate: new Date(formData.dueDate),
      status: formData.status,
      planned: formData.planned,
    };

    if (assignment) {
      updateAssignment(assignment.id, assignmentData);
      onSave?.(assignment);
    } else {
      const newAssignment = addAssignment(assignmentData);
      onSave?.(newAssignment);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {assignment ? 'Edit Assignment' : 'New Assignment'}
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
              placeholder="Enter assignment title"
              required
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as AssignmentStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="not_submitted">Not Submitted</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="planned"
              checked={formData.planned}
              onChange={(e) => setFormData({ ...formData, planned: e.target.checked })}
              className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="planned" className="text-sm text-gray-700">
              All tasks for this assignment are planned
            </label>
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
              {assignment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}