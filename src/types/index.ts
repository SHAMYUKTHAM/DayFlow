export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type MoodType = 
  | 'happy' 
  | 'calm' 
  | 'motivated' 
  | 'neutral' 
  | 'sad' 
  | 'stressed' 
  | 'excited';

export interface MoodConfig {
  type: MoodType;
  emoji: string;
  label: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  borderLight: string;
  borderDark: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  role?: string;
  createdAt: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultPriority: Priority;
    enableSounds: boolean;
    autoSaveIntervalMs: number;
  };
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: Priority;
  category: string;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface DiaryEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string; // HTML or Markdown
  mood: MoodType | null;
  tags: string[];
  linkedTaskIds?: string[];
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReflection {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  wentWell: string;
  challenges: string;
  learned: string;
  gratitude: string;
  improveTomorrow: string;
  updatedAt: string;
}

export interface DailyHighlight {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  text: string;
  createdAt: string;
}

export type SpecialDayType =
  | 'birthday'
  | 'anniversary'
  | 'milestone'
  | 'achievement'
  | 'trip'
  | 'festival'
  | 'celebration'
  | 'personal'
  | 'note';

export interface SpecialMoment {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: SpecialDayType;
  note: string;
  photoUrl?: string; // Base64 data URL or external URL
  photoCaption?: string;
  location?: string;
  tags?: string[];
  emoji?: string;
  isSpecialDay?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  iconName?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface DailyOverview {
  date: string;
  tasks: Task[];
  completedCount: number;
  pendingCount: number;
  inProgressCount: number;
  totalCount: number;
  completionRate: number;
  diary: DiaryEntry | null;
  reflection: DailyReflection | null;
  highlights: DailyHighlight[];
  mood: MoodType | null;
}

export interface DayStreakStats {
  currentDiaryStreak: number;
  longestDiaryStreak: number;
  currentTaskStreak: number;
  totalTasksCompleted: number;
  totalDiaryEntries: number;
  mostProductiveDay: string;
}

export type ActiveTab = 'dashboard' | 'tasks' | 'diary' | 'past-entries' | 'calendar' | 'settings';
