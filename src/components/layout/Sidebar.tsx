import React from 'react';
import { ActiveTab } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Calendar,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  History,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddTask?: () => void;
  onOpenWriteDiary?: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isExpanded,
  onToggleExpand,
}) => {
  const { user } = useAuth();

  const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode; isPrimary?: boolean }[] = [
    {
      tab: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
      isPrimary: true,
    },
    {
      tab: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-5 h-5 shrink-0" />,
    },
    {
      tab: 'diary',
      label: "Today's Diary",
      icon: <BookOpen className="w-5 h-5 shrink-0" />,
    },
    {
      tab: 'past-entries',
      label: 'Past Entries',
      icon: <History className="w-5 h-5 shrink-0" />,
    },
    {
      tab: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-5 h-5 shrink-0" />,
    },
    {
      tab: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5 shrink-0" />,
    },
  ];

  return (
    <aside
      className={`bg-stone-50 dark:bg-stone-950 border-r border-stone-200/80 dark:border-stone-800 flex flex-col justify-between p-3 shrink-0 min-h-[calc(100vh-3.75rem)] transition-all duration-200 ease-in-out ${
        isExpanded ? 'w-64' : 'w-18'
      }`}
    >
      <div className="space-y-4">
        {/* Toggle Expand/Collapse Header Button */}
        <div className={`flex items-center ${isExpanded ? 'justify-between px-2' : 'justify-center'} pb-1`}>
          {isExpanded && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 font-mono">
              Menu
            </span>
          )}
          <button
            onClick={onToggleExpand}
            className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            title={isExpanded ? 'Collapse to icon-only mode' : 'Expand sidebar to show labels'}
            aria-label="Toggle sidebar collapse"
          >
            {isExpanded ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {isExpanded && (
            <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1.5 font-mono">
              Navigation
            </p>
          )}

          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => onSelectTab(item.tab)}
                title={item.label}
                className={`relative flex items-center rounded-xl transition-all ${
                  isExpanded
                    ? 'w-full gap-3 px-3 py-2 text-xs font-medium'
                    : 'w-11 h-11 mx-auto justify-center'
                } ${
                  isActive
                    ? 'bg-amber-100/70 dark:bg-amber-950/60 text-stone-900 dark:text-stone-100 font-semibold shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-900'
                }`}
              >
                <span>{item.icon}</span>

                {isExpanded ? (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.isPrimary && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-500" />
                    )}
                  </>
                ) : (
                  isActive && (
                    <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-500" />
                  )
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile footer */}
      <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800">
        <button
          onClick={() => onSelectTab('settings')}
          title={`Profile & Settings: ${user?.name || 'Shamyuktha'}`}
          className={`flex items-center rounded-xl hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors ${
            isExpanded ? 'w-full gap-3 p-1.5 text-left' : 'w-11 h-11 mx-auto justify-center'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 flex items-center justify-center text-xs font-semibold font-serif shrink-0 ring-1 ring-stone-200 dark:ring-stone-800">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                {user?.name || 'Shamyuktha'}
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                {user?.role || 'Student & Developer'}
              </p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
