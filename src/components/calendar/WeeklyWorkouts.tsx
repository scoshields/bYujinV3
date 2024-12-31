import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, Plus, Star, Trash2 } from 'lucide-react';
import { formatDate, getWeekRange } from '../../utils/dateUtils';
import { WorkoutWithExercises } from '../../types/workout';

interface WeeklyWorkoutsProps {
  workouts: WorkoutWithExercises[];
  currentWeekStart: Date;
  onWeekChange: (date: Date) => void;
  onWorkoutSelect: (workoutId: string) => void;
  onDelete: (workoutId: string) => void;
  onCopyWeek: () => void;
  onRename: (workoutId: string, name: string) => void;
  onToggleFavorite: (workoutId: string) => void;
  onAddWorkout?: () => void;
}

export default function WeeklyWorkouts({
  workouts,
  currentWeekStart,
  onWeekChange,
  onWorkoutSelect,
  onDelete,
  onCopyWeek,
  onRename,
  onToggleFavorite,
  onAddWorkout
}: WeeklyWorkoutsProps) {
  const { startDate, endDate } = getWeekRange(currentWeekStart);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    onWeekChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    onWeekChange(newDate);
  };

  // Filter workouts for current week
  const weeklyWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.scheduled_date);
    return workoutDate >= startDate && workoutDate <= endDate;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={handlePreviousWeek}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-sm sm:text-lg font-semibold">
            Week of {formatDate(startDate, { month: 'long', day: 'numeric' })}
          </h2>
          <button
            onClick={handleNextWeek}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {onAddWorkout && (
            <button
              onClick={onAddWorkout}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-green-600 hover:text-green-800 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Workout</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
          <button
            onClick={onCopyWeek}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy to Next Week</span>
            <span className="sm:hidden">Copy</span>
          </button>
        </div>
      </div>
      
      <div className="p-2 sm:p-4 grid gap-2 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {weeklyWorkouts.map((workout) => (
          <div
            key={workout.id} 
            onClick={() => onWorkoutSelect(workout.id)}
            className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer p-3 sm:p-4"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingWorkoutId(workout.id);
              setNewName(workout.custom_name || workout.name);
            }}
          >
            <div className="flex items-center justify-between mb-2">
              {editingWorkoutId === workout.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onRename(workout.id, newName);
                    setEditingWorkoutId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 mr-2"
                >
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                    autoFocus
                    onBlur={() => setEditingWorkoutId(null)}
                  />
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(workout.id);
                    }}
                    className={`text-yellow-500 hover:text-yellow-600 ${
                      workout.is_favorite ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <h3 className="font-medium">
                    {workout.custom_name || workout.name}
                  </h3>
                </div>
              )}
              <span className={`px-2 py-1 text-xs rounded-full ${
                workout.completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {workout.completed ? 'Done' : 'Todo'}
              </span>
            </div>
            
            {workout.workout_exercises && (
              <div className="text-sm text-gray-600">
                {workout.workout_exercises.length} exercises
              </div>
            )}
            
            <div className="mt-2 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(workout.id);
                }}
                className="text-red-600 hover:text-red-800 p-1 -m-1"
              >
                <span className="sr-only">Delete workout</span>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}