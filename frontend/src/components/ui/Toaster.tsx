'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { clsx } from 'clsx';

export function Toaster() {
  const { toasts, removeToast } = useUIStore();

  return (
    <AnimatePresence>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={removeToast}
        />
      ))}
    </AnimatePresence>
  );
}

function Toast({ toast, onClose }: { toast: any; onClose: (id: string) => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(toast.id), 200);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-success-600',
    error: 'bg-danger-600',
    warning: 'bg-warning-600',
    info: 'bg-primary-600',
  };

  const Icon = icons[toast.type] || Info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'fixed bottom-4 right-4 z-50 max-w-sm w-full',
        colors[toast.type],
        'text-white rounded-lg shadow-lg p-4 flex items-start gap-3'
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onClose(toast.id), 200); }}
        className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

import { useState } from 'react';