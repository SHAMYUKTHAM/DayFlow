import React from 'react';
import { useData } from '../../contexts/DataContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useData();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 rounded-xl shadow-lg border border-stone-800 dark:border-stone-200 transition-all duration-200 text-sm font-medium"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 dark:text-sky-600 shrink-0" />}
            <span>{toast.text}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-stone-400 hover:text-stone-200 dark:text-stone-500 dark:hover:text-stone-800 p-0.5 rounded transition-colors"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
