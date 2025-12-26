'use client';

import { Check } from 'lucide-react';
import { usePotion } from '@/hooks/usePotion';
import { formatDate } from '@/lib/utils';

interface DailyTasksPopoutProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

export default function DailyTasksPopout({ isOpen, onClose, selectedDate }: DailyTasksPopoutProps) {
  const { dailyItems, getDailyInstancesForDate, updateDailyGoalInstance } = usePotion();

  // Get daily goal instances for the selected date
  const instances = getDailyInstancesForDate(selectedDate);

  const completedDailyItems = instances.filter(instance => instance.completed).length;
  const totalHours = instances.reduce((sum, instance) => {
    const dailyItem = dailyItems.find(item => item.id === instance.dailyItemId);
    return sum + (dailyItem?.hours || 0);
  }, 0);

  const handleToggleDailyItem = async (instanceId: string, currentStatus: boolean) => {
    await updateDailyGoalInstance(instanceId, { completed: !currentStatus });
  };

  const getHoursColor = (hours: number) => {
    if (hours <= 1) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (hours <= 3) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    if (hours <= 5) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    if (hours <= 8) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  };

  const dateFormatted = formatDate(selectedDate);

  return (
    <div className={`h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isOpen ? 'w-96 overflow-y-auto' : 'w-0 overflow-hidden'
    }`}>
        {isOpen && (
          <>
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="p-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daily Goals</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{dateFormatted}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                    {completedDailyItems}/{instances.length} completed
                  </div>
                  <div className="px-2 py-1 bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                    {totalHours}h total
                  </div>
                  {completedDailyItems === instances.length && instances.length > 0 && (
                    <div className="px-2 py-1 bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300 rounded-md text-xs font-medium">
                      All done!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="space-y-2">
                {instances.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No daily goals for this day</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">Add items in the Daily tab</p>
                  </div>
                ) : (
                  instances.map((instance) => {
                    const dailyItem = dailyItems.find(item => item.id === instance.dailyItemId);
                    if (!dailyItem) return null;

                    return (
                      <div
                        key={instance.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <button
                          onClick={() => handleToggleDailyItem(instance.id, instance.completed)}
                          className={`flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                            instance.completed
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                          }`}
                        >
                          {instance.completed && (
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          )}
                        </button>
                        <span className={`flex-1 text-sm ${
                          instance.completed
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {dailyItem.title}
                        </span>
                        {dailyItem.hours > 0 && (
                          <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getHoursColor(dailyItem.hours)}`}>
                            {dailyItem.hours}h
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
  );
}
