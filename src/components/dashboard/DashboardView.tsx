import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { TaskItem } from '../tasks/TaskItem';
import { TaskModal } from '../tasks/TaskModal';
import { DEFAULT_MOODS, formatDateLabel, getGreeting, getTodayDateString } from '../../utils/constants';
import { ActiveTab, Task } from '../../types';
import {
  Plus,
  BookOpen,
  Calendar as CalendarIcon,
  History,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  Target
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { todayOverview } = useData();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const userName = user?.name ? user.name.split(' ')[0] : 'Shamyuktha';
  const { greeting } = getGreeting(userName);
  const today = getTodayDateString();

  const moodConfig = todayOverview.mood ? DEFAULT_MOODS[todayOverview.mood] : null;

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* 1. Premium Greeting & Philosophy Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900/40 p-8 sm:p-10 text-white shadow-2xl border border-white/10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-serif-heading drop-shadow-md">
            {greeting}
          </h1>
          
          <div className="w-full backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-10 sm:p-12 shadow-inner">
            <div className="flex flex-col sm:flex-row gap-10 items-center justify-between">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-amber-400" />
                  <h2 className="text-base font-semibold uppercase tracking-widest text-amber-400/90">
                    Daily Focus Philosophy
                  </h2>
                </div>
                <p className="text-xl sm:text-2xl font-medium text-stone-100/90 leading-relaxed italic font-serif">
                  « Plan your day → Live your day → Record your day → Reflect on your progress »
                </p>
                <p className="text-lg font-bold text-white tracking-wide border-l-4 border-amber-500 pl-5 py-2">
                  The connection between what you planned and what actually happened creates real clarity.
                </p>
              </div>
              <div className="w-40 h-40 sm:w-56 sm:h-56 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <img src="/book-icon.jpg" alt="Daily Focus Book" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Today's Overview Grid (Glassmorphism inspired) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Today's Tasks */}
        <div className="group relative p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-full blur-2xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-semibold tracking-wider uppercase mb-3">
              <span>Today's Tasks</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono tracking-tight text-stone-900 dark:text-stone-100 tabular-nums">
                {todayOverview.totalCount}
              </span>
              <span className="text-sm text-stone-400 font-medium">planned</span>
            </div>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mt-3 flex items-center gap-2">
              <span className="bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">{todayOverview.completedCount} done</span>
              <span className="bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">{todayOverview.pendingCount} left</span>
            </p>
          </div>
        </div>

        {/* Card 2: Progress */}
        <div className="group relative p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 dark:bg-amber-950/20 rounded-full blur-2xl group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-semibold tracking-wider uppercase mb-3">
              <span>Progress</span>
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-mono tracking-tight text-stone-900 dark:text-stone-100 tabular-nums">
                {todayOverview.completionRate}%
              </span>
            </div>
            <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full mt-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full relative"
                style={{ width: `${todayOverview.completionRate}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.15)_25%,rgba(255,255,255,.15)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.15)_75%,rgba(255,255,255,.15)_100%)] bg-[length:20px_20px]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Daily Mood */}
        <div className="group relative p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-50 dark:bg-rose-950/20 rounded-full blur-2xl group-hover:bg-rose-100 dark:group-hover:bg-rose-900/40 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-semibold tracking-wider uppercase mb-3">
              <span>Daily Mood</span>
              <span className="text-lg">{moodConfig?.emoji || '✨'}</span>
            </div>
            <div className="flex items-baseline gap-2 h-[40px] items-center">
              <span className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 capitalize">
                {todayOverview.mood || 'Not set'}
              </span>
            </div>
            <button
              onClick={() => onNavigate('diary')}
              className="text-xs font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 hover:translate-x-1 mt-4 inline-flex items-center gap-1.5 transition-all"
            >
              <span>{todayOverview.mood ? 'Change mood' : 'Reflect on mood'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 4: Diary Status */}
        <div className="group relative p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-50 dark:bg-emerald-950/20 rounded-full blur-2xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-semibold tracking-wider uppercase mb-3">
              <span>Daily Journal</span>
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2 h-[40px] items-center">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
                {todayOverview.diary ? (
                  <><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Written</>
                ) : (
                  <><span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600"></span> Unwritten</>
                )}
              </span>
            </div>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mt-4 bg-stone-50 dark:bg-stone-800/50 inline-block px-3 py-1.5 rounded-lg border border-stone-100 dark:border-stone-800">
              <span className="text-stone-900 dark:text-stone-100 font-bold">{todayOverview.diary?.wordCount || 0}</span> words today
            </p>
          </div>
        </div>
      </div>





      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultDate={today}
      />
    </div>
  );
};
