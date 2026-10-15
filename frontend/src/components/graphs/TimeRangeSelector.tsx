'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface TimeRangeOption {
  value: string;
  label: string;
  interval: string;
}

const TIME_RANGES: TimeRangeOption[] = [
  { value: '1h', label: '1 Hour', interval: '1m' },
  { value: '6h', label: '6 Hours', interval: '5m' },
  { value: '24h', label: '24 Hours', interval: '15m' },
  { value: '7d', label: '7 Days', interval: '1h' },
  { value: '30d', label: '30 Days', interval: '1d' },
];

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string, interval: string) => void;
  className?: string;
  disabled?: boolean;
}

export function TimeRangeSelector({
  value,
  onChange,
  className,
  disabled = false,
}: TimeRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedRange = TIME_RANGES.find(r => r.value === value) || TIME_RANGES[2];

  return (
    <div className={clsx('relative', className)}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors',
          'bg-white dark:bg-secondary-800',
          'text-secondary-700 dark:text-secondary-300',
          'border-secondary-300 dark:border-secondary-600',
          'hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
          disabled && 'opacity-50 cursor-not-allowed',
          'focus:outline-none focus:ring-2'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedRange.label}</span>
        <svg
          className={clsx('w-4 h-4 text-secondary-400 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-1 w-40 bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-700 shadow-elevated overflow-hidden py-1"
              role="listbox"
            >
              {TIME_RANGES.map(range => (
                <motion.button
                  key={range.value}
                  onClick={() => {
                    onChange(range.value, range.interval);
                    setIsOpen(false);
                  }}
                  disabled={disabled}
                  role="option"
                  aria-selected={value === range.value}
                  className={clsx(
                    'w-full px-3 py-2 text-left text-sm transition-colors',
                    value === range.value
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <span>{range.label}</span>
                    {value === range.value && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TimeRangeSelector;