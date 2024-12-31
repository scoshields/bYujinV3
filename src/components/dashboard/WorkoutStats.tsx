import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { Activity, Dumbbell, Calendar, TrendingUp, Award } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

interface WorkoutStats {
  totalWorkouts: number;
  completedWorkouts: number;
  totalExercises: number;
  streakDays: number;
  personalRecords: {
    exercise: string;
    weight: number;
    date: string;
  }[];
  recentWorkouts: {
    id: string;
    name: string;
    completed: boolean;
    scheduled_date: string;
  }[];
}

export default function WorkoutStats() {
  const { session } = useAuthStore();
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    completedWorkouts: 0,
    totalExercises: 0,
    streakDays: 0,
    personalRecords: [],
    recentWorkouts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user.id) {
      loadStats();
    }
  }, [session?.user.id]);

  const loadStats = async () => {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      // Get workouts for the current week
      const { data: workouts } = await supabase
        .from('user_workouts')
        .select(`
          id,
          name,
          completed,
          scheduled_date,
          workout_exercises (
            exercise_sets (
              weight_lbs
            )
          )
        `)
        .eq('user_id', session.user.id)
        .gte('scheduled_date', startOfWeek.toISOString())
        .order('scheduled_date', { ascending: false });

      // Get all-time personal records
      const { data: records } = await supabase
        .from('exercise_sets')
        .select(`
          weight_lbs,
          created_at,
          workout_exercise:workout_exercises (
            exercise:exercises (
              name
            )
          )
        `)
        .order('weight_lbs', { ascending: false })
        .limit(5);

      // Calculate stats
      const weeklyStats = workouts?.reduce((acc, workout) => ({
        totalWorkouts: acc.totalWorkouts + 1,
        completedWorkouts: acc.completedWorkouts + (workout.completed ? 1 : 0),
        totalExercises: acc.totalExercises + (workout.workout_exercises?.length || 0)
      }), {
        totalWorkouts: 0,
        completedWorkouts: 0,
        totalExercises: 0
      });

      // Format personal records
      const personalRecords = records
        ?.filter(record => record.weight_lbs && record.workout_exercise?.exercise)
        .map(record => ({
          exercise: record.workout_exercise.exercise.name,
          weight: record.weight_lbs,
          date: record.created_at
        })) || [];

      setStats({
        ...weeklyStats,
        streakDays: calculateStreak(workouts || []),
        personalRecords,
        recentWorkouts: workouts?.slice(0, 5).map(w => ({
          id: w.id,
          name: w.name,
          completed: w.completed,
          scheduled_date: w.scheduled_date
        })) || []
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (workouts: any[]): number => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const hasCompletedWorkout = workouts.some(w => {
        const workoutDate = new Date(w.scheduled_date);
        return workoutDate.toDateString() === date.toDateString() && w.completed;
      });
      if (hasCompletedWorkout) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  if (loading) {
    return <div>Loading stats...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Weekly Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-sm font-medium">This Week</h3>
          <Activity className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-gray-900">{stats.completedWorkouts}/{stats.totalWorkouts}</div>
          <p className="text-gray-600">Workouts Completed</p>
        </div>
      </div>

      {/* Exercise Count */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Total Exercises</h3>
          <Dumbbell className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-gray-900">{stats.totalExercises}</div>
          <p className="text-gray-600">This Week</p>
        </div>
      </div>

      {/* Current Streak */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Current Streak</h3>
          <Calendar className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-gray-900">{stats.streakDays}</div>
          <p className="text-gray-600">Days</p>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-sm font-medium">Completion Rate</h3>
          <TrendingUp className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalWorkouts ? Math.round((stats.completedWorkouts / stats.totalWorkouts) * 100) : 0}%
          </div>
          <p className="text-gray-600">This Week</p>
        </div>
      </div>

      {/* Personal Records */}
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 font-medium">Personal Records</h3>
          <Award className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="space-y-4">
          {stats.personalRecords.map((record, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{record.exercise}</p>
                <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
              </div>
              <div className="text-lg font-bold text-indigo-600">
                {record.weight} lbs
              </div>
            </div>
          ))}
          {stats.personalRecords.length === 0 && (
            <p className="text-gray-500 text-center">No personal records yet</p>
          )}
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 font-medium">Recent Workouts</h3>
          <Dumbbell className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="space-y-4">
          {stats.recentWorkouts.map((workout) => (
            <div key={workout.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{workout.name}</p>
                <p className="text-sm text-gray-500">{formatDate(workout.scheduled_date)}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                workout.completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {workout.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          ))}
          {stats.recentWorkouts.length === 0 && (
            <p className="text-gray-500 text-center">No recent workouts</p>
          )}
        </div>
      </div>
    </div>
  );
}