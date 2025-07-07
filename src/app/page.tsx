"use client";

import Image from "next/image";
import React, { useState, useRef } from 'react';

interface GoalPlan {
  longTermGoals?: string[];
  shortTermGoals?: string[];
  dailyTasks?: string[];
  timeline?: string;
  explanation?: string;
}

interface Message {
  role: string;
  content: string;
  goalPlan?: GoalPlan | null;
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! What goal would you like to plan today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const parseGoalPlan = (content: string): GoalPlan | null => {
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      console.log('Failed to parse goal plan:', error);
      return null;
    }
  };

  const renderGoalPlan = (goalPlan: GoalPlan) => {
    return (
      <div className="bg-blue-50 p-4 rounded-lg border">
        {goalPlan.explanation && (
          <div className="mb-3">
            <h4 className="font-semibold text-blue-800">Plan Overview:</h4>
            <p className="text-blue-700">{goalPlan.explanation}</p>
          </div>
        )}
        
        {goalPlan.longTermGoals && goalPlan.longTermGoals.length > 0 && (
          <div className="mb-3">
            <h4 className="font-semibold text-green-800">Long-term Goals:</h4>
            <ul className="list-disc list-inside text-green-700">
              {goalPlan.longTermGoals.map((goal, index) => (
                <li key={index}>{goal}</li>
              ))}
            </ul>
          </div>
        )}

        {goalPlan.shortTermGoals && goalPlan.shortTermGoals.length > 0 && (
          <div className="mb-3">
            <h4 className="font-semibold text-orange-800">Short-term Goals:</h4>
            <ul className="list-disc list-inside text-orange-700">
              {goalPlan.shortTermGoals.map((goal, index) => (
                <li key={index}>{goal}</li>
              ))}
            </ul>
          </div>
        )}

        {goalPlan.dailyTasks && goalPlan.dailyTasks.length > 0 && (
          <div className="mb-3">
            <h4 className="font-semibold text-purple-800">Daily Tasks:</h4>
            <ul className="list-disc list-inside text-purple-700">
              {goalPlan.dailyTasks.map((task, index) => (
                <li key={index}>{task}</li>
              ))}
            </ul>
          </div>
        )}

        {goalPlan.timeline && (
          <div>
            <h4 className="font-semibold text-red-800">Timeline:</h4>
            <p className="text-red-700">{goalPlan.timeline}</p>
          </div>
        )}
      </div>
    );
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
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
      
      // Try to parse as goal plan
      const goalPlan = parseGoalPlan(aiMessage);
      
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: aiMessage,
        goalPlan: goalPlan
      }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error contacting AI.' }]);
    }
    setLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto border rounded shadow bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={m.role === 'user' ? 'bg-blue-100 px-2 py-1 rounded' : 'bg-gray-100 px-2 py-1 rounded'}>
              {m.content}
            </span>
            {/* Render structured goal plan if available */}
            {m.role === 'assistant' && m.goalPlan && (
              <div className="mt-2">
                {renderGoalPlan(m.goalPlan)}
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex p-2 border-t">
        <input
          className="flex-1 border rounded px-2 py-1 mr-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your goal or question..."
          disabled={loading}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded" disabled={loading || !input.trim()}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Chat />
    </main>
  );
}
