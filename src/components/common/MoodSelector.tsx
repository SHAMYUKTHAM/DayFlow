import React from 'react';
import { MoodType } from '../../types';
import { DEFAULT_MOODS } from '../../utils/constants';

interface MoodSelectorProps {
  currentMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  currentMood,
  onSelectMood,
  size = 'md',
  compact = false,
}) => {
  const moods = Object.values(DEFAULT_MOODS);

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-100 dark:bg-stone-900/60 rounded-xl border border-stone-200/70 dark:border-stone-800">
      {moods.map((m) => {
        const isSelected = currentMood === m.type;
        return (
          <button
            key={m.type}
            type="button"
            onClick={() => onSelectMood(m.type)}
            className={`flex items-center gap-1.5 rounded-lg transition-all duration-150 font-medium ${
              size === 'sm'
                ? 'px-2 py-1 text-xs'
                : size === 'lg'
                ? 'px-3.5 py-2 text-sm'
                : 'px-2.5 py-1.5 text-xs'
            } ${
              isSelected
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm ring-1 ring-stone-950/5 dark:ring-white/10'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
            }`}
            title={`Set mood: ${m.label}`}
          >
            <span className="text-base leading-none select-none">{m.emoji}</span>
            {!compact && <span className="whitespace-nowrap">{m.label}</span>}
          </button>
        );
      })}
    </div>
  );
};
