import React from 'react';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Calendar,
  History,
} from 'lucide-react';

interface MobileNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onSelectTab }) => {
  const items: { tab: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
    { tab: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { tab: 'diary', label: 'Diary', icon: <BookOpen className="w-4 h-4" /> },
    { tab: 'past-entries', label: 'Past', icon: <History className="w-4 h-4" /> },
    { tab: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-50/95 dark:bg-stone-950/95 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 px-2 py-1.5 flex items-center justify-around h-14">
      {items.map((item) => {
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            onClick={() => onSelectTab(item.tab)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-lg transition-colors ${
              isActive
                ? 'text-amber-600 dark:text-amber-500 font-semibold'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
