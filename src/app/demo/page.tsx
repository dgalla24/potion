"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface TaskItem {
  text: string;
  completed: boolean;
  id: string;
  date?: string; // ISO date string
}

interface CalendarTask {
  id: string;
  text: string;
  completed: boolean;
  date: string; // ISO date string
  type: 'daily' | 'weekly' | 'milestone';
  status: 'not-started' | 'in-progress' | 'completed';
}

interface GoalPlanWithCalendar {
  longTermGoals?: TaskItem[];
  shortTermGoals?: TaskItem[];
  dailyTasks?: TaskItem[];
  timeline?: string;
  explanation?: string;
  calendarTasks?: CalendarTask[];
  startDate?: string;
  endDate?: string;
  totalDuration?: number; // in days
}

interface Message {
  role: string;
  content: string;
  goalPlan?: GoalPlanWithCalendar | null;
  timestamp: number;
}

interface UsageStats {
  queriesToday: number;
  lastQueryDate: string;
  totalQueries: number;
}

function Calendar({ tasks, currentDate, onDateChange, onTaskClick }: { 
  tasks: CalendarTask[], 
  currentDate: Date, 
  onDateChange: (date: Date) => void,
  onTaskClick: (task: CalendarTask) => void
}) {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.date === dateStr);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    onDateChange(newDate);
  };

  const formatDisplayDate = (date: Date) => {
    if (viewMode === 'month') {
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  const days = viewMode === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ←
          </button>
          <h3 className="text-xl font-semibold text-gray-900">{formatDisplayDate(currentDate)}</h3>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            →
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              viewMode === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              viewMode === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="p-2 min-h-[80px] bg-gray-50"></div>;
          }
          
          const dayTasks = getTasksForDate(day);
          const isToday = formatDate(day) === formatDate(new Date());
          
          return (
            <div 
              key={formatDate(day)} 
              className={`p-2 min-h-[80px] border border-gray-200 ${
                isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayTasks.map(task => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'completed': return 'bg-green-100 text-green-800';
                      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
                      case 'not-started': 
                      default: 
                        return task.type === 'milestone' 
                          ? 'bg-purple-100 text-purple-800' 
                          : task.type === 'weekly'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800';
                    }
                  };

                  const getStatusIndicator = (status: string) => {
                    switch (status) {
                      case 'completed': return '✓';
                      case 'in-progress': return '⟳';
                      case 'not-started': 
                      default: return '○';
                    }
                  };

                  return (
                    <div 
                      key={task.id}
                      className={`text-xs p-1 rounded cursor-pointer transition-colors hover:opacity-80 ${getStatusColor(task.status)}`}
                      onClick={() => onTaskClick(task)}
                      title={`${task.text} (${task.status.replace('-', ' ')})`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={task.status === 'completed' ? 'line-through' : ''}>
                          {task.text.length > 15 ? task.text.substring(0, 15) + '...' : task.text}
                        </span>
                        <span className="ml-1 text-xs font-bold">
                          {getStatusIndicator(task.status)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskModal({ task, isOpen, onClose, onUpdateStatus }: {
  task: CalendarTask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (taskId: string, status: 'not-started' | 'in-progress' | 'completed') => void;
}) {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {task.text}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {new Date(task.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg capitalize">
              {task.type.replace('-', ' ')}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={task.status}
              onChange={(e) => onUpdateStatus(task.id, e.target.value as 'not-started' | 'in-progress' | 'completed')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatSidebar({ messages, input, setInput, loading, usageStats, onSendMessage, onClearHistory }: {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  loading: boolean;
  usageStats: UsageStats;
  onSendMessage: (e: React.FormEvent) => void;
  onClearHistory: () => void;
}) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold text-gray-900">GoalAI Assistant</h2>
                 <p className="text-sm text-gray-600">Tell me your goal and I&apos;ll create a plan</p>
        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-gray-500">
            Queries: {usageStats.queriesToday}/5
          </div>
          <button 
            onClick={onClearHistory}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[280px] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'} px-3 py-2 rounded-lg text-sm`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={onSendMessage} className="flex space-x-2">
          <input
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="What's your goal?"
            disabled={loading || usageStats.queriesToday >= 5}
          />
          <button 
            type="submit" 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              loading || usageStats.queriesToday >= 5 || !input.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
            disabled={loading || usageStats.queriesToday >= 5 || !input.trim()}
          >
            {loading ? '...' : 'Send'}
          </button>
        </form>
        {usageStats.queriesToday >= 5 && (
          <p className="text-red-600 text-xs mt-2 text-center">
            Daily limit reached
          </p>
        )}
      </div>
    </div>
  );
}

function GoalPlanner() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usageStats, setUsageStats] = useState<UsageStats>({ queriesToday: 0, lastQueryDate: '', totalQueries: 0 });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allCalendarTasks, setAllCalendarTasks] = useState<CalendarTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load messages and usage stats from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('goalAI-messages');
    const savedUsage = localStorage.getItem('goalAI-usage');
    const savedTasks = localStorage.getItem('goalAI-calendar-tasks');
    
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (error) {
        console.error('Failed to load messages from localStorage:', error);
        setMessages([{ 
          role: 'assistant', 
          content: 'Hi! What goal would you like to plan today? I\'ll create a personalized calendar to help you achieve it.',
          timestamp: Date.now()
        }]);
      }
    } else {
      setMessages([{ 
        role: 'assistant', 
        content: 'Hi! What goal would you like to plan today? I\'ll create a personalized calendar to help you achieve it.',
        timestamp: Date.now()
      }]);
    }

    if (savedUsage) {
      try {
        const parsed = JSON.parse(savedUsage);
        setUsageStats(parsed);
      } catch (error) {
        console.error('Failed to load usage stats:', error);
      }
    }

    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setAllCalendarTasks(parsed);
      } catch (error) {
        console.error('Failed to load calendar tasks:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('goalAI-messages', JSON.stringify(messages));
  }, [messages]);

  // Save usage stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('goalAI-usage', JSON.stringify(usageStats));
  }, [usageStats]);

  // Save calendar tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('goalAI-calendar-tasks', JSON.stringify(allCalendarTasks));
  }, [allCalendarTasks]);

  const updateUsageStats = () => {
    const today = new Date().toDateString();
    const newStats = { ...usageStats };
    
    if (newStats.lastQueryDate !== today) {
      newStats.queriesToday = 0;
      newStats.lastQueryDate = today;
    }
    
    newStats.queriesToday += 1;
    newStats.totalQueries += 1;
    
    setUsageStats(newStats);
  };

  const parseGoalPlan = (content: string): GoalPlanWithCalendar | null => {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed goal plan:', parsed);
        
        const goalPlanWithCalendar: GoalPlanWithCalendar = {
          ...parsed,
          longTermGoals: parsed.longTermGoals ? parsed.longTermGoals.map((item: string, index: number) => ({
            text: item,
            completed: false,
            id: `${Date.now()}-${index}`
          })) : undefined,
          shortTermGoals: parsed.shortTermGoals ? parsed.shortTermGoals.map((item: string, index: number) => ({
            text: item,
            completed: false,
            id: `${Date.now()}-${index}`
          })) : undefined,
          dailyTasks: parsed.dailyTasks ? parsed.dailyTasks.map((item: string, index: number) => ({
            text: item,
            completed: false,
            id: `${Date.now()}-${index}`
          })) : undefined,
          calendarTasks: parsed.calendarTasks ? parsed.calendarTasks.map((task: { id: string; text: string; completed: boolean; date: string; type: string; status?: string }) => ({
            ...task,
            status: task.status || 'not-started'
          })) : [],
          startDate: parsed.startDate,
          endDate: parsed.endDate,
          totalDuration: parsed.totalDuration,
        };
        
        console.log('Calendar tasks found:', goalPlanWithCalendar.calendarTasks?.length || 0);
        return goalPlanWithCalendar;
      }
      return null;
    } catch (error) {
      console.log('Failed to parse goal plan:', error);
      return null;
    }
  };



  const handleTaskClick = (task: CalendarTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const updateTaskStatus = (taskId: string, status: 'not-started' | 'in-progress' | 'completed') => {
    setAllCalendarTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status, completed: status === 'completed' } : task
      )
    );
    if (selectedTask) {
      setSelectedTask({ ...selectedTask, status, completed: status === 'completed' });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Check usage limits
    if (usageStats.queriesToday >= 5) {
      alert('Daily limit reached (5 queries). Please try again tomorrow!');
      return;
    }

    const newMessages = [...messages, { role: 'user', content: input, timestamp: Date.now() }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      console.log('API response:', data);
      const aiMessage = data.choices?.[0]?.message?.content || 'No response.';
      
      const goalPlan = parseGoalPlan(aiMessage);
      
      // Add new calendar tasks to the global list
      if (goalPlan && goalPlan.calendarTasks) {
        console.log('Adding calendar tasks:', goalPlan.calendarTasks);
        setAllCalendarTasks(prevTasks => {
          const existingIds = new Set(prevTasks.map(task => task.id));
          const newTasks = goalPlan.calendarTasks!.filter(task => !existingIds.has(task.id));
          console.log('New tasks to add:', newTasks);
          const updatedTasks = [...prevTasks, ...newTasks];
          console.log('Total tasks after update:', updatedTasks.length);
          return updatedTasks;
        });
      }
      
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: aiMessage,
        goalPlan: goalPlan,
        timestamp: Date.now()
      }]);
      
      updateUsageStats();
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Error contacting AI.',
        timestamp: Date.now()
      }]);
    }
    setLoading(false);
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history and calendar tasks?')) {
      setMessages([{ 
        role: 'assistant', 
        content: 'Hi! What goal would you like to plan today? I\'ll create a personalized calendar to help you achieve it.',
        timestamp: Date.now()
      }]);
      setAllCalendarTasks([]);
      localStorage.removeItem('goalAI-messages');
      localStorage.removeItem('goalAI-calendar-tasks');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Calendar Area */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">GoalAI Planner</h1>
            <p className="text-gray-600">Your personalized goal calendar</p>
            <p className="text-sm text-gray-500">Tasks in calendar: {allCalendarTasks.length}</p>
          </div>
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
        
        <Calendar 
          tasks={allCalendarTasks}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onTaskClick={handleTaskClick}
        />
        
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={closeModal}
          onUpdateStatus={updateTaskStatus}
        />
      </div>

      {/* AI Chat Sidebar */}
      <div className="w-80">
        <ChatSidebar
          messages={messages}
          input={input}
          setInput={setInput}
          loading={loading}
          usageStats={usageStats}
          onSendMessage={sendMessage}
          onClearHistory={clearHistory}
        />
      </div>
    </div>
  );
}

export default function Demo() {
  return (
    <main className="h-screen">
      <GoalPlanner />
    </main>
  );
} 