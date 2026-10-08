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
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      bio,
      profileImage,
      preferences: {
        theme: user?.preferences?.theme || 'light',
        defaultPriority: user?.preferences?.defaultPriority || 'medium',
        enableSounds: user?.preferences?.enableSounds ?? true,
        autoSaveIntervalMs: 2000,
      },
    });
    showToast('Profile updated');
  };

  return (
    <div className="w-full mx-auto space-y-8">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
          Settings & Preferences
        </h1>
      </div>

      {/* 1. Profile Settings */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-4">
          <label className="relative group cursor-pointer w-14 h-14 rounded-full overflow-hidden bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center flex-shrink-0 shadow-sm border border-stone-200 dark:border-stone-700">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-amber-800 dark:text-amber-200 font-semibold font-serif text-xl">
                {name ? name.charAt(0).toUpperCase() : 'S'}
              </span>
            )}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-[10px] font-medium tracking-wider uppercase">Edit</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
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
