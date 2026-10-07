import { Category, MoodConfig, MoodType } from '../types';

export const DEFAULT_MOODS: Record<MoodType, MoodConfig> = {
  happy: {
    type: 'happy',
    emoji: '😊',
    label: 'Happy',
    bgLight: 'bg-emerald-50 hover:bg-emerald-100',
    bgDark: 'dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50',
    textLight: 'text-emerald-700',
    textDark: 'dark:text-emerald-300',
    borderLight: 'border-emerald-200',
    borderDark: 'dark:border-emerald-800/60',
  },
  calm: {
    type: 'calm',
    emoji: '😌',
    label: 'Calm',
    bgLight: 'bg-sky-50 hover:bg-sky-100',
    bgDark: 'dark:bg-sky-950/40 dark:hover:bg-sky-900/50',
    textLight: 'text-sky-700',
    textDark: 'dark:text-sky-300',
    borderLight: 'border-sky-200',
    borderDark: 'dark:border-sky-800/60',
  },
  motivated: {
    type: 'motivated',
    emoji: '🔥',
    label: 'Motivated',
    bgLight: 'bg-amber-50 hover:bg-amber-100',
    bgDark: 'dark:bg-amber-950/40 dark:hover:bg-amber-900/50',
    textLight: 'text-amber-800',
    textDark: 'dark:text-amber-300',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-800/60',
  },
  excited: {
    type: 'excited',
    emoji: '🤩',
    label: 'Excited',
    bgLight: 'bg-violet-50 hover:bg-violet-100',
    bgDark: 'dark:bg-violet-950/40 dark:hover:bg-violet-900/50',
    textLight: 'text-violet-700',
    textDark: 'dark:text-violet-300',
    borderLight: 'border-violet-200',
    borderDark: 'dark:border-violet-800/60',
  },
  neutral: {
    type: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    bgLight: 'bg-stone-100 hover:bg-stone-200',
    bgDark: 'dark:bg-stone-900 dark:hover:bg-stone-800',
    textLight: 'text-stone-700',
    textDark: 'dark:text-stone-300',
    borderLight: 'border-stone-300',
    borderDark: 'dark:border-stone-700',
  },
  stressed: {
    type: 'stressed',
    emoji: '😫',
    label: 'Stressed',
    bgLight: 'bg-rose-50 hover:bg-rose-100',
    bgDark: 'dark:bg-rose-950/40 dark:hover:bg-rose-900/50',
    textLight: 'text-rose-700',
    textDark: 'dark:text-rose-300',
    borderLight: 'border-rose-200',
    borderDark: 'dark:border-rose-800/60',
  },
  sad: {
    type: 'sad',
    emoji: '😔',
    label: 'Down',
    bgLight: 'bg-slate-100 hover:bg-slate-200',
    bgDark: 'dark:bg-slate-900 dark:hover:bg-slate-800',
    textLight: 'text-slate-700',
    textDark: 'dark:text-slate-300',
    borderLight: 'border-slate-300',
    borderDark: 'dark:border-slate-700',
  },
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-college', userId: 'default', name: 'College', color: 'indigo' },
  { id: 'cat-work', userId: 'default', name: 'Work', color: 'blue' },
  { id: 'cat-project', userId: 'default', name: 'Project', color: 'amber' },
  { id: 'cat-learning', userId: 'default', name: 'Learning', color: 'emerald' },
  { id: 'cat-health', userId: 'default', name: 'Health', color: 'rose' },
  { id: 'cat-personal', userId: 'default', name: 'Personal', color: 'purple' },
  { id: 'cat-other', userId: 'default', name: 'Other', color: 'stone' },
];

export const SUGGESTED_TAGS = [
  '#college',
  '#project',
  '#learning',
  '#achievement',
  '#friends',
  '#career',
  '#health',
  '#personal',
  '#routine',
  '#focus',
];

export function getTodayDateString(): string {
  // Use user's local date or anchor to 2026-09-28 if system time is near
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getAutoFilledDateParts(dateStr: string) {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return {
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
      dayNumber: String(d).padStart(2, '0'),
      monthName: date.toLocaleDateString('en-US', { month: 'long' }),
      year: String(y),
      fullFormatted: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  } catch {
    return {
      dayOfWeek: '',
      dayNumber: '',
      monthName: '',
      year: '',
      fullFormatted: dateStr,
    };
  }
}

export function getGreeting(name: string): { greeting: string; subtitle: string } {
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good evening';
  } else if (hour >= 21 || hour < 5) {
    greeting = 'Good night';
  }

  return {
    greeting: `${greeting}, ${name} 👋`,
    subtitle: hour >= 21 ? 'Time to unwind and reflect on your day.' : "Here's how your day is going.",
  };
}
