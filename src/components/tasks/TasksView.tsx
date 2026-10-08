import React, { useState, useMemo } from 'react';
import { Priority, Task, TaskStatus } from '../../types';
import { useData } from '../../contexts/DataContext';
import { TaskItem } from './TaskItem';
import { TaskModal } from './TaskModal';
import {
  Plus,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpDown,
  X,
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const { tasks, categories } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'createdAt'>('dueDate');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        const matchesNotes = task.notes?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesNotes) return false;
      }

      // Category
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      // Priority
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'completed' && task.status !== 'completed') return false;
        if (selectedStatus === 'pending' && task.status !== 'pending') return false;
        if (selectedStatus === 'in_progress' && task.status !== 'in_progress') return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dateDiff = a.dueDate.localeCompare(b.dueDate);
        if (dateDiff !== 0) return dateDiff;
        return (a.dueTime || '').localeCompare(b.dueTime || '');
      }
      if (sortBy === 'priority') {
        const order: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [tasks, searchQuery, selectedCategory, selectedPriority, selectedStatus, sortBy]);

  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };
  }, [tasks]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
            Tasks & Action Items
          </h1>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, description or notes..."
              className="w-full pl-9 pr-9 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all text-stone-900 dark:text-stone-100"
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

          <button
            onClick={handleAddNew}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-xl shadow-xs transition-colors shrink-0 min-h-[34px] h-full"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        </div>

        {/* Secondary Filter Row: Status Tabs & Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200/70 dark:border-stone-800">
            {[
              { id: 'all', label: 'All', count: counts.all },
              { id: 'pending', label: 'Pending', count: counts.pending },
              { id: 'in_progress', label: 'In Progress', count: counts.in_progress },
              { id: 'completed', label: 'Completed', count: counts.completed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedStatus === tab.id
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono text-[11px] opacity-60 tabular-nums">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort Alphabetically</option>
              <option value="createdAt">Sort by Recent</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs max-h-[500px] overflow-y-auto">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={handleEdit}
              showDate={true}
            />
          ))
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Your day is wide open ✨
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1 mb-5">
              {searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all'
                ? 'No tasks match your selected filter criteria. Try clearing search or filters.'
                : 'Add your first task and start planning your accomplishments.'}
            </p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};
