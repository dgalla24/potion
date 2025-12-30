'use client';

import { useState } from 'react';
import { usePotion } from '@/hooks/usePotion';
import { Plus, Trash2, Clock } from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

export default function Classes() {
  const { classes, addClass, updateClass, deleteClass } = usePotion();
  const [newClassName, setNewClassName] = useState('');
  const [newClassEmoji, setNewClassEmoji] = useState('📚');
  const [newClassDays, setNewClassDays] = useState<number[]>([]);
  const [newClassStartTime, setNewClassStartTime] = useState('09:00');
  const [newClassEndTime, setNewClassEndTime] = useState('10:00');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingEmoji, setEditingEmoji] = useState('');
  const [editingDays, setEditingDays] = useState<number[]>([]);
  const [editingStartTime, setEditingStartTime] = useState('');
  const [editingEndTime, setEditingEndTime] = useState('');

  const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return (endMinutes - startMinutes) / 60;
  };

  const toggleDay = (day: number, currentDays: number[], setter: (days: number[]) => void) => {
    if (currentDays.includes(day)) {
      setter(currentDays.filter(d => d !== day));
    } else {
      setter([...currentDays, day].sort());
    }
  };

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;

    const duration = calculateDuration(newClassStartTime, newClassEndTime);

    await addClass({
      name: newClassName.trim(),
      emoji: newClassEmoji,
      daysOfWeek: newClassDays.length > 0 ? newClassDays : undefined,
      startTime: newClassDays.length > 0 ? newClassStartTime : undefined,
      endTime: newClassDays.length > 0 ? newClassEndTime : undefined,
      duration: newClassDays.length > 0 ? duration : undefined,
    });

    setNewClassName('');
    setNewClassEmoji('📚');
    setNewClassDays([]);
    setNewClassStartTime('09:00');
    setNewClassEndTime('10:00');
  };

  const handleStartEdit = (id: string, name: string, emoji: string, daysOfWeek?: number[], startTime?: string, endTime?: string) => {
    setEditingId(id);
    setEditingName(name);
    setEditingEmoji(emoji);
    setEditingDays(daysOfWeek || []);
    setEditingStartTime(startTime || '09:00');
    setEditingEndTime(endTime || '10:00');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;

    const duration = editingDays.length > 0 ? calculateDuration(editingStartTime, editingEndTime) : undefined;

    await updateClass(id, {
      name: editingName.trim(),
      emoji: editingEmoji,
      daysOfWeek: editingDays.length > 0 ? editingDays : undefined,
      startTime: editingDays.length > 0 ? editingStartTime : undefined,
      endTime: editingDays.length > 0 ? editingEndTime : undefined,
      duration,
    });

    setEditingId(null);
    setEditingName('');
    setEditingEmoji('');
    setEditingDays([]);
    setEditingStartTime('');
    setEditingEndTime('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingEmoji('');
    setEditingDays([]);
    setEditingStartTime('');
    setEditingEndTime('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, id?: string) => {
    if (e.key === 'Enter') {
      if (id) {
        handleSaveEdit(id);
      } else {
        handleAddClass();
      }
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formatSchedule = (daysOfWeek?: number[], startTime?: string, endTime?: string) => {
    if (!daysOfWeek || daysOfWeek.length === 0) return 'No schedule set';

    const dayNames = daysOfWeek
      .map(day => DAYS_OF_WEEK.find(d => d.value === day)?.label)
      .filter(Boolean)
      .join(', ');

    if (startTime && endTime) {
      return `${dayNames} • ${startTime} - ${endTime}`;
    }

    return dayNames;
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">Classes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your classes and schedules
          </p>
        </div>

        {/* Add New Class */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Add New Class</h2>

          <div className="space-y-4">
            {/* Name and Emoji */}
            <div className="flex gap-3">
              <input
                type="text"
                value={newClassEmoji}
                onChange={(e) => setNewClassEmoji(e.target.value)}
                placeholder="📚"
                className="w-16 text-2xl text-center px-3 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={2}
              />
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e)}
                placeholder="Class name (e.g., Computer Science 101)"
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            {/* Days of Week */}
            <div>
              <label className="block text-sm font-semibold mb-2">Days of Week</label>
              <div className="flex gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value, newClassDays, setNewClassDays)}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                      newClassDays.includes(day.value)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range */}
            {newClassDays.length > 0 && (
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newClassStartTime}
                    onChange={(e) => setNewClassStartTime(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">End Time</label>
                  <input
                    type="time"
                    value={newClassEndTime}
                    onChange={(e) => setNewClassEndTime(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">Duration</label>
                  <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      {calculateDuration(newClassStartTime, newClassEndTime).toFixed(1)}h
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Add Button */}
            <button
              onClick={handleAddClass}
              disabled={!newClassName.trim()}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Add Class
            </button>
          </div>
        </div>

        {/* Classes List */}
        <div className="space-y-3">
          {classes.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg">No classes yet</p>
              <p className="text-sm mt-1">Add your first class above</p>
            </div>
          ) : (
            classes.map((classItem) => (
              <div
                key={classItem.id}
                className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                {editingId === classItem.id ? (
                  <div className="space-y-4">
                    {/* Edit Name and Emoji */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={editingEmoji}
                        onChange={(e) => setEditingEmoji(e.target.value)}
                        className="w-16 text-2xl text-center px-3 py-2 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={2}
                      />
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, classItem.id)}
                        className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Edit Days */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Days of Week</label>
                      <div className="flex gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <button
                            key={day.value}
                            onClick={() => toggleDay(day.value, editingDays, setEditingDays)}
                            className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                              editingDays.includes(day.value)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Edit Time Range */}
                    {editingDays.length > 0 && (
                      <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold mb-2">Start Time</label>
                          <input
                            type="time"
                            value={editingStartTime}
                            onChange={(e) => setEditingStartTime(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-semibold mb-2">End Time</label>
                          <input
                            type="time"
                            value={editingEndTime}
                            onChange={(e) => setEditingEndTime(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-semibold mb-2">Duration</label>
                          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {calculateDuration(editingStartTime, editingEndTime).toFixed(1)}h
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Edit Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(classItem.id)}
                        className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => handleStartEdit(
                        classItem.id,
                        classItem.name,
                        classItem.emoji,
                        classItem.daysOfWeek,
                        classItem.startTime,
                        classItem.endTime
                      )}
                    >
                      <span className="text-2xl">{classItem.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{classItem.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatSchedule(classItem.daysOfWeek, classItem.startTime, classItem.endTime)}
                        </p>
                      </div>
                      {classItem.duration && (
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {classItem.duration.toFixed(1)}h
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteClass(classItem.id)}
                      className="ml-3 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete class"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
