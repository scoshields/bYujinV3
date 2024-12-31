import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, History } from 'lucide-react';
import WorkoutStats from '../components/dashboard/WorkoutStats';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Welcome to Yujin
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Generate personalized workouts based on your preferences and track your progress
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Dashboard</h2>
        <WorkoutStats />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Link
          to="/generator"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Dumbbell className="h-8 w-8 text-indigo-600" />
            <h2 className="text-2xl font-semibold">Create Workout</h2>
          </div>
          <p className="text-gray-600">
            Create a new personalized workout based on your preferences and goals
          </p>
        </Link>

        <Link
          to="/history"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4 mb-4">
            <History className="h-8 w-8 text-indigo-600" />
            <h2 className="text-2xl font-semibold">View Workouts</h2>
          </div>
          <p className="text-gray-600">
            View and manage your weekly workout schedule
          </p>
        </Link>
      </div>
    </div>
  );
}