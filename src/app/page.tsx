"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');
      } else {
        alert(data.error || 'Failed to join waitlist. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">GoalAI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/demo" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Try Demo
              </Link>
              <Link 
                href="#early-access" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Early Access
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Turn Your <span className="text-blue-600">Goals</span> Into
            <br />
            <span className="text-blue-600">Actionable Plans</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Stop dreaming, start doing. GoalAI breaks down your biggest aspirations into 
            manageable daily tasks, short-term milestones, and long-term strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/demo" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try the Demo
            </Link>
            <Link 
              href="#early-access" 
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Get Early Access
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              The Problem with Goal Setting
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Most people know what they want to achieve, but they don&apos;t know how to get there.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">😵</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Overwhelming</h3>
              <p className="text-gray-600">
                Big goals feel impossible when you don&apos;t know where to start
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Vague Plans</h3>
              <p className="text-gray-600">
                &quot;Work harder&quot; isn&apos;t a plan. You need specific, actionable steps
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Time Wasted</h3>
              <p className="text-gray-600">
                Hours spent planning instead of doing what actually matters
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See GoalAI in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch how GoalAI transforms &quot;I want to learn Spanish&quot; into a complete action plan
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
                             <div className="text-green-400 font-mono text-sm">
                 <div className="mb-2">User: &quot;I want to learn Spanish in 6 months&quot;</div>
                 <div className="text-blue-400">GoalAI: Generating your personalized plan...</div>
               </div>
            </div>
            
            <div className="space-y-6">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-green-900 mb-2">Long-term Goals</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Achieve B1 conversational fluency</li>
                  <li>• Complete 3 Spanish courses</li>
                  <li>• Have a 30-minute conversation with a native speaker</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-900 mb-2">Short-term Goals</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Master basic greetings and introductions</li>
                  <li>• Learn 100 essential vocabulary words</li>
                  <li>• Complete first course module</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-purple-900 mb-2">Daily Tasks</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Practice for 30 minutes with Duolingo</li>
                  <li>• Listen to 1 Spanish podcast episode</li>
                  <li>• Review 10 new vocabulary words</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Link 
                href="/demo" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Try It Yourself →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Early Access Section */}
      <section id="early-access" className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Get Early Access
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Be among the first to experience GoalAI. We&apos;re launching soon and you&apos;ll get:
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-semibold text-white mb-2">Early Access</h3>
              <p className="text-blue-100 text-sm">
                Be the first to try new features
              </p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl mb-2">💬</div>
              <h3 className="font-semibold text-white mb-2">Direct Feedback</h3>
              <p className="text-blue-100 text-sm">
                Help shape the product roadmap
              </p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6">
              <div className="text-2xl mb-2">🎁</div>
              <h3 className="font-semibold text-white mb-2">Special Pricing</h3>
              <p className="text-blue-100 text-sm">
                Exclusive discounts for early users
              </p>
            </div>
          </div>
          
          {!isSubmitted ? (
            <form onSubmit={handleEmailSignup} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white/10 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-2xl mb-2">🎉</div>
                              <h3 className="font-semibold text-white mb-2">You&apos;re on the list!</h3>
              <p className="text-blue-100">
                We&apos;ll notify you as soon as GoalAI is ready.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">GoalAI</h3>
              <p className="text-gray-400">
                Turn your goals into actionable plans with AI-powered planning.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="#early-access" className="hover:text-white transition-colors">Early Access</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GoalAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
