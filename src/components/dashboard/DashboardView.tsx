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
  const { greeting, subtitle } = getGreeting(userName);
  const today = getTodayDateString();

  const moodConfig = todayOverview.mood ? DEFAULT_MOODS[todayOverview.mood] : null;

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 1. Greeting Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
            {greeting}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      {/* 2. Today's Overview Grid (Single-Elevation Depth) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Today's Tasks */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-medium">
            <span>Today's Tasks</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-stone-900 dark:text-stone-100 tabular-nums">
              {todayOverview.totalCount}
            </span>
            <span className="text-xs text-stone-400">planned</span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            {todayOverview.completedCount} completed · {todayOverview.pendingCount} pending
          </p>
        </div>

        {/* Card 2: Progress */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-medium">
            <span>Progress</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-stone-900 dark:text-stone-100 tabular-nums">
              {todayOverview.completionRate}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-amber-600 dark:bg-amber-500 rounded-full"
              style={{ width: `${todayOverview.completionRate}%` }}
            />
          </div>
        </div>

        {/* Card 3: Daily Mood */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-medium">
            <span>Daily Mood</span>
            <span>{moodConfig?.emoji || '✨'}</span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 capitalize">
              {todayOverview.mood || 'Not set'}
            </span>
          </div>
          <button
            onClick={() => onNavigate('diary')}
            className="text-xs text-amber-700 dark:text-amber-400 hover:underline mt-2 inline-flex items-center gap-1"
          >
            <span>{todayOverview.mood ? 'Change mood' : 'Reflect on mood'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 4: Diary Status */}
        <div className="p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs font-medium">
            <span>Daily Journal</span>
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {todayOverview.diary ? 'Written ✓' : 'Unwritten'}
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">
            {todayOverview.diary?.wordCount || 0} words recorded today
          </p>
        </div>
      </div>

      {/* 3. Quick Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>

        <button
          onClick={() => onNavigate('diary')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-xl transition-colors"
        >
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>Write Diary</span>
        </button>

        <button
          onClick={() => onNavigate('calendar')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-xl transition-colors"
        >
          <CalendarIcon className="w-4 h-4 text-stone-500" />
          <span>View Calendar</span>
        </button>

        <button
          onClick={() => onNavigate('past-entries')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-xl transition-colors"
        >
          <History className="w-4 h-4 text-stone-500" />
          <span>Past Entries</span>
        </button>
      </div>

      {/* 4. Split Section: Today's Tasks & Today's Journal Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Today's Task Checklist (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
                Today's Action Items
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {formatDateLabel(today)}
              </p>
            </div>

            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 inline-flex items-center gap-1"
            >
              <span>All Tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 pt-1">
            {todayOverview.tasks.length > 0 ? (
              todayOverview.tasks.slice(0, 5).map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  showDate={false}
                />
              ))
            ) : (
              <div className="text-center py-8 text-xs text-stone-500 dark:text-stone-400">
                Your day is open. Add tasks to plan your focus.
              </div>
            )}
          </div>
        </div>

        {/* Right: Today's Diary Snapshot & Reflection (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Diary Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
                Today's Journal Entry
              </h3>
              <button
                onClick={() => onNavigate('diary')}
                className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayOverview.diary?.content ? (
              <div>
                <h4 className="text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1.5">
                  {todayOverview.diary.title}
                </h4>
                <div
                  className="text-xs text-stone-600 dark:text-stone-400 line-clamp-4 leading-relaxed font-serif"
                  dangerouslySetInnerHTML={{
                    __html: todayOverview.diary.content,
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-stone-400 dark:text-stone-500 italic">
                “Nothing written yet. How was your day?”
              </div>
            )}
          </div>

          {/* Quick Reflection Card */}
          <div className="p-5 bg-amber-50/50 dark:bg-stone-900/60 border border-amber-200/60 dark:border-stone-800 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900/90 dark:text-amber-300">
                Daily Focus Philosophy
              </h4>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 italic leading-relaxed">
              «Plan your day → Live your day → Record your day → Reflect on your progress.»
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              The connection between what you planned and what actually happened creates real clarity.
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
