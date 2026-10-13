import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  ShieldCheck,
  BookOpen,
  CheckSquare,
  Mail,
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
    diaryReminders,
    addDiaryReminder,
    updateDiaryReminder,
    deleteDiaryReminder,
    toggleDiaryReminderCompletion,
    showToast,
  } = useData();

  // LEFT CARD: Incomplete Task Reminder Form states
  const defaultEmail = user?.email || 'shamyuktham6006@gmail.com';
  const [taskHour, setTaskHour] = useState('08');
  const [taskMinute, setTaskMinute] = useState('00');
  const [taskPeriod, setTaskPeriod] = useState<'AM' | 'PM'>('PM');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskValidationError, setTaskValidationError] = useState('');
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);

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

  // Submit Left Card: Incomplete Task Reminder
  const handleSubmitTaskReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskValidationError('');

    if (!taskNotes.trim()) {
      setTaskValidationError('Please enter notes to remind.');
      return;
    }

    setIsTaskSubmitting(true);
    const finalTime = formatTime24(taskHour, taskMinute, taskPeriod);
    const title = taskNotes.trim().length > 40
      ? `${taskNotes.trim().slice(0, 37)}...`
      : taskNotes.trim();

    try {

      if (editingReminderId) {
        await updateDiaryReminder(editingReminderId, {
          title,
          date: getTodayDateString(),
          time: finalTime,
          notes: taskNotes.trim(),
          repeat: 'daily',
        });
        setEditingReminderId(null);
      } else {
        await addDiaryReminder({
          title,
          date: getTodayDateString(),
          time: finalTime,
          notes: taskNotes.trim(),
          repeat: 'daily',
        });

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

      setTaskNotes('');
      setTaskValidationError('');
      showToast('Task reminder saved successfully!', 'success');
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
    setTaskNotes(rem.notes || rem.title || '');

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
    setTaskNotes('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans pb-16">
      <div className="max-w-6xl mx-auto pt-6 sm:pt-10 px-4 sm:px-6">
        {/* Page Title & Subtitle */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
            Remained Me
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 font-serif italic">
            &ldquo;Never forget the little things that matter.&rdquo;
          </p>
        </div>


        {/* TWO CARDS SIDE-BY-SIDE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start mb-12">
          {/* ========================================================= */}
          {/* LEFT CARD: INCOMPLETE TASK REMINDER                       */}
          {/* ========================================================= */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-stone-800 via-stone-700 to-amber-700 dark:from-stone-700 dark:via-stone-600 dark:to-amber-600" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 font-serif-heading">
                      <span>Incomplete Task Reminder</span>
                    </h2>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Remind you if any important task is not yet completed
                    </p>
                  </div>
                </div>

                {editingReminderId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitTaskReminder} className="space-y-4">
                {/* 1. Default Email (Static) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200">
                      <Mail className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                      <span>Default Email</span>
                    </label>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                      Change in Profile
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-100/70 dark:bg-stone-800/60 text-stone-700 dark:text-stone-200 text-xs sm:text-sm select-all">
                    <span className="font-mono text-xs sm:text-sm truncate font-medium">
                      {defaultEmail}
                    </span>
                    <span className="shrink-0 ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-200/80 dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300/60 dark:border-stone-600">
                      Default
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">
                    Reminders are sent to this address. To change it, visit your Profile page.
                  </p>
                </div>

                {/* 2. Time Setter */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200">
                    <Clock className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                    <span>Time Setter</span> <span className="text-amber-600">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={taskHour}
                      onChange={(e) => setTaskHour(e.target.value)}
                      className="w-16 px-2.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                    >
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span className="font-bold text-stone-400">:</span>
                    <select
                      value={taskMinute}
                      onChange={(e) => setTaskMinute(e.target.value)}
                      className="w-16 px-2.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                    >
                      {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <div className="flex rounded-xl border border-stone-200 dark:border-stone-700 p-0.5 bg-stone-100 dark:bg-stone-800">
                      <button
                        type="button"
                        onClick={() => setTaskPeriod('AM')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          taskPeriod === 'AM'
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaskPeriod('PM')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          taskPeriod === 'PM'
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Notes to Remind */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Notes to Remind <span className="text-amber-600">*</span>
                  </label>
                  <textarea
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    placeholder="What would you like to be reminded about? Write your notes or tasks here..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400 resize-none"
                    required
                  />
                </div>

                {taskValidationError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-900">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{taskValidationError}</span>
                  </div>
                )}

                {/* 4. Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isTaskSubmitting}
                    className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 active:bg-stone-950 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>{editingReminderId ? 'Update Task Reminder' : 'Save Task Reminder'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT CARD: EVERYDAY DIARY REMINDER                       */}
          {/* ========================================================= */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 to-amber-700" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 font-serif-heading">
                      <span>Daily Diary Reminder</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                        Everyday
                      </span>
                    </h2>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Set a daily alarm to write your thoughts, mood, and memories
                    </p>
                  </div>
                </div>
              </div>

              {/* Informational banner about habitual reflection */}
              <div className="mb-4 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  Repeating daily ensures you build a steady journal habit and keep your streak alive!
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitDiaryReminder} className="space-y-4">
                {/* 1. What do you want to remember? */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Diary Reflection Title <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={diaryTitle}
                    onChange={(e) => setDiaryTitle(e.target.value)}
                    placeholder="e.g., Write evening reflection in DayFlow"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all placeholder:text-stone-400"
                    required
                  />
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200">
                      <CalendarIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                      <span>Start Date</span> <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="date"
                      value={diaryDate}
                      onChange={(e) => setDiaryDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      required
                    />
                  </div>

                  {/* Set Time */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                      <span>Daily Time</span> <span className="text-amber-600">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={diaryHour}
                        onChange={(e) => setDiaryHour(e.target.value)}
                        className="w-14 px-2 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <span className="font-bold text-stone-400">:</span>
                      <select
                        value={diaryMinute}
                        onChange={(e) => setDiaryMinute(e.target.value)}
                        className="w-14 px-2 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      >
                        {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <div className="flex rounded-xl border border-stone-200 dark:border-stone-700 p-0.5 bg-stone-100 dark:bg-stone-800">
                        <button
                          type="button"
                          onClick={() => setDiaryPeriod('AM')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            diaryPeriod === 'AM'
                              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                          }`}
                        >
                          AM
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiaryPeriod('PM')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            diaryPeriod === 'PM'
                              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
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
                  <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Diary Prompt / Notes <span className="text-[10px] text-stone-400 dark:text-stone-500">(Optional)</span>
                  </label>
                  <textarea
                    value={diaryNotes}
                    onChange={(e) => setDiaryNotes(e.target.value)}
                    placeholder="e.g. Write what made you happy today or what you learned..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 resize-none placeholder:text-stone-400"
                  />
                </div>

                {/* Repeat (default Daily for everyday diary) */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200">
                    <Repeat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
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
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/20'
                            : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
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
                    className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 active:bg-stone-950 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4 stroke-[2.5]" />
                    <span>Save Daily Diary Reminder</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Bottom Action for Onboarding Flow */}
        {!isStandaloneTab && onContinueToDashboard && (
          <div className="mt-10 p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center justify-center sm:justify-start gap-1.5 font-serif-heading">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                <span>Ready to start your day?</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Your task and daily diary alarms are running. You can manage them anytime from the navigation bar.
              </p>
            </div>

            <button
              type="button"
              onClick={onContinueToDashboard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-white font-semibold text-xs rounded-2xl shadow-sm hover:shadow-md transition-all"
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
