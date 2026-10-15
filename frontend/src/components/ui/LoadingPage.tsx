'use client';

import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12"
        >
          <Loader2 className="w-12 h-12 text-primary-600 dark:text-primary-400" />
        </motion.div>
        <p className="text-secondary-600 dark:text-secondary-400 font-medium">Loading...</p>
      </motion.div>
    </div>
  );
}

export default LoadingPage;