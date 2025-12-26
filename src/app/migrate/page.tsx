'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabaseStorage } from '@/lib/supabase-storage';

// Helper to parse dates that might be strings or Date objects
const parseDate = (date: any): Date => {
  if (date instanceof Date) return date;
  return new Date(date);
};

export default function MigratePage() {
  const { user, loading } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const migrateData = async () => {
    if (!user) {
      setError('You must be logged in to migrate data');
      return;
    }

    setMigrating(true);
    setStatus('Starting migration...');
    setError('');

    try {
      // Get data from localStorage (with potion_ prefix)
      const localClasses = JSON.parse(localStorage.getItem('potion_classes') || '[]');
      const localAssignments = JSON.parse(localStorage.getItem('potion_assignments') || '[]');
      const localTasks = JSON.parse(localStorage.getItem('potion_tasks') || '[]');
      const localExams = JSON.parse(localStorage.getItem('potion_exams') || '[]');
      const localEvents = JSON.parse(localStorage.getItem('potion_events') || '[]');
      const localDailyItems = JSON.parse(localStorage.getItem('potion_dailyItems') || '[]');

      setStatus(`Found: ${localClasses.length} classes, ${localAssignments.length} assignments, ${localTasks.length} tasks, ${localExams.length} exams, ${localEvents.length} events, ${localDailyItems.length} daily items`);

      // Migrate classes first (since other items reference them)
      const classIdMap = new Map();
      for (const localClass of localClasses) {
        setStatus(`Migrating class: ${localClass.name}`);
        const newClass = await supabaseStorage.classes.add({
          name: localClass.name,
          emoji: localClass.emoji || '',
        });
        classIdMap.set(localClass.id, newClass.id);
      }

      // Migrate assignments
      const assignmentIdMap = new Map();
      for (const assignment of localAssignments) {
        setStatus(`Migrating assignment: ${assignment.title}`);
        try {
          const newAssignment = await supabaseStorage.assignments.add({
            title: assignment.title,
            description: assignment.description || '',
            dueDate: parseDate(assignment.dueDate),
            classId: assignment.classId ? classIdMap.get(assignment.classId) : undefined,
            status: assignment.status,
            planned: assignment.planned || false,
          });
          assignmentIdMap.set(assignment.id, newAssignment.id);
          console.log('Migrated assignment:', assignment.title);
        } catch (err) {
          console.error('Error migrating assignment:', assignment.title, err);
          throw err;
        }
      }

      // Migrate exams
      const examIdMap = new Map();
      for (const exam of localExams) {
        setStatus(`Migrating exam: ${exam.title}`);
        const newExam = await supabaseStorage.exams.add({
          title: exam.title,
          description: exam.description || '',
          dueDate: new Date(exam.dueDate),
          classId: exam.classId ? classIdMap.get(exam.classId) : undefined,
          status: exam.status,
          planned: exam.planned || false,
        });
        examIdMap.set(exam.id, newExam.id);
      }

      // Migrate tasks
      for (const task of localTasks) {
        setStatus(`Migrating task: ${task.title}`);
        await supabaseStorage.tasks.add({
          title: task.title,
          description: task.description || '',
          scheduledDate: new Date(task.scheduledDate),
          hours: task.hours || 1,
          classId: task.classId ? classIdMap.get(task.classId) : undefined,
          assignmentId: task.assignmentId ? assignmentIdMap.get(task.assignmentId) : undefined,
          examId: task.examId ? examIdMap.get(task.examId) : undefined,
          status: task.status,
        });
      }

      // Migrate events
      for (const event of localEvents) {
        setStatus(`Migrating event: ${event.title}`);
        await supabaseStorage.events.add({
          title: event.title,
          description: event.description || '',
          scheduledDate: new Date(event.scheduledDate),
          hours: event.hours || 1,
          classId: event.classId ? classIdMap.get(event.classId) : undefined,
          assignmentId: event.assignmentId ? assignmentIdMap.get(event.assignmentId) : undefined,
          examId: event.examId ? examIdMap.get(event.examId) : undefined,
          status: event.status,
        });
      }

      // Migrate daily items (now just templates, instances created automatically)
      for (const item of localDailyItems) {
        setStatus(`Migrating daily item: ${item.title}`);
        await supabaseStorage.dailyItems.add({
          title: item.title,
          hours: item.hours || 0,
        });
      }

      setStatus('Migration complete! You can now close this page and refresh the app.');
      setMigrating(false);
    } catch (err: any) {
      setError(`Migration failed: ${err.message}`);
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Please log in first</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Migrate Local Data to Supabase</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <p className="mb-4">Logged in as: <strong>{user.email}</strong></p>
          <p className="mb-4">This will copy all your local data (from localStorage) to the Supabase database.</p>
          <p className="text-yellow-400 mb-4">⚠️ Warning: This will create duplicate data if you run it multiple times!</p>
        </div>

        {status && (
          <div className="bg-blue-900/50 border border-blue-500 rounded-lg p-4 mb-4">
            <p className="text-blue-200">{status}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <button
          onClick={migrateData}
          disabled={migrating}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          {migrating ? 'Migrating...' : 'Start Migration'}
        </button>

        <p className="mt-4 text-sm text-gray-400">
          After migration completes, go back to the <a href="/" className="text-blue-400 hover:underline">home page</a>
        </p>
      </div>
    </div>
  );
}
