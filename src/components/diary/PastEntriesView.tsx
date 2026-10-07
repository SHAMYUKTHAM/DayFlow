import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { DEFAULT_MOODS, formatDateLabel, formatShortDate, getAutoFilledDateParts, getTodayDateString } from '../../utils/constants';
import { DiaryEntry, MoodType } from '../../types';
import {
  BookOpen,
  Search,
  Calendar,
  Tag,
  X,
  FileText,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface PastEntriesViewProps {
  onWriteToday: () => void;
}

export const PastEntriesView: React.FC<PastEntriesViewProps> = ({ onWriteToday }) => {
  const { diaryEntries } = useData();
  const today = getTodayDateString();

  // Only showcase past history (excludes today's "Clear Progress" / in-progress entry)
  const pastEntries = useMemo(() => {
    return diaryEntries.filter((d) => d.date !== today);
  }, [diaryEntries, today]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [activeEntry, setActiveEntry] = useState<DiaryEntry | null>(() => {
    return pastEntries.length > 0 ? pastEntries[0] : null;
  });

  // Unique tags from past entries
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    pastEntries.forEach((entry) => {
      entry.tags?.forEach((t) => tagsSet.add(t));
    });
    return Array.from(tagsSet);
  }, [pastEntries]);

  // Filtered entries (strictly past history)
  const filteredEntries = useMemo(() => {
    return pastEntries.filter((entry) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = entry.title?.toLowerCase().includes(query);
        const matchesContent = entry.content?.toLowerCase().includes(query);
        const matchesTags = entry.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesDate = entry.date.includes(query);
        if (!matchesTitle && !matchesContent && !matchesTags && !matchesDate) return false;
      }

      if (selectedMoodFilter !== 'all' && entry.mood !== selectedMoodFilter) {
        return false;
      }

      if (selectedTagFilter !== 'all' && !entry.tags?.includes(selectedTagFilter)) {
        return false;
      }

      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [pastEntries, searchQuery, selectedMoodFilter, selectedTagFilter]);

  const activeEntryDateParts = activeEntry ? getAutoFilledDateParts(activeEntry.date) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-stone-200/80 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
            Past Journal Entries & Archives
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Browse, search, and revisit your previous days and reflections.
          </p>
        </div>

        <button
          onClick={onWriteToday}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-xl shadow-xs transition-colors shrink-0"
        >
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span>Write Today's Memories</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past memories by title, text, tags or date (e.g. 2026-09-25)..."
              className="w-full pl-9 pr-9 py-2 text-xs bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mood Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMoodFilter}
              onChange={(e) => setSelectedMoodFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="all">All Moods</option>
              {Object.values(DEFAULT_MOODS).map((m) => (
                <option key={m.type} value={m.type}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <select
                value={selectedTagFilter}
                onChange={(e) => setSelectedTagFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-300 focus:outline-none"
              >
                <option value="all">All Tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1 pt-1 border-t border-stone-100 dark:border-stone-800">
          <span>
            Showing <span className="font-semibold text-stone-800 dark:text-stone-200 font-mono tabular-nums">{filteredEntries.length}</span> past journal {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </span>
          {(searchQuery || selectedMoodFilter !== 'all' || selectedTagFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMoodFilter('all');
                setSelectedTagFilter('all');
              }}
              className="text-amber-700 dark:text-amber-400 hover:underline text-xs"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Two Column Layout: Entry Cards Grid & Full Reading Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Entries list (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => {
              const isSelected = activeEntry?.id === entry.id;
              const moodObj = entry.mood ? DEFAULT_MOODS[entry.mood] : null;
              const dateParts = getAutoFilledDateParts(entry.date);
              const plainPreview = entry.content.replace(/<[^>]*>/g, '').trim();

              return (
                <div
                  key={entry.id}
                  onClick={() => setActiveEntry(entry)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-xs ring-1 ring-amber-400/20'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  {/* Date, Day, Year auto-filled indicators */}
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5 font-mono text-stone-600 dark:text-stone-400">
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        {dateParts.dayOfWeek}
                      </span>
                      <span>·</span>
                      <span>
                        {dateParts.monthName} {dateParts.dayNumber}, {dateParts.year}
                      </span>
                    </div>

                    {moodObj && (
                      <span className="flex items-center gap-1 text-xs" title={moodObj.label}>
                        <span>{moodObj.emoji}</span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">{moodObj.label}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">
                    {entry.title || 'Untitled Journal Entry'}
                  </h3>

                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                    {plainPreview || 'No content written...'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                    <span>{entry.wordCount || 0} words</span>
                    {entry.tags && entry.tags.length > 0 && (
                      <span className="truncate max-w-[180px]">{entry.tags.join(' ')}</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 px-4 bg-white dark:bg-stone-900 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-xs text-stone-500">
              No journal entries found matching your query.
            </div>
          )}
        </div>

        {/* Reading Preview Panel (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
          {activeEntry ? (
            <>
              {/* Auto-filled Date, Day, Year Header */}
              <div className="border-b border-stone-100 dark:border-stone-800 pb-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-xs font-mono font-semibold text-stone-700 dark:text-stone-300">
                      {activeEntryDateParts?.dayOfWeek}
                    </span>
                    <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                      {activeEntryDateParts?.monthName} {activeEntryDateParts?.dayNumber}, {activeEntryDateParts?.year}
                    </span>
                  </div>

                  {activeEntry.mood && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-xs font-medium">
                      <span>{DEFAULT_MOODS[activeEntry.mood]?.emoji}</span>
                      <span>{DEFAULT_MOODS[activeEntry.mood]?.label}</span>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
                  {activeEntry.title || 'Untitled Journal Entry'}
                </h2>

                <div className="flex items-center gap-3 text-xs text-stone-400">
                  <span>{activeEntry.wordCount || 0} words</span>
                  <span>·</span>
                  <span>{Math.max(1, Math.ceil((activeEntry.wordCount || 0) / 200))} min read</span>
                </div>
              </div>

              {/* Journal Content */}
              <div
                className="journal-content text-stone-800 dark:text-stone-200 leading-relaxed font-serif text-base min-h-[220px]"
                dangerouslySetInnerHTML={{ __html: activeEntry.content }}
              />

              {/* Tags footer */}
              {activeEntry.tags && activeEntry.tags.length > 0 && (
                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2 flex-wrap text-xs text-stone-500">
                  <Tag className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-semibold">Tags:</span>
                  {activeEntry.tags.map((tag) => (
                    <span key={tag} className="font-mono text-stone-600 dark:text-stone-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-xs text-stone-400">
              Select an entry on the left to read full memories.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
