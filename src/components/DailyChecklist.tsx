'use client';

import { useState } from 'react';
import { usePotion } from '@/hooks/usePotion';
import { Plus, Trash2, Check } from 'lucide-react';

export default function DailyChecklist() {
  const {
    dailyItems,
    addDailyItem,
    updateDailyItem,
    deleteDailyItem,
    getDailyInstancesForDate,
    updateDailyGoalInstance
  } = usePotion();
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemHours, setNewItemHours] = useState('0');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingHours, setEditingHours] = useState('0');

  const today = new Date();
  const todayInstances = getDailyInstancesForDate(today);

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;

    await addDailyItem({
      title: newItemTitle.trim(),
      hours: parseFloat(newItemHours) || 0,
    });
    setNewItemTitle('');
    setNewItemHours('0');
  };

  const handleToggleComplete = async (dailyItemId: string) => {
    // Find today's instance for this daily item
    const instance = todayInstances.find(i => i.dailyItemId === dailyItemId);
    if (instance) {
      await updateDailyGoalInstance(instance.id, { completed: !instance.completed });
    }
  };

  const handleStartEdit = (id: string, title: string, hours: number) => {
    setEditingId(id);
    setEditingTitle(title);
    setEditingHours(hours.toString());
  };

  const handleSaveEdit = async (id: string) => {
    if (editingTitle.trim()) {
      await updateDailyItem(id, {
        title: editingTitle.trim(),
        hours: parseFloat(editingHours) || 0
      });
    }
    setEditingId(null);
    setEditingTitle('');
    setEditingHours('0');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
    setEditingHours('0');
  };

  const getHoursColor = (hours: number) => {
    if (hours <= 1) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (hours <= 3) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    if (hours <= 5) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (hours <= 8) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  };

  const handleKeyDown = (e: React.KeyboardEvent, id?: string) => {
    if (e.key === 'Enter') {
      if (id) {
        handleSaveEdit(id);
      } else {
        handleAddItem();
      }
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const completedCount = todayInstances.filter(instance => instance.completed).length;
  const totalCount = todayInstances.length;

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">Daily Checklist</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your recurring daily tasks • Resets every day
          </p>
          {totalCount > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {completedCount}/{totalCount}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Add new item */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e)}
                placeholder="Add a new daily task..."
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <input
                type="number"
                value={newItemHours}
                onChange={(e) => setNewItemHours(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e)}
                placeholder="Hours"
                min="0"
                step="0.5"
                className="w-24 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <button
                onClick={handleAddItem}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Items list */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {dailyItems.length === 0 ? (
              <div className="p-12 text-center text-gray-400 dark:text-gray-500">
                <p className="text-lg">No daily tasks yet</p>
                <p className="text-sm mt-2">Add your first recurring task above</p>
              </div>
            ) : (
              dailyItems.map((item) => {
                const instance = todayInstances.find(i => i.dailyItemId === item.id);
                const isCompleted = instance?.completed || false;

                return (
                  <div
                    key={item.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleComplete(item.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                          isCompleted
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                        }`}
                      >
                        {isCompleted && (
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        )}
                      </button>

                    {/* Title and Hours */}
                    {editingId === item.id ? (
                      <>
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, item.id)}
                          onBlur={() => handleSaveEdit(item.id)}
                          autoFocus
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-gray-900 dark:text-gray-100"
                        />
                        <input
                          type="number"
                          value={editingHours}
                          onChange={(e) => setEditingHours(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, item.id)}
                          onBlur={() => handleSaveEdit(item.id)}
                          min="0"
                          step="0.5"
                          className="w-20 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-gray-900 dark:text-gray-100"
                        />
                      </>
                    ) : (
                      <>
                        <div
                          onClick={() => handleStartEdit(item.id, item.title, item.hours)}
                          className={`flex-1 text-lg cursor-pointer ${
                            isCompleted
                              ? 'line-through text-gray-400 dark:text-gray-500'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {item.title}
                        </div>
                        {item.hours > 0 && (
                          <div className={`px-2 py-1 rounded-full text-sm font-medium ${getHoursColor(item.hours)}`}>
                            {item.hours}h
                          </div>
                        )}
                      </>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => deleteDailyItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
          💡 All items will automatically uncheck at the start of each new day
        </div>
      </div>
    </div>
  );
}
