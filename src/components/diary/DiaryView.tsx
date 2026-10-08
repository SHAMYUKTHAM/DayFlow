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
    <div className="w-full mx-auto space-y-6">
      {/* Top Header: Automatically filled Day, Date, Year & Navigation Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
            Today's Memories & Journal
          </h1>
        </div>
      </div>

      {/* Today's Diary Editor */}
      <div className="w-full">
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

      {/* Task Modal for adding tasks on the fly */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultDate={today}
      />
    </div>
  );
};
