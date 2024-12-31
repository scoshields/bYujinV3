import React from 'react';
import { Star, Plus } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { WorkoutWithExercises } from '../../types/workout';

interface FavoriteWorkoutsProps {
  workouts: WorkoutWithExercises[];
  onSelect: (workoutId: string) => void;
  onAddToWeek: (workoutId: string) => void;
  onToggleFavorite: (workoutId: string) => void;
}

export default function FavoriteWorkouts({
  workouts,
  onSelect,
  onAddToWeek,
  onToggleFavorite
}: FavoriteWorkoutsProps) {
  const favoriteWorkouts = workouts.filter(w => w.is_favorite);

  if (favoriteWorkouts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Favorite Workouts</h2>
      <div className="grid gap-2 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {favoriteWorkouts.map((workout) => (
          <div
            key={workout.id}
            className="bg-white rounded-lg border shadow-sm p-3 sm:p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(workout.id);
                  }}
                  className="text-yellow-500 hover:text-yellow-600"
                >
                  <Star className="h-4 w-4 fill-current" />
                </button>
                <h3 className="font-medium">
                  {workout.custom_name || workout.name}
                </h3>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              Last performed: {formatDate(workout.scheduled_date)}
            </div>

            {workout.workout_exercises && (
              <div className="text-sm text-gray-500 mb-4">
                {workout.workout_exercises.length} exercises
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => onSelect(workout.id)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                View Details
              </button>
              <button
                onClick={() => onAddToWeek(workout.id)}
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
              >
                <Plus className="h-4 w-4" />
                Add to Week
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}