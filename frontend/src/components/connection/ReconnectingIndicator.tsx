'use client';

import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, RotateCcw, X, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { useUIStore } from '../../store/uiStore';

interface ReconnectingIndicatorProps {
  attempts: number;
  maxAttempts: number;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function ReconnectingIndicator({
  attempts,
  maxAttempts,
  onDismiss,
  onRetry,
  className,
}: ReconnectingIndicatorProps) {
  const { connectionStatus } = useUIStore();

  if (connectionStatus !== 'connecting' && connectionStatus !== 'disconnected') {
    return null;
  }

  const progress = Math.min(attempts / maxAttempts, 1);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 bg-warning-600 text-white px-4 py-3',
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.div>
            <div>
              <p className="font-medium">
                {connectionStatus === 'connecting' ? 'Reconnecting...' : 'Connection Lost'}
              </p>
              <p className="text-sm opacity-90">
                {connectionStatus === 'connecting'
                  ? `Attempt ${attempts} of ${maxAttempts}`
                  : 'Attempting to reconnect...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            {onRetry && (
              <motion.button
                onClick={onRetry}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                Retry Now
              </motion.button>
            )}
            {onDismiss && (
              <motion.button
                onClick={onDismiss}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Progress bar at top */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ transformOrigin: 'left' }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export default ReconnectingIndicator;