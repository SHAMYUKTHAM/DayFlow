import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatDateLabel, formatShortDate, getTodayDateString } from '../../utils/constants';
import { SpecialMomentModal } from './SpecialMomentModal';
import { PhotoLightbox } from './PhotoLightbox';
import { SpecialMoment, SpecialDayType } from '../../types';
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  Plus,
  Calendar as CalendarIcon,
  MapPin,
  Tag,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Heart,
  Award,
  Plane,
  PartyPopper,
  BookOpen,
  CheckCircle2,
  Star,
  ExternalLink,
} from 'lucide-react';

interface CalendarDayItem {
  isCurrentMonth: boolean;
  date: string;
  dayNumber?: number;
  moments: SpecialMoment[];
  isSpecialDay: boolean;
  hasPhoto: boolean;
  firstPhotoUrl?: string;
  firstPhotoTitle?: string;
  topEmoji?: string | null;
  hasDiary: boolean;
  tasksCount: number;
}

export const CalendarView: React.FC = () => {
  const {
    tasks,
    diaryEntries,
    specialMoments,
    deleteSpecialMoment,
    getDailyOverview,
  } = useData();

  const today = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // Month navigation: default to September 2026 or current month
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const [y] = today.split('-').map(Number);
    return y || 2026;
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const [, m] = today.split('-').map(Number);
    return (m || 9) - 1; // 0-indexed
  });

  // Filter for calendar view
  const [momentFilter, setMomentFilter] = useState<
    'all' | 'special-only' | 'with-photos' | 'celebration' | 'milestone' | 'trip'
  >('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modals state
  const [isMomentModalOpen, setIsMomentModalOpen] = useState(false);
  const [momentToEdit, setMomentToEdit] = useState<SpecialMoment | null>(null);
  const [lightboxMoment, setLightboxMoment] = useState<SpecialMoment | null>(null);

  // Calendar days grid computation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday

    const days: CalendarDayItem[] = [];

    // Previous month padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        isCurrentMonth: false,
        date: '',
        moments: [],
        isSpecialDay: false,
        hasPhoto: false,
        hasDiary: false,
        tasksCount: 0,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

      const dayMoments = specialMoments.filter((m) => m.date === dateStr);
      const isSpecialDay = dayMoments.some(
        (m) =>
          m.isSpecialDay ||
          m.type === 'birthday' ||
          m.type === 'anniversary' ||
          m.type === 'milestone'
      );
      const momentsWithPhotos = dayMoments.filter((m) => !!m.photoUrl);
      const firstPhotoMoment = momentsWithPhotos.length > 0 ? momentsWithPhotos[0] : null;

      const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
      const diary = diaryEntries.find((de) => de.date === dateStr);

      days.push({
        isCurrentMonth: true,
        dayNumber: d,
        date: dateStr,
        moments: dayMoments,
        isSpecialDay,
        hasPhoto: !!firstPhotoMoment,
        firstPhotoUrl: firstPhotoMoment?.photoUrl,
        firstPhotoTitle: firstPhotoMoment?.title,
        topEmoji: dayMoments[0]?.emoji || (isSpecialDay ? '✨' : null),
        hasDiary: !!diary && (diary.content?.trim().length > 0 || !!diary.mood),
        tasksCount: dayTasks.length,
      });
    }

    return days;
  }, [currentYear, currentMonth, specialMoments, tasks, diaryEntries]);

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const [y, m] = today.split('-').map(Number);
    setCurrentYear(y || 2026);
    setCurrentMonth((m || 9) - 1);
    setSelectedDate(today);
  };

  // Selected date's moments & overview
  const selectedMoments = useMemo(() => {
    return specialMoments.filter((m) => m.date === selectedDate);
  }, [specialMoments, selectedDate]);

  const selectedIsSpecialDay = useMemo(() => {
    return selectedMoments.some((m) => m.isSpecialDay || m.type === 'birthday' || m.type === 'anniversary' || m.type === 'milestone');
  }, [selectedMoments]);

  const selectedOverview = useMemo(() => {
    return getDailyOverview(selectedDate);
  }, [selectedDate, getDailyOverview]);

  // Total stats for the month
  const monthStats = useMemo(() => {
    const currentMonthMoments = specialMoments.filter((m) => {
      const [y, mon] = m.date.split('-').map(Number);
      return y === currentYear && mon === currentMonth + 1;
    });

    const specialDaysCount = currentMonthMoments.filter((m) => m.isSpecialDay).length;
    const photosCount = currentMonthMoments.filter((m) => !!m.photoUrl).length;

    return {
      totalMoments: currentMonthMoments.length,
      specialDaysCount,
      photosCount,
    };
  }, [specialMoments, currentYear, currentMonth]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header: Focused on Special Days & Memorable Moments */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
            Special Moments Calendar
          </h1>
        </div>

        {/* Action Buttons: Filter & Month Navigator */}
        <div className="flex flex-wrap items-center gap-2.5 relative">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl shadow-2xs transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="py-1">
                  {[
                    { id: 'all', label: 'All Days', icon: null },
                    { id: 'special-only', label: 'Special Days Only', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
                    { id: 'with-photos', label: 'With Photos', icon: <Camera className="w-3.5 h-3.5 text-amber-500" /> },
                    { id: 'celebration', label: '🎂 Birthdays & Celebrations', icon: null },
                    { id: 'milestone', label: '🏆 Milestones', icon: null },
                    { id: 'trip', label: '✈️ Trips', icon: null },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setMomentFilter(f.id as any);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ${
                        momentFilter === f.id ? 'bg-stone-50 dark:bg-stone-800/50 font-semibold' : ''
                      }`}
                    >
                      {f.icon}
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToToday}
              className="px-2 py-1 text-xs font-serif font-semibold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg min-w-[120px] text-center"
              title="Click to jump to Today"
            >
              {monthName}
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>


      {/* Main Grid: Calendar on Left (7 cols), Selected Day Moments Deep-Dive on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-2xs space-y-3">
          {/* Day of week labels */}
          <div className="grid grid-cols-7 text-center pb-2 border-b border-stone-100 dark:border-stone-800 text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((d, index) => {
              if (!d.isCurrentMonth) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[82px] rounded-xl bg-stone-50/30 dark:bg-stone-950/20 opacity-30 border border-transparent"
                  />
                );
              }

              const isSelected = d.date === selectedDate;
              const isToday = d.date === today;

              // Check if day satisfies filter
              let matchesFilter = true;
              if (momentFilter === 'special-only') {
                matchesFilter = d.isSpecialDay;
              } else if (momentFilter === 'with-photos') {
                matchesFilter = d.hasPhoto;
              } else if (momentFilter === 'celebration') {
                matchesFilter = d.moments.some((m) => m.type === 'birthday' || m.type === 'celebration' || m.type === 'anniversary');
              } else if (momentFilter === 'milestone') {
                matchesFilter = d.moments.some((m) => m.type === 'milestone' || m.type === 'achievement');
              } else if (momentFilter === 'trip') {
                matchesFilter = d.moments.some((m) => m.type === 'trip');
              }

              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => setSelectedDate(d.date!)}
                  className={`min-h-[82px] p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 relative overflow-hidden group ${
                    isSelected
                      ? 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-500 dark:border-amber-600 ring-2 ring-amber-500/25 shadow-xs'
                      : d.isSpecialDay
                      ? 'bg-gradient-to-b from-amber-50/60 to-white dark:from-amber-950/30 dark:to-stone-900 border-amber-300/80 dark:border-amber-800/80 shadow-2xs hover:border-amber-400'
                      : isToday
                      ? 'bg-stone-100/70 dark:bg-stone-800/60 border-stone-300 dark:border-stone-700'
                      : 'bg-white dark:bg-stone-900/60 border-stone-200/70 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  } ${!matchesFilter ? 'opacity-35 saturate-50' : 'opacity-100'}`}
                >
                  {/* Top Bar: Date Number & Special Day / Emoji Badge */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-semibold font-mono tabular-nums ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs'
                          : isSelected
                          ? 'text-amber-950 dark:text-amber-200 font-bold'
                          : d.isSpecialDay
                          ? 'text-amber-800 dark:text-amber-300 font-bold'
                          : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {d.dayNumber}
                    </span>

                    {/* Emoji indicator */}
                    {d.topEmoji && (
                      <span className="text-xs animate-in zoom-in-50" title="Special moment recorded">
                        {d.topEmoji}
                      </span>
                    )}
                  </div>

                  {/* Middle / Photo Thumbnail preview if present */}
                  {d.hasPhoto && d.firstPhotoUrl ? (
                    <div className="my-0.5 w-full h-8 rounded-lg overflow-hidden border border-black/10 dark:border-white/10 relative shadow-2xs">
                      <img
                        src={d.firstPhotoUrl}
                        alt="Moment thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />
                    </div>
                  ) : d.isSpecialDay ? (
                    <div className="my-0.5 px-1 py-0.5 rounded bg-amber-100/80 dark:bg-amber-950/70 text-[9px] font-semibold text-amber-900 dark:text-amber-200 truncate">
                      {d.moments[0]?.title || 'Special Day'}
                    </div>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {/* Bottom: Moments count & Diary indicator */}
                  <div className="flex items-center justify-between gap-1 w-full text-[10px] pt-0.5">
                    {d.moments.length > 0 ? (
                      <span className="font-mono text-[9px] font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        {d.moments.length}
                      </span>
                    ) : (
                      <span />
                    )}

                    {d.hasDiary && (
                      <span
                        className="text-stone-400 dark:text-stone-500"
                        title="Diary written on this day"
                      >
                        <BookOpen className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>


        </div>

        {/* Right Column: Selected Day Deep-Dive (Moments, Photos & Notes) (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-2xs space-y-4">
            {/* Date Headline */}
            <div className="pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 font-mono">
                  {selectedDate === today ? 'Today · Selected Date' : 'Selected Date'}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setMomentToEdit(null);
                    setIsMomentModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-dashed border-amber-400 dark:border-amber-700 hover:border-amber-600 dark:hover:border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-900 dark:text-amber-200 text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Plus className="w-3 h-3 text-amber-600" />
                  Mark Special Day
                </button>
              </div>

              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif-heading mt-1">
                {formatDateLabel(selectedDate)}
              </h2>
            </div>


            {/* List of Special Moments & Photos on this date */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                <span>Moments & Memories ({selectedMoments.length})</span>
              </div>

              {selectedMoments.length > 0 ? (
                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {selectedMoments.map((moment) => (
                    <div
                      key={moment.id}
                      className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 space-y-3 shadow-2xs transition-all hover:border-stone-300"
                    >
                      {/* Moment Photo (Click to open Lightbox) */}
                      {moment.photoUrl && (
                        <div
                          onClick={() => setLightboxMoment(moment)}
                          className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 max-h-52 bg-stone-950 group cursor-pointer shadow-2xs"
                        >
                          <img
                            src={moment.photoUrl}
                            alt={moment.title}
                            className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                          {/* Hover Lightbox Indicator */}
                          <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium flex items-center gap-1 opacity-90 group-hover:opacity-100">
                            <ExternalLink className="w-3 h-3" />
                            <span>Enlarge</span>
                          </div>

                          {moment.photoCaption && (
                            <div className="absolute bottom-2 left-3 right-3 text-white text-[11px] font-serif italic truncate">
                              "{moment.photoCaption}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Title & Category Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base">{moment.emoji || '⭐'}</span>
                            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm font-serif-heading">
                              {moment.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                            <span className="capitalize px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                              {moment.type}
                            </span>
                            {moment.location && (
                              <span className="flex items-center gap-1 text-stone-500">
                                <MapPin className="w-3 h-3 text-rose-500" />
                                {moment.location}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions: Edit & Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setMomentToEdit(moment);
                              setIsMomentModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            title="Edit this moment"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSpecialMoment(moment.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            title="Delete this moment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Special Note / Story */}
                      {moment.note && (
                        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans bg-white dark:bg-stone-900/60 p-3 rounded-xl border border-stone-100 dark:border-stone-800/80">
                          {moment.note}
                        </p>
                      )}

                      {/* Tags */}
                      {moment.tags && moment.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {moment.tags.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-600 dark:text-stone-400 font-mono"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 mx-auto flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    No special notes or moments yet
                  </p>
                  <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                    Mark this day as special, jot down a memory, and attach a photograph to look back on.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Special Moment Modal (Add / Edit) */}
      <SpecialMomentModal
        isOpen={isMomentModalOpen}
        onClose={() => {
          setIsMomentModalOpen(false);
          setMomentToEdit(null);
        }}
        defaultDate={selectedDate}
        momentToEdit={momentToEdit}
      />

      {/* Photo Lightbox */}
      <PhotoLightbox
        moment={lightboxMoment}
        onClose={() => setLightboxMoment(null)}
      />
    </div>
  );
};
