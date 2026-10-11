import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { ReminderSettings } from '../../types';
import confetti from 'canvas-confetti';
import {
  Clock,
  Mail,
  Bell,
  CheckCircle2,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Calendar,
  Send,
  Eye,
  X,
  Check,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface ReminderTimeSetterProps {
  onComplete: () => void;
  onSkip?: () => void;
  isSettingsMode?: boolean;
}

interface PresetOption {
  id: string;
  time: string; // HH:mm 24-hr
  label: string;
  timeDisplay: string;
  description: string;
  icon: React.ReactNode;
  recommended?: boolean;
}

const PRESETS: PresetOption[] = [
  {
    id: 'morning',
    time: '08:00',
    timeDisplay: '8:00 AM',
    label: 'Morning Kickoff',
    description: 'Review your focus tasks and agenda before your day gets busy.',
    icon: <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
  },
  {
    id: 'midday',
    time: '13:00',
    timeDisplay: '1:00 PM',
    label: 'Midday Check-In',
    description: 'Catch up on task momentum and refocus for the afternoon.',
    icon: <Sun className="w-5 h-5 text-amber-500" />,
  },
  {
    id: 'evening',
    time: '20:30',
    timeDisplay: '8:30 PM',
    label: 'Evening Reflection',
    description: 'Celebrate daily wins, check off finished work, and write your diary.',
    icon: <Sunset className="w-5 h-5 text-orange-500" />,
    recommended: true,
  },
  {
    id: 'night',
    time: '22:00',
    timeDisplay: '10:00 PM',
    label: 'Night Wind-Down',
    description: 'Calm reflection, gratitude, and mindful thoughts before sleep.',
    icon: <Moon className="w-5 h-5 text-indigo-400" />,
  },
];

const ALL_DAYS: Array<{ key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'; label: string; short: string }> = [
  { key: 'mon', label: 'Monday', short: 'Mon' },
  { key: 'tue', label: 'Tuesday', short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday', short: 'Thu' },
  { key: 'fri', label: 'Friday', short: 'Fri' },
  { key: 'sat', label: 'Saturday', short: 'Sat' },
  { key: 'sun', label: 'Sunday', short: 'Sun' },
];

export const ReminderTimeSetter: React.FC<ReminderTimeSetterProps> = ({
  onComplete,
  onSkip,
  isSettingsMode = false,
}) => {
  const { user, updateUser } = useAuth();
  const { showToast, tasks } = useData();

  // State initialization
  const userSettings = user?.reminderSettings;
  const [selectedTime, setSelectedTime] = useState<string>(userSettings?.time || '20:30');
  const [isCustomTime, setIsCustomTime] = useState<boolean>(() => {
    return !PRESETS.some((p) => p.time === (userSettings?.time || '20:30'));
  });
  const [customTimeInput, setCustomTimeInput] = useState<string>(userSettings?.time || '20:30');

  const [targetEmail, setTargetEmail] = useState<string>(
    userSettings?.customEmail || user?.email || 'shamyuktham6006@gmail.com'
  );
  const [selectedDays, setSelectedDays] = useState<
    Array<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'>
  >(userSettings?.days || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);

  const [reminderType, setReminderType] = useState<'both' | 'reflection' | 'planning'>(
    userSettings?.reminderType || 'both'
  );

  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSentResult, setTestSentResult] = useState<{
    deliveredVia?: string;
    previewUrl?: string | false;
    message?: string;
  } | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Time formatting helper
  const formatTimeDisplay = (time24: string): string => {
    if (!time24 || !time24.includes(':')) return time24;
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  };

  const currentTimeValue = isCustomTime ? customTimeInput : selectedTime;

  const handleSelectPreset = (preset: PresetOption) => {
    setIsCustomTime(false);
    setSelectedTime(preset.time);
  };

  const handleToggleDay = (dayKey: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun') => {
    setSelectedDays((prev) => {
      if (prev.includes(dayKey)) {
        if (prev.length === 1) return prev; // Keep at least one day
        return prev.filter((d) => d !== dayKey);
      } else {
        return [...prev, dayKey];
      }
    });
  };

  const handleSetAllDays = () => {
    setSelectedDays(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  };

  const handleSetWeekdays = () => {
    setSelectedDays(['mon', 'tue', 'wed', 'thu', 'fri']);
  };

  const handleSetWeekends = () => {
    setSelectedDays(['sat', 'sun']);
  };

  const handleSendTestEmail = async () => {
    if (!targetEmail) {
      showToast('Please enter a valid email address');
      return;
    }

    setIsSendingTest(true);
    setTestSentResult(null);

    try {
      const topTasks = (tasks || []).slice(0, 3).map((t) => ({
        title: t.title,
        priority: t.priority,
        status: t.status,
      }));

      const res = await fetch('/api/reminders/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: user?.name || 'DayFlow Member',
          time: formatTimeDisplay(currentTimeValue),
          reminderType,
          tasks: topTasks,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestSentResult({
          deliveredVia: data.deliveredVia || 'DayFlow Mail Dispatcher',
          previewUrl: data.previewUrl,
          message: `Test email dispatched to ${targetEmail}!`,
        });
        showToast(`Test reminder sent to ${targetEmail}`);
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } else {
        showToast(data.error || 'Failed to dispatch test email');
      }
    } catch (err: any) {
      showToast('Could not reach backend email service');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSaveAndConfirm = async () => {
    setIsSaving(true);
    const finalTime = isCustomTime ? customTimeInput : selectedTime;
    const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

    const newSettings: ReminderSettings = {
      enabled: true,
      time: finalTime,
      days: selectedDays,
      reminderType,
      customEmail: targetEmail,
      timezone: detectedTz,
    };

    try {
      // 1. Sync with server
      await fetch('/api/reminders/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          reminderSettings: newSettings,
        }),
      });

      // 2. Sync local Auth state
      updateUser({
        email: targetEmail,
        reminderSettings: newSettings,
      });

      // 3. Celebration confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      showToast(`Daily reminder scheduled for ${formatTimeDisplay(finalTime)}!`);
      setTimeout(() => {
        onComplete();
      }, 600);
    } catch (e) {
      // Fallback local update
      updateUser({
        reminderSettings: newSettings,
      });
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
      {/* Step Header */}
      <div className="text-center mb-8 space-y-3">
        {!isSettingsMode && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-semibold tracking-wide border border-amber-200 dark:border-amber-800 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-600" />
            <span>Step 2 of 2 · Daily Habit Loop</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 font-serif">
          {isSettingsMode ? 'Daily Reminder Schedule' : 'When should we remind you each day?'}
        </h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
          Consistent habits turn intentions into reality. DayFlow will send an email to your inbox every day at your chosen time so you never miss a reflection.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Time Presets Grid */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 flex items-center justify-center text-amber-700 dark:text-amber-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Select Your Daily Time
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Choose a curated ritual time or set a custom time
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold">
              <span>Selected:</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {formatTimeDisplay(currentTimeValue)}
              </span>
            </div>
          </div>

          {/* Preset Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {PRESETS.map((preset) => {
              const isSelected = !isCustomTime && selectedTime === preset.time;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-amber-500/20 shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-stone-50/50 dark:bg-stone-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 w-full">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-2xs">
                        {preset.icon}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {preset.label}
                        </div>
                        <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
                          {preset.timeDisplay}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {preset.recommended && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                          Popular
                        </span>
                      )}
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-3 leading-relaxed">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom Time Selector */}
          <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
            <div
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isCustomTime
                  ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-amber-500/20'
                  : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCustomTime(true)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isCustomTime
                      ? 'bg-amber-500 border-amber-500 text-white'
                      : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                  }`}
                >
                  {isCustomTime && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Set a Specific Custom Time
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    Select any exact hour and minute that suits your schedule
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="time"
                  value={customTimeInput}
                  onChange={(e) => {
                    setCustomTimeInput(e.target.value);
                    setIsCustomTime(true);
                  }}
                  onFocus={() => setIsCustomTime(true)}
                  className="px-3 py-2 text-sm font-semibold rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
                  ({formatTimeDisplay(customTimeInput)})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Frequency & Days */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 flex items-center justify-center text-amber-700 dark:text-amber-300">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Reminder Days
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Pick which days of the week you want this reminder
                </p>
              </div>
            </div>

            {/* Quick selectors */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={handleSetAllDays}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedDays.length === 7
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                Every Day
              </button>
              <button
                type="button"
                onClick={handleSetWeekdays}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedDays.length === 5 && !selectedDays.includes('sat') && !selectedDays.includes('sun')
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                Weekdays
              </button>
              <button
                type="button"
                onClick={handleSetWeekends}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedDays.length === 2 && selectedDays.includes('sat') && selectedDays.includes('sun')
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                Weekends
              </button>
            </div>
          </div>

          {/* Day Pills */}
          <div className="grid grid-cols-7 gap-2 pt-2">
            {ALL_DAYS.map((d) => {
              const isSelected = selectedDays.includes(d.key);
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => handleToggleDay(d.key)}
                  className={`py-3 px-1 sm:px-2 rounded-xl text-center text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                  }`}
                >
                  <div className="hidden sm:block text-[10px] opacity-80 uppercase tracking-wider font-semibold">
                    {d.short}
                  </div>
                  <div className="sm:text-sm text-xs mt-0.5">
                    {d.short.charAt(0)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Destination Email & Email Focus */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Address */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                <Mail className="w-4 h-4 text-amber-500" />
                <span>Deliver Reminder To Email</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-3.5 pr-20 py-2.5 text-xs font-medium rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <span className="text-[10px] bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-md font-semibold">
                    Active
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                You can change this anytime to your primary personal or work inbox.
              </p>
            </div>

            {/* Email Focus Mode */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>What Should Be In The Email?</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'both', label: 'Tasks & Diary' },
                  { id: 'reflection', label: 'Diary Reflection' },
                  { id: 'planning', label: 'Tasks Only' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setReminderType(type.id as any)}
                    className={`py-2.5 px-2 rounded-xl text-center text-xs font-semibold transition-all border ${
                      reminderType === type.id
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200'
                        : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Includes today's priorities, motivational prompt, and quick link to DayFlow.
              </p>
            </div>
          </div>

          {/* Test Email Button & Live Preview Trigger */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-100 hover:bg-amber-200/80 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 transition-colors border border-amber-300/60 dark:border-amber-800"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingTest ? 'Dispatching Test Mail...' : 'Send Test Reminder Email Now'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Email Format</span>
              </button>
            </div>

            {testSentResult && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>{testSentResult.message}</span>
                {testSentResult.previewUrl && (
                  <a
                    href={testSentResult.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-bold text-amber-600 dark:text-amber-400 ml-1"
                  >
                    (View Mail)
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Summary Card and Action Buttons */}
        <div className="bg-gradient-to-r from-amber-500/10 via-stone-100/40 to-amber-500/10 dark:from-amber-950/30 dark:via-stone-900/40 dark:to-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Schedule Summary</span>
            </div>
            <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              Every day at{' '}
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {formatTimeDisplay(currentTimeValue)}
              </span>{' '}
              to <span className="font-bold">{targetEmail}</span>
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              {selectedDays.length === 7
                ? 'Active every day of the week'
                : `Active on ${selectedDays.map((d) => d.toUpperCase()).join(', ')}`}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onSkip && !isSettingsMode && (
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-3 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors w-full sm:w-auto text-center"
              >
                Skip for now
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAndConfirm}
              disabled={isSaving}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-sm font-bold rounded-2xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{isSettingsMode ? 'Save Reminder Settings' : 'Set Daily Reminder & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800">
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100">
                <Mail className="w-4 h-4 text-amber-500" />
                <span>Sample Email Preview</span>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Email Body */}
            <div className="p-6 overflow-y-auto space-y-4 bg-stone-50 dark:bg-stone-950 text-xs">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-stone-900 dark:bg-stone-800 text-white font-bold flex items-center justify-center text-xs font-serif">
                      D
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        DayFlow Daily Habit Loop
                      </div>
                      <div className="text-[10px] text-stone-400">
                        reminders@dayflow.app &bull; To {targetEmail}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                    {formatTimeDisplay(currentTimeValue)}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Hello {user?.name || 'Friend'}, it's time for your daily reflection!
                  </h3>
                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-[11px]">
                    Take 2 minutes right now to celebrate your daily progress, review pending tasks, and jot down what went well today.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-lg text-amber-900 dark:text-amber-200 text-[11px] italic">
                  "Small daily disciplines repeated consistently lead to extraordinary results."
                </div>

                {reminderType !== 'reflection' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="font-bold text-stone-800 dark:text-stone-200 text-[11px]">
                      📋 Today's Focus:
                    </div>
                    <div className="space-y-1">
                      <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                        <span>Review project goals & daily priorities</span>
                        <span className="text-[9px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.5 rounded">High</span>
                      </div>
                      <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                        <span>Write today's diary entry</span>
                        <span className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded">Medium</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center pt-3">
                  <div className="inline-block px-5 py-2.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold text-xs">
                    Open DayFlow Workspace &rarr;
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
