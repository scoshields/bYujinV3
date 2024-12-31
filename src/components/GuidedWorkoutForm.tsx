import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { WorkoutLevel, WorkoutType, WORKOUT_LEVEL_CONFIGS, GuidedWorkoutFormData } from '../types/workout';
import { getAvailableEquipment } from '../utils/equipmentUtils';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

interface GuidedWorkoutFormProps {
  onSubmit: (data: GuidedWorkoutFormData) => void;
  loading: boolean;
}

export default function GuidedWorkoutForm({ onSubmit, loading }: GuidedWorkoutFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { session } = useAuthStore();
  const [formData, setFormData] = useState<Partial<GuidedWorkoutFormData>>({
    equipment: []
  });
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [workoutFlow, setWorkoutFlow] = useState<'multi' | 'single' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load user preferences when the component mounts
  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = useCallback(async () => {
    if (!session?.user.id) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('default_level, default_equipment')
        .eq('id', session.user.id)
        .single();

      if (profile?.default_level) {
        setFormData(prev => ({
          ...prev,
          level: profile.default_level as WorkoutLevel
        }));
      }

      if (profile?.default_equipment?.length) {
        setFormData(prev => ({
          ...prev,
          equipment: profile.default_equipment
        }));
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  }, [session?.user.id]);

  // Reset form when returning to select mode
  useEffect(() => {
    if (currentStep === 0) {
      loadUserPreferences(); // Reload preferences when starting over
      setWorkoutFlow(null);
    }
  }, [currentStep]);

  useEffect(() => {
    async function loadEquipment() {
      const equipment = await getAvailableEquipment();
      setAvailableEquipment(equipment);
      setLoadingEquipment(false);
    }
    loadEquipment();
  }, []);

  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences, currentStep]);

  const handleWorkoutTypeSelect = (type: WorkoutType) => {
    setFormData(prev => ({
      ...prev,
      workoutType: type,
      daysPerWeek: 1
    }));
    setCurrentStep(prev => prev + 1);
  };

  const handleMultiDaySelect = (days: number) => {
    setFormData(prev => ({
      ...prev,
      daysPerWeek: days
    }));
    setCurrentStep(prev => prev + 1);
  };

  const handleLevelSelect = (level: WorkoutLevel) => {
    setFormData(prev => ({
      ...prev,
      level
    }));
    setCurrentStep(prev => prev + 1);
  };

  const handleEquipmentToggle = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment?.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...(prev.equipment || []), equipment]
    }));
  };

  const handleSubmit = () => {
    if (formData.level && formData.equipment?.length && 
        (formData.daysPerWeek || formData.workoutType)) {
      onSubmit(formData as GuidedWorkoutFormData);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      
      // Reset relevant form data based on step
      if (currentStep === 1) {
        setWorkoutFlow(null);
        setFormData(prev => ({
          ...prev,
          workoutType: undefined,
          daysPerWeek: undefined
        }));
      } else if (currentStep === 2) {
        setFormData(prev => ({
          ...prev,
          level: undefined
        }));
      } else if (currentStep === 3) {
        setFormData(prev => ({
          ...prev,
          equipment: []
        }));
      }
    }
  };

  if (loadingEquipment && currentStep === 2) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const renderStepContent = () => {
    // Step 1: Choose workout flow
    if (currentStep === 0) {
      return (
        <div className="space-y-4">
          <button
            onClick={() => {
              setWorkoutFlow('single');
              setCurrentStep(prev => prev + 1);
            }}
            className="w-full p-4 text-left border rounded-lg transition-all duration-200 hover:border-indigo-500 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Single Day</h3>
                <p className="text-sm text-gray-500">Generate a focused workout for one muscle group</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </button>
          <button
            onClick={() => {
              setWorkoutFlow('multi');
              setCurrentStep(prev => prev + 1);
            }}
            className="w-full p-4 text-left border rounded-lg transition-all duration-200 hover:border-indigo-500 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Multi-Day Split</h3>
                <p className="text-sm text-gray-500">Create a complete workout program across multiple days</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </button>
        </div>
      );
    }

    // Step 2: Choose workout type or days
    if (currentStep === 1) {
      if (workoutFlow === 'single') {
        return (
          <div className="space-y-4">
            {[
              { 
                type: 'push', 
                label: 'Push Day', 
                description: 'Chest, shoulders, and triceps focused workout' 
              },
              { 
                type: 'pull', 
                label: 'Pull Day', 
                description: 'Back and biceps focused workout' 
              },
              { 
                type: 'legs', 
                label: 'Legs Day', 
                description: 'Lower body focused workout' 
              },
              { 
                type: 'upper', 
                label: 'Upper Body', 
                description: 'Complete upper body workout targeting all major muscle groups' 
              },
              { 
                type: 'lower', 
                label: 'Lower Body', 
                description: 'Complete lower body workout targeting legs, glutes, and core' 
              }
            ].map(({ type, label, description }) => (
              <button
                key={type}
                onClick={() => handleWorkoutTypeSelect(type as WorkoutType)}
                className="w-full p-4 text-left border rounded-lg transition-all duration-200 hover:border-indigo-500 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{label}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {[3, 4, 5].map((days) => (
            <button
              key={days}
              onClick={() => handleMultiDaySelect(days)}
              className="w-full p-4 text-left border rounded-lg transition-all duration-200 hover:border-indigo-500 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{days} Days</h3>
                  <p className="text-sm text-gray-500">
                    {days === 3 ? 'Great for beginners or those with limited time' :
                     days === 4 ? 'Balanced approach for most fitness goals' :
                     'Ideal for dedicated training and faster progress'}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      );
    }

    // Step 3: Choose workout level
    if (currentStep === 2) {
      return (
        <div className="space-y-4">
          {Object.entries(WORKOUT_LEVEL_CONFIGS).map(([level, config]) => (
            <button
              key={level}
              onClick={() => handleLevelSelect(level as WorkoutLevel)}
              className="w-full p-4 text-left border rounded-lg transition-all duration-200 hover:border-indigo-500 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </h3>
                  <p className="text-sm text-gray-500">{config.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      );
    }

    // Step 4: Choose equipment
    if (currentStep === 3) {
      return (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableEquipment.map((equipment) => (
              <button
                key={equipment}
                onClick={() => handleEquipmentToggle(equipment)}
                className={`p-4 text-left border rounded-lg transition-all duration-200 ${
                  formData.equipment?.includes(equipment)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'hover:border-indigo-500 hover:shadow-md'
                }`}
              >
                <h3 className="font-medium text-gray-900">{equipment}</h3>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.equipment?.length}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Generating Workout...' : 'Generate Workout'}
            </button>
          </div>
        </>
      );
    }
  };

  const stepTitles = [
    'Choose Your Workout Plan',
    workoutFlow === 'single' ? 'Select Workout Type' : 'How Many Days Per Week?',
    'Select Your Level',
    'What Equipment Do You Have?'
  ];

  const showBackButton = currentStep > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="text-sm text-indigo-600 hover:text-indigo-800 mr-4"
            >
              ← Back
            </button>
          )}
          <h2 className="text-2xl font-bold text-gray-900">
            {stepTitles[currentStep]}
          </h2>
          <div className="w-16" /> {/* Spacer for alignment */}
        </div>
        <div className="flex justify-between mt-4">
          {stepTitles.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 mx-1 rounded ${
                index <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {renderStepContent()}
    </div>
  );
}