import React from 'react';
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { getWeekDates, formatDate, getWeekRange } from '../../utils/dateUtils';
import DayColumn from './DayColumn';
import { WorkoutWithExercises } from '../../types/workout';

interface WeeklyCalendarProps {
  workouts: WorkoutWithExercises[];
  currentWeekStart: Date;
  onWeekChange: (date: Date) => void;
  onWorkoutSelect: (workoutId: string) => void;
  onDelete: (workoutId: string) => void;
  onCopyWeek: () => void;
}

export default function WeeklyCalendar({
  workouts,
  currentWeekStart,
  onWeekChange,
  onWorkoutSelect,
  onDelete,
  onCopyWeek
}: WeeklyCalendarProps) {
  const weekDates = getWeekDates(currentWeekStart);
  const { startDate, endDate } = getWeekRange(currentWeekStart);

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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePreviousWeek}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            Week of {formatDate(startDate, { month: 'long', day: 'numeric' })}
          </h2>
          <button
            onClick={handleNextWeek}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={onCopyWeek}
          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
        >
          <Copy className="h-4 w-4" />
          Copy to Next Week
        </button>
      </div>
      
      <div className="grid grid-cols-7 divide-x">
        {weekDates.map((date) => (
          <DayColumn
            key={date.toISOString()}
            date={date}
            workouts={workouts.filter(w => {
              const workoutDate = new Date(w.scheduled_date);
              return workoutDate.toDateString() === date.toDateString();
            })}
            onWorkoutSelect={onWorkoutSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}