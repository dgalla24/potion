'use client';

import { useState } from 'react';
import { usePotion } from '@/hooks/usePotion';
import { Plus, Trash2, Check } from 'lucide-react';

export default function DailyChecklist() {
  const { dailyItems, addDailyItem, updateDailyItem, deleteDailyItem } = usePotion();
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;

    await addDailyItem({
      title: newItemTitle.trim(),
      completed: false,
      lastResetDate: today,
    });
    setNewItemTitle('');
  };

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    await updateDailyItem(id, { completed: !currentStatus });
  };

  const handleStartEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
  };

  const handleSaveEdit = async (id: string) => {
    if (editingTitle.trim()) {
      await updateDailyItem(id, { title: editingTitle.trim() });
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
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

  const completedCount = dailyItems.filter(item => item.completed).length;
  const totalCount = dailyItems.length;

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
              dailyItems.map((item) => (
                <div
                  key={item.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(item.id, item.completed)}
                      className={`flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                        item.completed
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                      }`}
                    >
                      {item.completed && (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      )}
                    </button>

                    {/* Title */}
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, item.id)}
                        onBlur={() => handleSaveEdit(item.id)}
                        autoFocus
                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-gray-900 dark:text-gray-100"
                      />
                    ) : (
                      <div
                        onClick={() => handleStartEdit(item.id, item.title)}
                        className={`flex-1 text-lg cursor-pointer ${
                          item.completed
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {item.title}
                      </div>
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
              ))
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
