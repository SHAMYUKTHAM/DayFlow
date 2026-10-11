import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { DiaryReminder, ReminderRepeat } from '../../types';
import { getTodayDateString } from '../../utils/constants';
import confetti from 'canvas-confetti';
import {
  Bell,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  Trash2,
  Edit3,
  Repeat,
  Plus,
  Sparkles,
  Check,
  AlertCircle,
  AlarmClock,
  ArrowRight,
  ShieldCheck,
  Volume2,
  BookOpen,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';

interface RemainedMePageProps {
  onContinueToDashboard?: () => void;
  isStandaloneTab?: boolean;
}

export const RemainedMePage: React.FC<RemainedMePageProps> = ({
  onContinueToDashboard,
  isStandaloneTab = false,
}) => {
  const { user } = useAuth();
  const {
    tasks,
    diaryReminders,
    addDiaryReminder,
    updateDiaryReminder,
    deleteDiaryReminder,
    toggleDiaryReminderCompletion,
    requestNotificationPermission,
    showToast,
  } = useData();

  // LEFT CARD: Incomplete Task Reminder Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(getTodayDateString());
  const [taskHour, setTaskHour] = useState('08');
  const [taskMinute, setTaskMinute] = useState('00');
  const [taskPeriod, setTaskPeriod] = useState<'AM' | 'PM'>('PM');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskRepeat, setTaskRepeat] = useState<ReminderRepeat>('none');
  const [taskValidationError, setTaskValidationError] = useState('');
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);
  const [selectedPendingTaskId, setSelectedPendingTaskId] = useState<string>('');

  // RIGHT CARD: Daily Diary Reminder Form states
  const [diaryTitle, setDiaryTitle] = useState('Write daily evening diary & reflection');
  const [diaryDate, setDiaryDate] = useState(getTodayDateString());
  const [diaryHour, setDiaryHour] = useState('09');
  const [diaryMinute, setDiaryMinute] = useState('30');
  const [diaryPeriod, setDiaryPeriod] = useState<'AM' | 'PM'>('PM');
  const [diaryNotes, setDiaryNotes] = useState('Review the day, capture highlights, and record gratitude.');
  const [diaryRepeat, setDiaryRepeat] = useState<ReminderRepeat>('daily');
  const [diaryValidationError, setDiaryValidationError] = useState('');
  const [isDiarySubmitting, setIsDiarySubmitting] = useState(false);

  // Editing state
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);

  // Browser notification status
  const [hasPermission, setHasPermission] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  // User pending / incomplete tasks list
  const pendingTasks = (tasks || []).filter((t) => t.status !== 'completed');

  // Filter reminders for the current user
  const currentUserId = user?.id || 'user-shamyuktha';
  const userReminders = diaryReminders.filter(
    (r) => r.userId === currentUserId || !r.userId || r.userId.startsWith('sample-')
  );

  // Sort upcoming reminders: pending first, then by date, then by time
  const sortedReminders = [...userReminders].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  // Time conversion helpers
  const formatTime24 = (h: string, m: string, p: 'AM' | 'PM'): string => {
    let hourNum = parseInt(h, 10);
    if (p === 'PM' && hourNum < 12) hourNum += 12;
    if (p === 'AM' && hourNum === 12) hourNum = 0;
    return `${String(hourNum).padStart(2, '0')}:${m}`;
  };

  const formatTimeDisplay = (timeStr: string): string => {
    if (!timeStr) return '';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    const [h, m] = timeStr.split(':');
    let hourNum = parseInt(h, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    hourNum = hourNum % 12;
    hourNum = hourNum ? hourNum : 12;
    return `${hourNum}:${m || '00'} ${ampm}`;
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
  };

  // Quick select an incomplete task to auto-fill left card
  const handleSelectPendingTask = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const taskId = e.target.value;
    setSelectedPendingTaskId(taskId);
    if (!taskId) return;
    const t = pendingTasks.find((task) => task.id === taskId);
    if (t) {
      setTaskTitle(t.title);
      if (t.dueDate) setTaskDate(t.dueDate);
      if (t.description) setTaskNotes(t.description);
    }
  };

  // Submit Left Card: Incomplete Task Reminder
  const handleSubmitTaskReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskValidationError('');

    if (!taskTitle.trim()) {
      setTaskValidationError('Please enter what task you want to be reminded about.');
      return;
    }
    if (!taskDate) {
      setTaskValidationError('Please select a date for the task reminder.');
      return;
    }

    setIsTaskSubmitting(true);
    const finalTime = formatTime24(taskHour, taskMinute, taskPeriod);

    try {
      if (editingReminderId) {
        await updateDiaryReminder(editingReminderId, {
          title: taskTitle.trim(),
          date: taskDate,
          time: finalTime,
          notes: taskNotes.trim(),
          repeat: taskRepeat,
        });
        setEditingReminderId(null);
      } else {
        await addDiaryReminder({
          title: taskTitle.trim(),
          date: taskDate,
          time: finalTime,
          notes: taskNotes.trim() || 'Incomplete task reminder',
          repeat: taskRepeat,
        });

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

      setTaskTitle('');
      setTaskNotes('');
      setTaskRepeat('none');
      setSelectedPendingTaskId('');
      setTaskValidationError('');
    } catch (err) {
      showToast('Could not save task reminder.', 'error');
    } finally {
      setIsTaskSubmitting(false);
    }
  };

  // Submit Right Card: Daily Diary Reminder
  const handleSubmitDiaryReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setDiaryValidationError('');

    if (!diaryTitle.trim()) {
      setDiaryValidationError('Please enter a title for your daily diary reminder.');
      return;
    }
    if (!diaryDate) {
      setDiaryValidationError('Please select a starting date.');
      return;
    }

    setIsDiarySubmitting(true);
    const finalTime = formatTime24(diaryHour, diaryMinute, diaryPeriod);

    try {
      await addDiaryReminder({
        title: diaryTitle.trim(),
        date: diaryDate,
        time: finalTime,
        notes: diaryNotes.trim(),
        repeat: diaryRepeat,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      setDiaryValidationError('');
      showToast('Daily Diary reminder active!', 'success');
    } catch (err) {
      showToast('Could not save diary reminder.', 'error');
    } finally {
      setIsDiarySubmitting(false);
    }
  };

  // Edit existing reminder
  const handleEditClick = (rem: DiaryReminder) => {
    setEditingReminderId(rem.id);
    setTaskTitle(rem.title);
    setTaskDate(rem.date);
    setTaskNotes(rem.notes || '');
    setTaskRepeat(rem.repeat || 'none');

    // Parse time into hour, minute, and period
    let timeRaw = rem.time;
    if (timeRaw.includes('AM') || timeRaw.includes('PM')) {
      const [tp, ampm] = timeRaw.split(' ');
      const [h, m] = tp.split(':');
      setTaskHour(String(parseInt(h, 10)).padStart(2, '0'));
      setTaskMinute(m || '00');
      setTaskPeriod((ampm as 'AM' | 'PM') || 'PM');
    } else {
      const [hStr, mStr] = timeRaw.split(':');
      let hNum = parseInt(hStr, 10);
      const isPm = hNum >= 12;
      setTaskPeriod(isPm ? 'PM' : 'AM');
      hNum = hNum % 12;
      setTaskHour(String(hNum ? hNum : 12).padStart(2, '0'));
      setTaskMinute(mStr || '00');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingReminderId(null);
    setTaskTitle('');
    setTaskNotes('');
    setTaskRepeat('none');
    setTaskDate(getTodayDateString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 text-slate-800 dark:text-stone-100 font-sans pb-16">
      <div className="max-w-6xl mx-auto pt-6 sm:pt-10 px-4 sm:px-6">
        {/* Onboarding Pill */}
        {!isStandaloneTab && (
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 text-xs font-semibold tracking-wide border border-sky-200 dark:border-sky-800 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Step 2 · Your Personal Reminder Alarms</span>
            </div>
          </div>
        )}

        {/* Page Title & Subtitle */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
            Remained Me
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
            &ldquo;Never forget the little things that matter.&rdquo;
          </p>
        </div>

        {/* Notification Permission Banner */}
        <div className="mb-8 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-sky-100 dark:border-sky-900/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
              <AlarmClock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                Browser Alarm & Notification Alerts
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {hasPermission
                  ? 'Active · You will receive alarms and desktop notifications when any task or diary reminder is due.'
                  : 'Enable browser notifications so your reminders ring right on schedule.'}
              </p>
            </div>
          </div>

          {!hasPermission ? (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white transition-colors shadow-2xs whitespace-nowrap"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Enable Alerts</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
              <Check className="w-3.5 h-3.5" />
              <span>Enabled</span>
            </span>
          )}
        </div>

        {/* TWO CARDS SIDE-BY-SIDE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start mb-12">
          {/* ========================================================= */}
          {/* LEFT CARD: INCOMPLETE TASK REMINDER                       */}
          {/* ========================================================= */}
          <div className="bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 to-sky-600" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Incomplete Task Reminder</span>
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Remind you if any important task is not yet completed
                    </p>
                  </div>
                </div>

                {editingReminderId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-xs font-semibold text-sky-600 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Pending Task Quick Selector if incomplete tasks exist */}
              {pendingTasks.length > 0 && !editingReminderId && (
                <div className="mb-4 p-3 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 space-y-1.5">
                  <label className="text-[11px] font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-sky-600" />
                    <span>Quick Select Incomplete Task ({pendingTasks.length} pending):</span>
                  </label>
                  <select
                    value={selectedPendingTaskId}
                    onChange={handleSelectPendingTask}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-stone-800 border border-sky-200 dark:border-stone-700 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  >
                    <option value="">-- Choose an unfinished task to auto-fill --</option>
                    {pendingTasks.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.title} {pt.priority ? `(${pt.priority.toUpperCase()} priority)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmitTaskReminder} className="space-y-4">
                {/* 1. What task do you want to remember? */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    What task do you want to remember? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g., Complete my project report"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-stone-700 bg-slate-50/50 dark:bg-stone-800/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <CalendarIcon className="w-3.5 h-3.5 text-sky-600" />
                      <span>Date</span> <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={taskDate}
                      onChange={(e) => setTaskDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-stone-700 bg-slate-50/50 dark:bg-stone-800/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                      required
                    />
                  </div>

                  {/* Set Time */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      <span>Set Time</span> <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={taskHour}
                        onChange={(e) => setTaskHour(e.target.value)}
                        className="w-14 px-2 py-2 rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50/50 dark:bg-stone-800/50 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <span className="font-bold text-slate-400">:</span>
                      <select
                        value={taskMinute}
                        onChange={(e) => setTaskMinute(e.target.value)}
                        className="w-14 px-2 py-2 rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50/50 dark:bg-stone-800/50 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                      >
                        {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <div className="flex rounded-xl border border-slate-200 dark:border-stone-700 p-0.5 bg-slate-100 dark:bg-stone-800">
                        <button
                          type="button"
                          onClick={() => setTaskPeriod('AM')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            taskPeriod === 'AM' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          AM
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskPeriod('PM')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            taskPeriod === 'PM' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          PM
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Task Notes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Task Notes <span className="text-[10px] text-slate-400">(Optional)</span>
                  </label>
                  <textarea
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    placeholder="Details, checklist items, or deadlines..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-stone-700 bg-slate-50/50 dark:bg-stone-800/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
                  />
                </div>

                {/* Repeat */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Repeat className="w-3.5 h-3.5 text-sky-600" />
                    <span>Repeat Reminder</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'daily', label: 'Daily' },
                      { id: 'weekly', label: 'Weekly' },
                      { id: 'monthly', label: 'Monthly' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTaskRepeat(item.id as ReminderRepeat)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
                          taskRepeat === item.id
                            ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/20'
                            : 'bg-white dark:bg-stone-800 border-slate-200 dark:border-stone-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {taskValidationError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-900">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{taskValidationError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isTaskSubmitting}
                    className="w-full py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>{editingReminderId ? 'Update Task Reminder' : 'Save Task Reminder'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT CARD: EVERYDAY DIARY REMINDER                       */}
          {/* ========================================================= */}
          <div className="bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 to-indigo-600" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Daily Diary Reminder</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                        Everyday
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Set a daily alarm to write your thoughts, mood, and memories
                    </p>
                  </div>
                </div>
              </div>

              {/* Informational banner about habitual reflection */}
              <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-sky-50/80 via-white to-sky-50/80 dark:from-sky-950/40 dark:via-stone-900 dark:to-sky-950/40 border border-sky-100 dark:border-sky-900/40 flex items-center gap-2.5 text-xs text-sky-900 dark:text-sky-200">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  Repeating daily ensures you build a steady journal habit and keep your streak alive!
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitDiaryReminder} className="space-y-4">
                {/* 1. What do you want to remember? */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Diary Reflection Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={diaryTitle}
                    onChange={(e) => setDiaryTitle(e.target.value)}
                    placeholder="e.g., Write evening reflection in DayFlow"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-stone-700 bg-slate-50/50 dark:bg-stone-800/50 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <CalendarIcon className="w-3.5 h-3.5 text-sky-600" />
                      <span>Start Date</span> <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={diaryDate}
                      onChange={(e) => setDiaryDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-stone-700 bg-slate-50/50 dark:bg-stone-800/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                      required
                    />
                  </div>

                  {/* Set Time */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      <span>Daily Time</span> <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={diaryHour}
                        onChange={(e) => setDiaryHour(e.target.value)}
                        className="w-14 px-2 py-2 rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50/50 dark:bg-stone-800/50 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <span className="font-bold text-slate-400">:</span>
                      <select
                        value={diaryMinute}
                        onChange={(e) => setDiaryMinute(e.target.value)}
                        className="w-14 px-2 py-2 rounded-xl border border-slate-200 dark:border-stone-700 bg-slate-50/50 dark:bg-stone-800/50 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                      >
                        {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <div className="flex rounded-xl border border-slate-200 dark:border-stone-700 p-0.5 bg-slate-100 dark:bg-stone-800">
                        <button
                          type="button"
                          onClick={() => setDiaryPeriod('AM')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            diaryPeriod === 'AM' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          AM
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiaryPeriod('PM')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                            diaryPeriod === 'PM' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          PM
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diary Notes */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Diary Prompt / Notes <span className="text-[10px] text-slate-400">(Optional)</span>
                  </label>
                  <textarea
                    value={diaryNotes}
                    onChange={(e) => setDiaryNotes(e.target.value)}
                    placeholder="e.g. Write what made you happy today or what you learned..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-2xl border border-slate-200 dark:border-stone-700 bg-slate-50/50 dark:bg-stone-800/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
                  />
                </div>

                {/* Repeat (default Daily for everyday diary) */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <Repeat className="w-3.5 h-3.5 text-sky-600" />
                    <span>Repeat Frequency</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'daily', label: 'Daily' },
                      { id: 'weekly', label: 'Weekly' },
                      { id: 'monthly', label: 'Monthly' },
                      { id: 'none', label: 'Once' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDiaryRepeat(item.id as ReminderRepeat)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
                          diaryRepeat === item.id
                            ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/20'
                            : 'bg-white dark:bg-stone-800 border-slate-200 dark:border-stone-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {diaryValidationError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-900">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{diaryValidationError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isDiarySubmitting}
                    className="w-full py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 stroke-[2.5]" />
                    <span>Save Daily Diary Reminder</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* 4. Upcoming Reminders: "My Reminders" Section */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
                My Reminders
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold">
                {userReminders.length}
              </span>
            </div>

            {userReminders.length > 0 && onContinueToDashboard && (
              <button
                type="button"
                onClick={onContinueToDashboard}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reminders List */}
          {sortedReminders.length === 0 ? (
            <div className="text-center py-12 px-6 rounded-3xl bg-white dark:bg-stone-900 border border-slate-100 dark:border-stone-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                You haven&apos;t added any reminders yet.
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Use the cards above to set an incomplete task reminder or a daily diary reminder!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {sortedReminders.map((rem) => {
                const isDiaryRem =
                  rem.title.toLowerCase().includes('diary') ||
                  rem.title.toLowerCase().includes('reflection') ||
                  rem.repeat === 'daily';

                return (
                  <div
                    key={rem.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all bg-white dark:bg-stone-900 shadow-2xs flex flex-col justify-between gap-3 ${
                      rem.completed
                        ? 'border-slate-200 dark:border-stone-800 opacity-60 bg-slate-50/50 dark:bg-stone-950'
                        : isDiaryRem
                        ? 'border-sky-200 dark:border-sky-900/50 hover:border-sky-400'
                        : 'border-slate-200 dark:border-stone-800 hover:border-sky-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          {/* Complete button */}
                          <button
                            type="button"
                            onClick={() => toggleDiaryReminderCompletion(rem.id)}
                            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              rem.completed
                                ? 'bg-emerald-500 text-white'
                                : 'border-2 border-slate-300 dark:border-stone-600 text-transparent hover:border-sky-500'
                            }`}
                            title={rem.completed ? 'Mark as incomplete' : 'Mark as completed'}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </button>

                          <div className="min-w-0">
                            <span
                              className={`font-bold text-sm sm:text-base leading-snug block ${
                                rem.completed
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {rem.title}
                            </span>
                          </div>
                        </div>

                        {/* Repeat pill */}
                        {rem.repeat && rem.repeat !== 'none' && (
                          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                            <Repeat className="w-2.5 h-2.5" />
                            <span>{rem.repeat}</span>
                          </span>
                        )}
                      </div>

                      {rem.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 pl-7 line-clamp-2">
                          {rem.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-stone-800 text-xs">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 text-sky-600" />
                          <span>{rem.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-sky-600" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {formatTimeDisplay(rem.time)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditClick(rem)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-stone-800 transition-colors"
                          title="Edit Reminder"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDiaryReminder(rem.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete Reminder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Action for Onboarding Flow */}
        {!isStandaloneTab && onContinueToDashboard && (
          <div className="mt-10 p-6 rounded-3xl bg-white dark:bg-stone-900 border border-sky-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Ready to start your day?</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your task and daily diary alarms are running. You can manage them anytime from the navigation bar.
              </p>
            </div>

            <button
              type="button"
              onClick={onContinueToDashboard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-2xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Continue to DayFlow Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
