import React from 'react';
import { ActiveTab } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Sun,
  Moon,
  Laptop,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface NavbarProps {
  onSelectTab: (tab: ActiveTab) => void;
  isSidebarExpanded?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectTab,
  isSidebarExpanded = false,
  onToggleSidebar,
}) => {
  const { user } = useAuth();
  const { setTheme, isDark } = useTheme();

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
        {/* Left: Sidebar toggle + Brand wordmark */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={isSidebarExpanded ? 'Collapse sidebar (show icons only)' : 'Expand sidebar'}
              aria-label="Toggle sidebar expansion"
            >
              {isSidebarExpanded ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            onClick={() => onSelectTab('dashboard')}
            className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="w-7 h-7 rounded-lg bg-amber-600 flex items-center justify-center text-white text-sm font-sans font-bold shadow-2xs">
              D
            </span>
            <span>DayFlow</span>
          </button>
        </div>

        {/* Center: Blank (All nav links moved to sidebar as requested) */}
        <div className="flex-1" />

        {/* Right: Only Dark/Light Mode toggle and Profile */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-300 dark:hover:text-stone-100 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title={isDark ? 'Dark mode active · Click to switch to Light mode' : 'Light mode active · Click to switch to Dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-600" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 flex items-center justify-center text-xs font-semibold font-serif ring-1 ring-stone-200 dark:ring-stone-800 hover:ring-amber-500 transition-all ml-1"
            title="Profile & Settings"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </button>
        </div>
      </div>
    </header>
  );
};
