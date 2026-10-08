import React, { useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { DiaryEditor } from './DiaryEditor';
import { TaskModal } from '../tasks/TaskModal';
import { getAutoFilledDateParts, getTodayDateString } from '../../utils/constants';
import { Task } from '../../types';
import {
  BookOpen,
  Calendar,
  History,
  CheckCircle2,
  Check,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  Star,
  Tag,
  ListTodo,
} from 'lucide-react';

interface DiaryViewProps {
  onNavigateToHistory?: () => void;
}

export const DiaryView: React.FC<DiaryViewProps> = ({ onNavigateToHistory }) => {
  const {
    getTasksForDate,
    getDiaryForDate,
    diaryEntries,
    toggleTaskStatus,
    highlights,
  } = useData();

  const today = getTodayDateString();
  const dateParts = useMemo(() => getAutoFilledDateParts(today), [today]);

  const todayDiary = useMemo(() => {
    return getDiaryForDate(today);
  }, [today, getDiaryForDate]);

  const todayTasks = useMemo(() => {
    return getTasksForDate(today);
  }, [today, getTasksForDate]);

  const pastEntriesCount = diaryEntries.filter((d) => d.date !== today).length;
  const todayHighlights = highlights.filter((h) => h.date === today);

  // Filter tasks tab on the left card
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const completedTasks = todayTasks.filter((t) => t.status === 'completed');
  const pendingTasks = todayTasks.filter((t) => t.status !== 'completed');
  const completionRate =
    todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0;

  const displayedTasks = useMemo(() => {
    if (taskFilter === 'completed') return completedTasks;
    if (taskFilter === 'pending') return pendingTasks;
    return todayTasks;
  }, [todayTasks, completedTasks, pendingTasks, taskFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header: Automatically filled Day, Date, Year & Navigation Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
            Today's Memories & Journal
          </h1>
        </div>
      </div>

      {/* Main Split Grid:
          - Left: "Your Day at a Glance" separate card (like the left card in past entries)
          - Right: Today's Diary Editor card
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (5 cols on lg): "Your Day at a Glance" Card */}
        <div className="lg:col-span-5 h-full">
          <div className="h-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-2xs flex flex-col space-y-4">
            {/* Glance Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <ListTodo className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
                    Your Day at a Glance
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                title="Add a task for today"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar & Stats */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  Daily Progress
                </span>
                <span className="font-mono text-stone-600 dark:text-stone-400 font-medium tabular-nums">
                  {completedTasks.length} / {todayTasks.length} completed ({completionRate}%)
                </span>
              </div>
              <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 dark:bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            {/* Task Tabs: All, Pending, Completed */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800/60 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setTaskFilter('all')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  taskFilter === 'all'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                All ({todayTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setTaskFilter('completed')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  taskFilter === 'completed'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Done ({completedTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setTaskFilter('pending')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  taskFilter === 'pending'
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Pending ({pendingTasks.length})
              </button>
            </div>

            {/* Tasks Interactive Checklist */}
            <div className="space-y-1.5 flex-1 overflow-y-auto pr-1">
              {displayedTasks.length > 0 ? (
                displayedTasks.map((task) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all text-xs ${
                        isDone
                          ? 'bg-stone-50/70 dark:bg-stone-950/40 border-stone-200/60 dark:border-stone-800/60'
                          : 'bg-white dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/80 shadow-2xs'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isDone
                            ? 'bg-amber-600 border-amber-600 text-white'
                            : 'border-stone-300 dark:border-stone-600 hover:border-amber-600'
                        }`}
                        title={isDone ? 'Mark as pending' : 'Mark as completed'}
                      >
                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium leading-snug truncate ${
                            isDone
                              ? 'line-through text-stone-400 dark:text-stone-500'
                              : 'text-stone-800 dark:text-stone-200'
                          }`}
                        >
                          {task.title}
                        </p>

                        <div className="flex items-center gap-1.5 text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                          <span className="font-medium text-stone-600 dark:text-stone-400">
                            {task.category}
                          </span>
                          {task.dueTime && (
                            <>
                              <span>·</span>
                              <span className="font-mono tabular-nums">{task.dueTime}</span>
                            </>
                          )}
                          <span>·</span>
                          <span className="capitalize">{task.priority}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-stone-400 dark:text-stone-500 italic">
                  No tasks in this view.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column (7 cols on lg): Today's Diary Editor ("A Productive Rhythm & Clear Progress" card) */}
        <div className="lg:col-span-7 h-full">
          <DiaryEditor
            key={today}
            date={today}
            initialTitle={todayDiary?.title}
            initialContent={todayDiary?.content}
            initialMood={todayDiary?.mood}
            initialTags={todayDiary?.tags}
            dayTasks={todayTasks}
            showInlineGlance={false}
          />
        </div>
      </div>

      {/* Task Modal for adding tasks on the fly */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultDate={today}
      />
    </div>
  );
};
