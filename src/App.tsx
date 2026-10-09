/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider, useData } from './contexts/DataContext';
import { ActiveTab, Task } from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { DiaryView } from './components/diary/DiaryView';
import { PastEntriesView } from './components/diary/PastEntriesView';
import { CalendarView } from './components/calendar/CalendarView';
import { SettingsView } from './components/settings/SettingsView';
import { LandingPage } from './components/landing/LandingPage';
import { TaskModal } from './components/tasks/TaskModal';
import { ToastContainer } from './components/common/Toast';
import { getTodayDateString } from './utils/constants';

function MainApp() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLandingView, setIsLandingView] = useState(() => {
    return window.location.hash !== '#app';
  });

  React.useEffect(() => {
    if (isLandingView) {
      if (window.location.hash === '#app') {
        window.history.replaceState(null, '', ' '); // clean up hash visually
      }
    } else {
      window.location.hash = '#app';
    }
  }, [isLandingView]);

  React.useEffect(() => {
    const handleHashChange = () => {
      setIsLandingView(window.location.hash !== '#app');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('dayflow_sidebar_expanded');
    return saved === 'true'; // Default is false (icon-only mode)
  });

  const handleToggleSidebar = () => {
    setIsSidebarExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('dayflow_sidebar_expanded', String(next));
      return next;
    });
  };

  // Global Task Modal
  const [isGlobalTaskModalOpen, setIsGlobalTaskModalOpen] = useState(false);

  const handleOpenAddTask = () => {
    setIsGlobalTaskModalOpen(true);
  };

  const handleOpenWriteDiary = () => {
    setActiveTab('diary');
  };

  if (isLandingView) {
    return (
      <LandingPage
        onGetStarted={() => setIsLandingView(false)}
        onExploreDemo={() => setIsLandingView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar with Dark/Light toggle and Profile only */}
      <Navbar
        onSelectTab={setActiveTab}
        isSidebarExpanded={isSidebarExpanded}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex w-full pb-16 md:pb-6">
        {/* Desktop / Tablet Sidebar (Icon-only by default, expands on toggle) */}
        <div className="hidden md:block">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenAddTask={handleOpenAddTask}
            onOpenWriteDiary={handleOpenWriteDiary}
            isExpanded={isSidebarExpanded}
            onToggleExpand={handleToggleSidebar}
          />
        </div>

        {/* Content Viewport Frame */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView onNavigate={setActiveTab} />
          )}

          {activeTab === 'tasks' && <TasksView />}

          {activeTab === 'diary' && (
            <DiaryView onNavigateToHistory={() => setActiveTab('past-entries')} />
          )}

          {activeTab === 'past-entries' && (
            <PastEntriesView onWriteToday={() => setActiveTab('diary')} />
          )}

          {activeTab === 'calendar' && <CalendarView />}

          {activeTab === 'settings' && (
            <SettingsView onViewLandingPage={() => setIsLandingView(true)} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (adheres to 15% sticky cap) */}
      <MobileNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Global Task Creation Modal */}
      <TaskModal
        isOpen={isGlobalTaskModalOpen}
        onClose={() => setIsGlobalTaskModalOpen(false)}
        defaultDate={getTodayDateString()}
      />

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DataProvider>
          <MainApp />
        </DataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
