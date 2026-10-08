import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MoodType, Task } from '../../types';
import { useData } from '../../contexts/DataContext';
import { MoodSelector } from '../common/MoodSelector';
import { SUGGESTED_TAGS, formatDateLabel, getAutoFilledDateParts, DEFAULT_MOODS } from '../../utils/constants';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Check,
  Tag as TagIcon,
  X,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
} from 'lucide-react';

interface DiaryEditorProps {
  date: string;
  initialTitle?: string;
  initialContent?: string;
  initialMood?: MoodType | null;
  initialTags?: string[];
  dayTasks?: Task[];
  showInlineGlance?: boolean;
  onDateChange?: (newDate: string) => void;
}

export const DiaryEditor: React.FC<DiaryEditorProps> = ({
  date,
  initialTitle = '',
  initialContent = '',
  initialMood = null,
  initialTags = [],
  dayTasks = [],
  showInlineGlance = false,
  onDateChange,
}) => {
  const { saveDiaryEntry, lastSavedText, showToast } = useData();

  const [title, setTitle] = useState(initialTitle);
  const [mood, setMood] = useState<MoodType | null>(initialMood);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isMoodDropdownOpen, setIsMoodDropdownOpen] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isInitialized = useRef(false);

  // Sync state if date or props change
  useEffect(() => {
    if (isInitialized.current) return;

    setTitle(initialTitle || '');
    setMood(initialMood || null);
    setTags(initialTags || []);
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent || '<p>Tell your story...</p>';
      calculateWords();
    }
    isInitialized.current = true;
  }, [initialTitle, initialContent, initialMood, initialTags]);

  const calculateWords = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const clean = text.replace(/Tell your story\.\.\./g, '').trim();
    if (!clean) {
      setWordCount(0);
      return;
    }
    const words = clean.split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  };

  // Debounced auto-save
  const triggerAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (!editorRef.current) return;
      const htmlContent = editorRef.current.innerHTML;
      saveDiaryEntry(date, title.trim() || 'Daily Journal', htmlContent, mood, tags);
    }, 1200);
  }, [date, title, mood, tags, saveDiaryEntry]);

  const handleManualSave = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (!editorRef.current) return;
    saveDiaryEntry(date, title.trim() || 'Daily Journal', editorRef.current.innerHTML, mood, tags);
    showToast('Journal saved', 'success');
  };

  const handleContentInput = () => {
    calculateWords();
    triggerAutoSave();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    triggerAutoSave();
  };

  const handleMoodSelect = (newMood: MoodType) => {
    const nextMood = mood === newMood ? null : newMood;
    setMood(nextMood);
    if (editorRef.current) {
      saveDiaryEntry(date, title.trim() || 'Daily Journal', editorRef.current.innerHTML, nextMood, tags);
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    const formatted = tagToAdd.startsWith('#') ? tagToAdd : `#${tagToAdd}`;
    if (!tags.includes(formatted)) {
      const nextTags = [...tags, formatted];
      setTags(nextTags);
      if (editorRef.current) {
        saveDiaryEntry(date, title.trim() || 'Daily Journal', editorRef.current.innerHTML, mood, nextTags);
      }
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    setTags(nextTags);
    if (editorRef.current) {
      saveDiaryEntry(date, title.trim() || 'Daily Journal', editorRef.current.innerHTML, mood, nextTags);
    }
  };

  // Rich text formatting actions
  const formatDoc = (cmd: string, value: string | undefined = undefined) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleContentInput();
  };

  // Completed tasks count
  const completedTasks = dayTasks.filter((t) => t.status === 'completed');
  const completionRate = dayTasks.length > 0 ? Math.round((completedTasks.length / dayTasks.length) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Top Header Bar: Auto-filled Date, Day, Year & Save Indicator */}
      {(() => {
        const dateParts = getAutoFilledDateParts(date);
        return (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800 gap-3 bg-stone-50/50 dark:bg-stone-900/40">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex flex-col items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-900/40">
                <span className="text-[10px] uppercase font-mono font-bold leading-none">{dateParts.dayOfWeek.slice(0, 3)}</span>
                <span className="text-sm font-mono font-bold leading-tight">{dateParts.dayNumber}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 font-serif-heading">
                    {dateParts.dayOfWeek}, {dateParts.monthName} {dateParts.dayNumber}, {dateParts.year}
                  </h2>
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoodDropdownOpen(!isMoodDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs font-medium hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                {mood ? (
                  <>
                    <span>{DEFAULT_MOODS[mood].emoji}</span>
                    <span>{DEFAULT_MOODS[mood].label}</span>
                  </>
                ) : (
                  <span className="text-stone-500">How did today feel?</span>
                )}
                <svg className={`w-3 h-3 text-stone-400 transition-transform ${isMoodDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {isMoodDropdownOpen && (
                <div className="absolute right-0 mt-1.5 z-10 w-36 p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg flex flex-col gap-0.5">
                  {Object.values(DEFAULT_MOODS).map((m) => (
                    <button
                      key={m.type}
                      type="button"
                      onClick={() => {
                        handleMoodSelect(m.type);
                        setIsMoodDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        mood === m.type
                          ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                      }`}
                    >
                      <span className="text-sm">{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* "Your Day at a Glance" — Smart Connection between Tasks and Diary */}
      {showInlineGlance && dayTasks.length > 0 && (
        <div className="px-6 py-4 bg-amber-50/40 dark:bg-stone-900/90 border-b border-stone-100 dark:border-stone-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-900/80 dark:text-amber-300">
              Your Day at a Glance
            </span>
            <span className="text-xs font-mono font-medium text-stone-600 dark:text-stone-400 tabular-nums">
              {completedTasks.length} / {dayTasks.length} completed ({completionRate}%)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {dayTasks.slice(0, 6).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 py-1 px-2.5 rounded-lg bg-white/70 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/40"
              >
                <span
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 text-[10px] ${
                    task.status === 'completed'
                      ? 'bg-amber-600 text-white'
                      : 'border border-stone-300 dark:border-stone-600 text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span
                  className={`truncate ${
                    task.status === 'completed'
                      ? 'line-through text-stone-400 dark:text-stone-500'
                      : 'text-stone-700 dark:text-stone-300 font-medium'
                  }`}
                >
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Title Input */}
      <div className="px-6 pt-5 pb-2">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Give today a title (e.g. A Productive Rhythm & Clear Progress)..."
          className="w-full text-xl sm:text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 placeholder:text-stone-300 dark:placeholder:text-stone-600 bg-transparent border-none focus:outline-none font-serif-heading"
        />
      </div>

      {/* Formatting Toolbar */}
      <div className="px-6 py-2 border-y border-stone-100 dark:border-stone-800 flex items-center gap-1 flex-wrap bg-stone-50/30 dark:bg-stone-900/30">
        <button
          type="button"
          onClick={() => formatDoc('bold')}
          className="p-1.5 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatDoc('italic')}
          className="p-1.5 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-stone-200 dark:bg-stone-800 mx-1" />

        <button
          type="button"
          onClick={() => formatDoc('formatBlock', '<h1>')}
          className="p-1.5 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          title="Large Heading"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatDoc('formatBlock', '<h2>')}
          className="p-1.5 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          title="Medium Heading"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatDoc('formatBlock', '<p>')}
          className="px-2 py-1 text-xs font-mono text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          title="Body Paragraph"
        >
          P
        </button>

        <div className="w-px h-4 bg-stone-200 dark:bg-stone-800 mx-1" />

        <button
          type="button"
          onClick={() => formatDoc('insertUnorderedList')}
          className="p-1.5 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatDoc('insertOrderedList')}
          className="p-1.5 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatDoc('formatBlock', '<blockquote>')}
          className="p-1.5 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          title="Quote Block"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-stone-200 dark:bg-stone-800 mx-1" />

        <button
          type="button"
          onClick={() => formatDoc('undo')}
          className="p-1.5 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatDoc('redo')}
          className="p-1.5 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Surface */}
      <div className="p-6 flex-1 flex flex-col">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentInput}
          onBlur={triggerAutoSave}
          className="journal-content flex-1 min-h-[320px] focus:outline-none text-stone-800 dark:text-stone-200 selection:bg-amber-100 dark:selection:bg-amber-950/60"
        />
      </div>

      {/* Footer / Save Button */}
      <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-900/30 flex justify-end">
        {/* Save Button */}
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={handleManualSave}
            className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-800 dark:hover:bg-white transition-colors"
          >
            Save Journal
          </button>
        </div>
      </div>
    </div>
  );
};
