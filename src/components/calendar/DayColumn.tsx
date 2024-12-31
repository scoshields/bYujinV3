import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { WorkoutWithExercises } from '../../types/workout';

interface DayColumnProps {
  date: Date;
  workouts: WorkoutWithExercises[];
  onWorkoutSelect: (workoutId: string) => void;
  onDelete: (workoutId: string) => void;
}

export default function DayColumn({
  date,
  workouts,
  onWorkoutSelect,
  onDelete
}: DayColumnProps) {
  const isToday = new Date().toDateString() === date.toDateString();

  return (
    <div className={`min-h-[600px] ${isToday ? 'bg-indigo-50' : ''}`}>
      <div className={`p-3 text-center border-b ${
        isToday ? 'bg-indigo-100 font-semibold' : 'bg-gray-50'
      }`}>
        <div className="text-sm text-gray-600">
          {formatDate(date, { weekday: 'short' })}
        </div>
        <div className="text-lg">
          {formatDate(date, { day: 'numeric' })}
        </div>
      </div>
      
      <div className="p-2 space-y-2">
        {workouts.map((workout) => (
          <div
            key={workout.id}
            className="bg-white rounded-md shadow-sm border p-3 hover:shadow-md transition-shadow"
          >
            <div 
              className="cursor-pointer"
              onClick={() => onWorkoutSelect(workout.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{workout.name}</h4>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  workout.completed 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {workout.completed ? 'Done' : 'Todo'}
                </span>
              </div>
              {workout.workout_exercises?.length > 0 && (
                <div className="text-xs text-gray-600">
                  {workout.workout_exercises.length} exercises
                </div>
              )}
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(workout.id);
                }}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}