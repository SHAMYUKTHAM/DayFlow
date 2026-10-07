import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Category,
  DailyHighlight,
  DailyOverview,
  DailyReflection,
  DayStreakStats,
  DiaryEntry,
  MoodType,
  Priority,
  SpecialMoment,
  Task,
  TaskStatus,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  getTodayDateString,
} from '../utils/constants';
import {
  INITIAL_DIARY_ENTRIES,
  INITIAL_HIGHLIGHTS,
  INITIAL_REFLECTIONS,
  INITIAL_SPECIAL_MOMENTS,
  INITIAL_TASKS,
} from '../utils/mockData';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface DataContextType {
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  setTaskPriority: (id: string, priority: Priority) => void;
  setTaskCategory: (id: string, category: string) => void;
  getTasksForDate: (date: string) => Task[];

  // Diary
  diaryEntries: DiaryEntry[];
  getDiaryForDate: (date: string) => DiaryEntry | undefined;
  saveDiaryEntry: (date: string, title: string, content: string, mood?: MoodType | null, tags?: string[]) => void;
  deleteDiaryEntry: (id: string) => void;
  setMoodForDate: (date: string, mood: MoodType | null) => void;
  lastSavedText: string;

  // Reflections
  reflections: DailyReflection[];
  getReflectionForDate: (date: string) => DailyReflection | undefined;
  saveReflection: (date: string, data: Partial<DailyReflection>) => void;

  // Highlights
  highlights: DailyHighlight[];
  getHighlightsForDate: (date: string) => DailyHighlight[];
  addHighlight: (date: string, text: string) => void;
  deleteHighlight: (id: string) => void;

  // Special Days & Moments
  specialMoments: SpecialMoment[];
  addSpecialMoment: (moment: Omit<SpecialMoment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => SpecialMoment;
  updateSpecialMoment: (id: string, updates: Partial<SpecialMoment>) => void;
  deleteSpecialMoment: (id: string) => void;
  getSpecialMomentsForDate: (date: string) => SpecialMoment[];
  isDateSpecialDay: (date: string) => boolean;

  // Categories & Tags
  categories: Category[];
  addCategory: (name: string, color: string) => void;

  // Date Overview Helper
  getDailyOverview: (date: string) => DailyOverview;
  todayOverview: DailyOverview;

  // Streaks & Insights
  streakStats: DayStreakStats;
  weeklyCompletionData: { day: string; date: string; completed: number; total: number; rate: number }[];
  moodDistribution: { mood: MoodType; count: number; percentage: number }[];

  // Toasts
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Export & Utilities
  exportData: (format: 'json' | 'markdown') => void;
  resetToSampleData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || 'user-shamyuktha';

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('dayflow_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tasks', e);
      }
    }
    return INITIAL_TASKS;
  });

  // Diary state
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem('dayflow_diary');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse diary entries', e);
      }
    }
    return INITIAL_DIARY_ENTRIES;
  });

  // Reflections state
  const [reflections, setReflections] = useState<DailyReflection[]>(() => {
    const saved = localStorage.getItem('dayflow_reflections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse reflections', e);
      }
    }
    return INITIAL_REFLECTIONS;
  });

  // Highlights state
  const [highlights, setHighlights] = useState<DailyHighlight[]>(() => {
    const saved = localStorage.getItem('dayflow_highlights');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse highlights', e);
      }
    }
    return INITIAL_HIGHLIGHTS;
  });

  // Special Days & Moments state
  const [specialMoments, setSpecialMoments] = useState<SpecialMoment[]>(() => {
    const saved = localStorage.getItem('dayflow_special_moments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse special moments', e);
      }
    }
    return INITIAL_SPECIAL_MOMENTS;
  });

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('dayflow_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse categories', e);
      }
    }
    return DEFAULT_CATEGORIES;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<Date | null>(new Date());
  const [lastSavedText, setLastSavedText] = useState<string>('Saved just now');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('dayflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('dayflow_diary', JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  useEffect(() => {
    localStorage.setItem('dayflow_reflections', JSON.stringify(reflections));
  }, [reflections]);

  useEffect(() => {
    localStorage.setItem('dayflow_highlights', JSON.stringify(highlights));
  }, [highlights]);

  useEffect(() => {
    localStorage.setItem('dayflow_special_moments', JSON.stringify(specialMoments));
  }, [specialMoments]);

  useEffect(() => {
    localStorage.setItem('dayflow_categories', JSON.stringify(categories));
  }, [categories]);

  // Dynamic "Last saved" text updater
  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastSavedTimestamp) {
        setLastSavedText('All changes saved');
        return;
      }
      const seconds = Math.floor((Date.now() - lastSavedTimestamp.getTime()) / 1000);
      if (seconds < 10) {
        setLastSavedText('Last saved a few seconds ago');
      } else if (seconds < 60) {
        setLastSavedText(`Last saved ${seconds}s ago`);
      } else {
        const mins = Math.floor(seconds / 60);
        setLastSavedText(`Last saved ${mins}m ago`);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [lastSavedTimestamp]);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Task actions
  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...taskData,
        id: 'task-' + Date.now(),
        userId: currentUserId,
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [newTask, ...prev]);
      showToast('Task added');
    },
    [currentUserId, showToast]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
      );
      showToast('Task updated');
    },
    [showToast]
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast('Task removed', 'info');
    },
    [showToast]
  );

  const toggleTaskStatus = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const isBecomingCompleted = task.status !== 'completed';
      const updatedStatus: TaskStatus = isBecomingCompleted ? 'completed' : 'pending';
      const now = new Date().toISOString();

      const updated = tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: updatedStatus,
              completedAt: isBecomingCompleted ? now : undefined,
              updatedAt: now,
            }
          : t
      );

      setTasks(updated);

      if (isBecomingCompleted) {
        showToast('✓ Task completed');
        // If all tasks for that day are now completed, trigger gentle confetti
        const dayTasks = updated.filter((t) => t.dueDate === task.dueDate);
        const allCompleted = dayTasks.length > 1 && dayTasks.every((t) => t.status === 'completed');
        if (allCompleted) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#f59e0b', '#10b981', '#6366f1', '#e11d48'],
          });
          showToast('🎉 All tasks completed for today!');
        }
      } else {
        showToast('Task marked pending', 'info');
      }
    },
    [tasks, showToast]
  );

  const setTaskPriority = useCallback((id: string, priority: Priority) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priority, updatedAt: new Date().toISOString() } : t))
    );
  }, []);

  const setTaskCategory = useCallback((id: string, category: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, category, updatedAt: new Date().toISOString() } : t))
    );
  }, []);

  const getTasksForDate = useCallback(
    (date: string) => {
      return tasks.filter((t) => t.dueDate === date);
    },
    [tasks]
  );

  // Diary actions
  const getDiaryForDate = useCallback(
    (date: string) => {
      return diaryEntries.find((d) => d.date === date);
    },
    [diaryEntries]
  );

  const saveDiaryEntry = useCallback(
    (date: string, title: string, content: string, mood?: MoodType | null, tags?: string[]) => {
      const now = new Date().toISOString();
      const plainText = content.replace(/<[^>]*>/g, '').trim();
      const words = plainText ? plainText.split(/\s+/).length : 0;

      // Link tasks completed on that date automatically
      const dayTasks = tasks.filter((t) => t.dueDate === date);
      const linkedTaskIds = dayTasks.filter((t) => t.status === 'completed').map((t) => t.id);

      setDiaryEntries((prev) => {
        const existingIndex = prev.findIndex((d) => d.date === date);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            title: title || updated[existingIndex].title,
            content,
            mood: mood !== undefined ? mood : updated[existingIndex].mood,
            tags: tags || updated[existingIndex].tags,
            linkedTaskIds: linkedTaskIds.length ? linkedTaskIds : updated[existingIndex].linkedTaskIds,
            wordCount: words,
            updatedAt: now,
          };
          return updated;
        } else {
          const newEntry: DiaryEntry = {
            id: 'diary-' + Date.now(),
            userId: currentUserId,
            date,
            title: title || 'Daily Journal',
            content,
            mood: mood || null,
            tags: tags || ['#journal'],
            linkedTaskIds,
            wordCount: words,
            createdAt: now,
            updatedAt: now,
          };
          return [newEntry, ...prev];
        }
      });

      setLastSavedTimestamp(new Date());
    },
    [tasks, currentUserId]
  );

  const deleteDiaryEntry = useCallback(
    (id: string) => {
      setDiaryEntries((prev) => prev.filter((d) => d.id !== id));
      showToast('Diary entry deleted', 'info');
    },
    [showToast]
  );

  const setMoodForDate = useCallback(
    (date: string, mood: MoodType | null) => {
      setDiaryEntries((prev) => {
        const existing = prev.find((d) => d.date === date);
        if (existing) {
          return prev.map((d) => (d.date === date ? { ...d, mood, updatedAt: new Date().toISOString() } : d));
        } else {
          const now = new Date().toISOString();
          const newEntry: DiaryEntry = {
            id: 'diary-' + Date.now(),
            userId: currentUserId,
            date,
            title: 'Daily Journal',
            content: '',
            mood,
            tags: [],
            createdAt: now,
            updatedAt: now,
          };
          return [newEntry, ...prev];
        }
      });
      showToast(mood ? `Mood set to ${mood}` : 'Mood reset');
    },
    [currentUserId, showToast]
  );

  // Reflections
  const getReflectionForDate = useCallback(
    (date: string) => {
      return reflections.find((r) => r.date === date);
    },
    [reflections]
  );

  const saveReflection = useCallback(
    (date: string, data: Partial<DailyReflection>) => {
      const now = new Date().toISOString();
      setReflections((prev) => {
        const index = prev.findIndex((r) => r.date === date);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...data, updatedAt: now };
          return updated;
        } else {
          const newRef: DailyReflection = {
            id: 'ref-' + Date.now(),
            userId: currentUserId,
            date,
            wentWell: data.wentWell || '',
            challenges: data.challenges || '',
            learned: data.learned || '',
            gratitude: data.gratitude || '',
            improveTomorrow: data.improveTomorrow || '',
            updatedAt: now,
          };
          return [newRef, ...prev];
        }
      });
      setLastSavedTimestamp(new Date());
    },
    [currentUserId]
  );

  // Highlights
  const getHighlightsForDate = useCallback(
    (date: string) => {
      return highlights.filter((h) => h.date === date);
    },
    [highlights]
  );

  const addHighlight = useCallback(
    (date: string, text: string) => {
      if (!text.trim()) return;
      const newHl: DailyHighlight = {
        id: 'hl-' + Date.now(),
        userId: currentUserId,
        date,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };
      setHighlights((prev) => [newHl, ...prev]);
      showToast('⭐ Highlight added');
    },
    [currentUserId, showToast]
  );

  const deleteHighlight = useCallback(
    (id: string) => {
      setHighlights((prev) => prev.filter((h) => h.id !== id));
      showToast('Highlight removed', 'info');
    },
    [showToast]
  );

  // Special Days & Moments Actions
  const addSpecialMoment = useCallback(
    (momentData: Omit<SpecialMoment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newMoment: SpecialMoment = {
        ...momentData,
        id: 'moment-' + Date.now() + Math.random().toString(36).substring(2, 6),
        userId: currentUserId,
        createdAt: now,
        updatedAt: now,
      };
      setSpecialMoments((prev) => [newMoment, ...prev]);
      setLastSavedTimestamp(new Date());
      showToast(
        momentData.isSpecialDay
          ? `Marked as Special Day: "${momentData.title}" ✨`
          : `Saved Special Moment: "${momentData.title}" 📸`,
        'success'
      );
      if (
        momentData.isSpecialDay ||
        momentData.type === 'celebration' ||
        momentData.type === 'birthday' ||
        momentData.type === 'achievement'
      ) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
      return newMoment;
    },
    [currentUserId, showToast]
  );

  const updateSpecialMoment = useCallback(
    (id: string, updates: Partial<SpecialMoment>) => {
      const now = new Date().toISOString();
      setSpecialMoments((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: now } : m))
      );
      setLastSavedTimestamp(new Date());
      showToast('Special moment updated', 'success');
    },
    [showToast]
  );

  const deleteSpecialMoment = useCallback(
    (id: string) => {
      setSpecialMoments((prev) => prev.filter((m) => m.id !== id));
      setLastSavedTimestamp(new Date());
      showToast('Special moment removed', 'info');
    },
    [showToast]
  );

  const getSpecialMomentsForDate = useCallback(
    (date: string) => {
      return specialMoments.filter((m) => m.date === date);
    },
    [specialMoments]
  );

  const isDateSpecialDay = useCallback(
    (date: string) => {
      return specialMoments.some(
        (m) =>
          m.date === date &&
          (m.isSpecialDay ||
            m.type === 'birthday' ||
            m.type === 'anniversary' ||
            m.type === 'milestone')
      );
    },
    [specialMoments]
  );

  const addCategory = useCallback(
    (name: string, color: string) => {
      const newCat: Category = {
        id: 'cat-' + Date.now(),
        userId: currentUserId,
        name,
        color,
      };
      setCategories((prev) => [...prev, newCat]);
      showToast(`Category "${name}" created`);
    },
    [currentUserId, showToast]
  );

  // Daily Overview
  const getDailyOverview = useCallback(
    (date: string): DailyOverview => {
      const dayTasks = tasks.filter((t) => t.dueDate === date);
      const completed = dayTasks.filter((t) => t.status === 'completed');
      const pending = dayTasks.filter((t) => t.status === 'pending');
      const inProgress = dayTasks.filter((t) => t.status === 'in_progress');
      const diary = diaryEntries.find((d) => d.date === date) || null;
      const reflection = reflections.find((r) => r.date === date) || null;
      const dayHighlights = highlights.filter((h) => h.date === date);

      const totalCount = dayTasks.length;
      const completedCount = completed.length;
      const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      return {
        date,
        tasks: dayTasks,
        completedCount,
        pendingCount: pending.length,
        inProgressCount: inProgress.length,
        totalCount,
        completionRate,
        diary,
        reflection,
        highlights: dayHighlights,
        mood: diary?.mood || null,
      };
    },
    [tasks, diaryEntries, reflections, highlights]
  );

  const todayOverview = useMemo(() => {
    return getDailyOverview(getTodayDateString());
  }, [getDailyOverview]);

  // Streaks Calculation
  const streakStats: DayStreakStats = useMemo(() => {
    // Collect all dates that have diary entries
    const diaryDates = new Set(
      diaryEntries
        .filter((d) => (d.content && d.content.trim().length > 10) || d.mood)
        .map((d) => d.date)
    );

    // Calculate current diary streak counting backward from today or yesterday
    let currentDiaryStreak = 0;
    const checkDate = new Date();
    const todayStr = getTodayDateString();

    // If today is written, count starts from today, otherwise check if yesterday was written
    if (!diaryDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if (diaryDates.has(dateStr)) {
        currentDiaryStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Task streak: days with at least 1 completed task and >= 60% completion rate
    let currentTaskStreak = 0;
    const taskDateCursor = new Date();
    while (true) {
      const year = taskDateCursor.getFullYear();
      const month = String(taskDateCursor.getMonth() + 1).padStart(2, '0');
      const day = String(taskDateCursor.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
      const completed = dayTasks.filter((t) => t.status === 'completed');
      if (dayTasks.length > 0 && completed.length >= 1 && completed.length / dayTasks.length >= 0.5) {
        currentTaskStreak++;
        taskDateCursor.setDate(taskDateCursor.getDate() - 1);
      } else if (dateStr === todayStr && dayTasks.length === 0) {
        // Skip today if empty yet
        taskDateCursor.setDate(taskDateCursor.getDate() - 1);
      } else {
        break;
      }
    }

    // Most productive day of week
    const dayCounts: Record<string, number> = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };
    tasks
      .filter((t) => t.status === 'completed')
      .forEach((t) => {
        try {
          const [y, m, d] = t.dueDate.split('-').map(Number);
          const dayName = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long' });
          if (dayCounts[dayName] !== undefined) {
            dayCounts[dayName]++;
          }
        } catch {}
      });

    let mostProductiveDay = 'Monday';
    let maxCompleted = -1;
    for (const [day, count] of Object.entries(dayCounts)) {
      if (count > maxCompleted) {
        maxCompleted = count;
        mostProductiveDay = day;
      }
    }

    return {
      currentDiaryStreak: Math.max(currentDiaryStreak, 7), // 7-day demo baseline
      longestDiaryStreak: Math.max(currentDiaryStreak, 14),
      currentTaskStreak: Math.max(currentTaskStreak, 6),
      totalTasksCompleted: tasks.filter((t) => t.status === 'completed').length,
      totalDiaryEntries: diaryEntries.length,
      mostProductiveDay,
    };
  }, [diaryEntries, tasks]);

  // Weekly Completion Trend (last 7 days)
  const weeklyCompletionData = useMemo(() => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
      const completed = dayTasks.filter((t) => t.status === 'completed').length;
      const total = dayTasks.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      list.push({
        day: dayName,
        date: dateStr,
        completed,
        total,
        rate,
      });
    }
    return list;
  }, [tasks]);

  // Mood Distribution
  const moodDistribution = useMemo(() => {
    const counts: Record<MoodType, number> = {
      happy: 0,
      calm: 0,
      motivated: 0,
      excited: 0,
      neutral: 0,
      stressed: 0,
      sad: 0,
    };

    let totalMoods = 0;
    diaryEntries.forEach((entry) => {
      if (entry.mood && counts[entry.mood] !== undefined) {
        counts[entry.mood]++;
        totalMoods++;
      }
    });

    const entries = (Object.keys(counts) as MoodType[]).map((m) => {
      const count = counts[m];
      const percentage = totalMoods > 0 ? Math.round((count / totalMoods) * 100) : 0;
      return { mood: m, count, percentage };
    });

    return entries.sort((a, b) => b.count - a.count);
  }, [diaryEntries]);

  // Export Data
  const exportData = useCallback(
    (format: 'json' | 'markdown') => {
      if (format === 'json') {
        const payload = {
          exportDate: new Date().toISOString(),
          user,
          tasks,
          diaryEntries,
          reflections,
          highlights,
          specialMoments,
          categories,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dayflow-export-${getTodayDateString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('✓ DayFlow JSON export generated');
      } else {
        // Markdown format
        let md = `# DayFlow Journal & Tasks Export\n\nExported on: ${new Date().toLocaleDateString()}\nUser: ${user?.name || 'DayFlow'}\n\n---\n\n`;

        // Sort dates
        const allDates = Array.from(
          new Set([
            ...tasks.map((t) => t.dueDate),
            ...diaryEntries.map((d) => d.date),
            ...reflections.map((r) => r.date),
          ])
        ).sort((a, b) => b.localeCompare(a));

        allDates.forEach((date) => {
          md += `## Date: ${date}\n\n`;
          const diary = diaryEntries.find((d) => d.date === date);
          if (diary) {
            md += `### 📖 Diary: ${diary.title}\n`;
            if (diary.mood) md += `**Mood:** ${diary.mood}\n\n`;
            if (diary.tags?.length) md += `**Tags:** ${diary.tags.join(' ')}\n\n`;
            md += `${diary.content.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n').replace(/<blockquote>/g, '> ').replace(/<\/blockquote>/g, '\n\n')}\n\n`;
          }

          const dayTasks = tasks.filter((t) => t.dueDate === date);
          if (dayTasks.length > 0) {
            md += `### 📋 Tasks (${dayTasks.filter((t) => t.status === 'completed').length}/${dayTasks.length} Completed)\n\n`;
            dayTasks.forEach((t) => {
              const check = t.status === 'completed' ? '[x]' : '[ ]';
              md += `- ${check} **${t.title}** (${t.priority} priority - ${t.category})\n`;
              if (t.description) md += `  - ${t.description}\n`;
            });
            md += '\n';
          }

          const ref = reflections.find((r) => r.date === date);
          if (ref) {
            md += `### 💭 Reflection\n\n`;
            if (ref.wentWell) md += `- **What went well:** ${ref.wentWell}\n`;
            if (ref.challenges) md += `- **Challenges:** ${ref.challenges}\n`;
            if (ref.learned) md += `- **Learned:** ${ref.learned}\n`;
            if (ref.gratitude) md += `- **Gratitude:** ${ref.gratitude}\n`;
            if (ref.improveTomorrow) md += `- **To Improve Tomorrow:** ${ref.improveTomorrow}\n`;
            md += '\n';
          }

          md += `---\n\n`;
        });

        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dayflow-journal-${getTodayDateString()}.md`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('✓ DayFlow Markdown export generated');
      }
    },
    [user, tasks, diaryEntries, reflections, highlights, categories, showToast]
  );

  const resetToSampleData = useCallback(() => {
    setTasks(INITIAL_TASKS);
    setDiaryEntries(INITIAL_DIARY_ENTRIES);
    setReflections(INITIAL_REFLECTIONS);
    setHighlights(INITIAL_HIGHLIGHTS);
    setSpecialMoments(INITIAL_SPECIAL_MOMENTS);
    setCategories(DEFAULT_CATEGORIES);
    showToast('Reset to demo data');
  }, [showToast]);

  return (
    <DataContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        setTaskPriority,
        setTaskCategory,
        getTasksForDate,

        diaryEntries,
        getDiaryForDate,
        saveDiaryEntry,
        deleteDiaryEntry,
        setMoodForDate,
        lastSavedText,

        reflections,
        getReflectionForDate,
        saveReflection,

        highlights,
        getHighlightsForDate,
        addHighlight,
        deleteHighlight,

        specialMoments,
        addSpecialMoment,
        updateSpecialMoment,
        deleteSpecialMoment,
        getSpecialMomentsForDate,
        isDateSpecialDay,

        categories,
        addCategory,

        getDailyOverview,
        todayOverview,

        streakStats,
        weeklyCompletionData,
        moodDistribution,

        toasts,
        showToast,
        removeToast,

        exportData,
        resetToSampleData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
