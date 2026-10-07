import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Priority } from '../../types';
import {
  User,
  Shield,
  Save,
} from 'lucide-react';

interface SettingsViewProps {
  onViewLandingPage?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useData();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [defaultPriority, setDefaultPriority] = useState<Priority>(
    user?.preferences?.defaultPriority || 'medium'
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      bio,
      preferences: {
        theme: user?.preferences?.theme || 'light',
        defaultPriority,
        enableSounds: user?.preferences?.enableSounds ?? true,
        autoSaveIntervalMs: 2000,
      },
    });
    showToast('Profile updated');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
          Settings & Preferences
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Manage your personal profile and preferences.
        </p>
      </div>

      {/* 1. Profile Settings */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-semibold flex items-center justify-center font-serif text-lg">
            {name ? name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Personal Profile
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Your name and preferences are stored locally and in private sessions.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Personal Bio / Learning Focus
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Computer Science student & aspiring software engineer."
              className="w-full px-3.5 py-2 text-xs bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Default Task Priority
            </label>
            <div className="flex items-center gap-2">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setDefaultPriority(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize border transition-all ${
                    defaultPriority === p
                      ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold'
                      : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
