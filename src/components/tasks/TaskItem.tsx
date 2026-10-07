import React, { useState } from 'react';
import { Task } from '../../types';
import { useData } from '../../contexts/DataContext';
import {
  Check,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  showDate?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, showDate = false }) => {
  const { toggleTaskStatus, deleteTask, setTaskPriority } = useData();
  const [showMenu, setShowMenu] = useState(false);

  const isCompleted = task.status === 'completed';

  const priorityStyles = {
    high: 'text-rose-600 dark:text-rose-400',
    medium: 'text-amber-600 dark:text-amber-400',
    low: 'text-stone-500 dark:text-stone-400',
  };

  return (
    <div
      className={`group relative flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-stone-50/60 dark:bg-stone-900/30 border-stone-200/60 dark:border-stone-800/50 opacity-75'
          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-2xs hover:border-stone-300 dark:hover:border-stone-700'
      }`}
    >
      {/* Custom Checkbox */}
      <button
        type="button"
        onClick={() => toggleTaskStatus(task.id)}
        aria-label={isCompleted ? 'Mark pending' : 'Mark completed'}
        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${
          isCompleted
            ? 'bg-amber-600 border-amber-600 text-white dark:bg-amber-600 dark:border-amber-600'
            : 'border-stone-300 dark:border-stone-600 hover:border-amber-600 dark:hover:border-amber-500 bg-white dark:bg-stone-800/80'
        }`}
      >
        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p
            className={`text-sm font-medium transition-all duration-200 leading-snug ${
              isCompleted
                ? 'line-through text-stone-500 dark:text-stone-400'
                : 'text-stone-900 dark:text-stone-100'
            }`}
          >
            {task.title}
          </p>
        </div>

        {task.description && (
          <p
            className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
              isCompleted ? 'text-stone-400 dark:text-stone-500' : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Clean unboxed metadata with typographic separators */}
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-stone-500 dark:text-stone-400 mt-2">
          <span className="font-medium text-stone-700 dark:text-stone-300">{task.category}</span>
          <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
          <span className={`capitalize font-medium ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>

          {task.dueTime && (
            <>
              <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
              <span className="flex items-center gap-1 font-mono tabular-nums">
                <Clock className="w-3 h-3 text-stone-400" />
                {task.dueTime}
              </span>
            </>
          )}

          {showDate && (
            <>
              <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
              <span className="font-mono tabular-nums">{task.dueDate}</span>
            </>
          )}

          {task.notes && (
            <>
              <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
              <span className="italic truncate max-w-[200px]" title={task.notes}>
                Note: {task.notes}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Quick Action Menu */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors opacity-80 group-hover:opacity-100"
          aria-label="Task options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-8 z-40 w-44 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg py-1 text-xs">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(task);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-left transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Task</span>
              </button>

              <div className="px-3.5 py-1.5 border-t border-stone-100 dark:border-stone-800">
                <p className="text-[10px] uppercase font-semibold text-stone-400 dark:text-stone-500 mb-1">
                  Change Priority
                </p>
                <div className="flex items-center gap-1">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setTaskPriority(task.id, p);
                        setShowMenu(false);
                      }}
                      className={`px-2 py-0.5 rounded capitalize text-[11px] ${
                        task.priority === p
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-semibold'
                          : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-stone-100 dark:border-stone-800 pt-1">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    deleteTask(task.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Task</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
