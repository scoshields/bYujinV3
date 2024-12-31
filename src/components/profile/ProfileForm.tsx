import React, { useState } from 'react';
import { Profile } from '../../types/auth';
import { formatDate } from '../../utils/dateUtils';
import { getAvailableEquipment } from '../../utils/equipmentUtils';
import { WorkoutLevel, WORKOUT_LEVEL_CONFIGS } from '../../types/workout';

interface ProfileFormProps {
  profile: Profile;
  onSave: (data: Partial<Profile>) => Promise<void>;
  onAvatarChange: (file: File) => Promise<void>;
}

export default function ProfileForm({ profile, onSave, onAvatarChange }: ProfileFormProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    date_of_birth: profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : '',
    height_inches: profile.height_inches || '',
    weight_lbs: profile.weight_lbs || '',
    default_level: profile.default_level || 'intermediate',
    default_equipment: profile.default_equipment || []
  });

  React.useEffect(() => {
    async function loadEquipment() {
      const equipment = await getAvailableEquipment();
      setAvailableEquipment(equipment);
    }
    loadEquipment();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString() : null,
        height_inches: formData.height_inches ? parseInt(formData.height_inches.toString()) : null,
        weight_lbs: formData.weight_lbs ? parseFloat(formData.weight_lbs.toString()) : null,
        default_level: formData.default_level,
        default_equipment: formData.default_equipment
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        await onAvatarChange(file);
      } catch (error) {
        console.error('Error uploading avatar:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!editing) {
    return (
      <div className="space-y-6">
        {(!profile.default_level || !profile.default_equipment?.length) && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-indigo-800 mb-2">Set Your Workout Preferences</h3>
            <p className="text-sm text-indigo-600">
              Click "Edit Profile" to set your default workout level and available equipment. These preferences will be used automatically when generating new workouts.
            </p>
          </div>
        )}

        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              Change
            </label>
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-gray-600">@{profile.username}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-gray-50 px-4 py-3 rounded-lg">
            <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
            <dd className="mt-1 text-gray-900">
              {profile.date_of_birth ? formatDate(profile.date_of_birth) : 'Not set'}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-3 rounded-lg">
            <dt className="text-sm font-medium text-gray-500">Height (inches)</dt>
            <dd className="mt-1 text-gray-900">
              {profile.height_inches ? `${profile.height_inches}"` : 'Not set'}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-3 rounded-lg">
            <dt className="text-sm font-medium text-gray-500">Weight (lbs)</dt>
            <dd className="mt-1 text-gray-900">
              {profile.weight_lbs ? `${profile.weight_lbs} lbs` : 'Not set'}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-3 rounded-lg">
            <dt className="text-sm font-medium text-gray-500">Member Since</dt>
            <dd className="mt-1 text-gray-900">
              {formatDate(profile.created_at)}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-3 rounded-lg">
            <dt className="text-sm font-medium text-gray-500">Default Level</dt>
            <dd className="mt-1 text-gray-900">
              {profile.default_level ? profile.default_level.charAt(0).toUpperCase() + profile.default_level.slice(1) : (
                <span className="text-gray-400 italic">Not set - Click Edit Profile to configure</span>
              )}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-3 rounded-lg">
            <dt className="text-sm font-medium text-gray-500">Available Equipment</dt>
            <dd className="mt-1 text-gray-900">
              {profile.default_equipment?.length ? (
                <div className="flex flex-wrap gap-1">
                  {profile.default_equipment.map(equipment => (
                    <span key={equipment} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      {equipment}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 italic">Not set - Click Edit Profile to configure</span>
              )}
            </dd>
          </div>
        </dl>

        <button
          onClick={() => setEditing(true)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit Profile
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Date of Birth
        </label>
        <input
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="height_inches" className="block text-sm font-medium text-gray-700">
            Height (inches)
          </label>
          <input
            id="height_inches"
            type="number"
            min="1"
            max="120"
            value={formData.height_inches}
            onChange={(e) => setFormData(prev => ({ ...prev, height_inches: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="weight_lbs" className="block text-sm font-medium text-gray-700">
            Weight (lbs)
          </label>
          <input
            id="weight_lbs"
            type="number"
            min="1"
            max="1000"
            value={formData.weight_lbs}
            onChange={(e) => setFormData(prev => ({ ...prev, weight_lbs: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Default Workout Level
        </label>
        <select
          value={formData.default_level}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            default_level: e.target.value as WorkoutLevel 
          }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {Object.entries(WORKOUT_LEVEL_CONFIGS).map(([level, config]) => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)} - {config.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Equipment
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableEquipment.map((equipment) => (
            <label
              key={equipment}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.default_equipment.includes(equipment)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.default_equipment.includes(equipment)}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    default_equipment: e.target.checked
                      ? [...prev.default_equipment, equipment]
                      : prev.default_equipment.filter(eq => eq !== equipment)
                  }));
                }}
                className="sr-only"
              />
              <span className="ml-2">{equipment}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}