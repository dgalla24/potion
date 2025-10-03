'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [localData, setLocalData] = useState<any>({});

  useEffect(() => {
    // Read all localStorage data
    const data = {
      classes: JSON.parse(localStorage.getItem('classes') || '[]'),
      assignments: JSON.parse(localStorage.getItem('assignments') || '[]'),
      tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
      exams: JSON.parse(localStorage.getItem('exams') || '[]'),
      events: JSON.parse(localStorage.getItem('events') || '[]'),
      dailyItems: JSON.parse(localStorage.getItem('dailyItems') || '[]'),
    };
    setLocalData(data);
    console.log('LocalStorage data:', data);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">LocalStorage Debug</h1>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Classes ({localData.classes?.length || 0})</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(localData.classes, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Assignments ({localData.assignments?.length || 0})</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(localData.assignments, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Tasks ({localData.tasks?.length || 0})</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(localData.tasks, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Exams ({localData.exams?.length || 0})</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(localData.exams, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Events ({localData.events?.length || 0})</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(localData.events, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Daily Items ({localData.dailyItems?.length || 0})</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(localData.dailyItems, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-8">
          <a href="/migrate" className="text-blue-400 hover:underline">
            Go to Migration Page →
          </a>
        </div>
      </div>
    </div>
  );
}
