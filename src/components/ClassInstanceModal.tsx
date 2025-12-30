'use client';

import { X, Check, Trash2 } from 'lucide-react';
import { ClassInstance, Class } from '@/types';

interface ClassInstanceModalProps {
  instance: ClassInstance;
  classInfo: Class;
  onClose: () => void;
  onToggleComplete: (instanceId: string, currentStatus: boolean) => void;
  onDelete?: (instanceId: string) => void;
}

export default function ClassInstanceModal({
  instance,
  classInfo,
  onClose,
  onToggleComplete,
  onDelete,
}: ClassInstanceModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{classInfo.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {classInfo.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(instance.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Class Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Time
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {classInfo.startTime} - {classInfo.endTime}
            </span>
          </div>

          {classInfo.duration && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Duration
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {classInfo.duration} hours
              </span>
            </div>
          )}
        </div>

        {/* Attendance Toggle */}
        <button
          onClick={() => onToggleComplete(instance.id, instance.completed)}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            instance.completed
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Check className={`w-5 h-5 ${instance.completed ? 'opacity-100' : 'opacity-50'}`} />
          {instance.completed ? 'Attended' : 'Mark as Attended'}
        </button>

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={() => {
              if (confirm('Delete this class session? This cannot be undone.')) {
                onDelete(instance.id);
                onClose();
              }
            }}
            className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400"
          >
            <Trash2 className="w-5 h-5" />
            Delete Session
          </button>
        )}
      </div>
    </div>
  );
}
