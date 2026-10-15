'use client';

import { motion } from 'motion/react';
import { Play, Pause, Stop, Clock, AlertTriangle, CheckCircle, X, Plus, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Slider } from '../ui/Slider';

interface PumpOverrideProps {
  isRunning: boolean;
  remainingTime?: number;
  defaultDuration: number;
  onStart: (duration: number) => void;
  onStop: () => void;
  onDurationChange: (duration: number) => void;
  className?: string;
}

export function PumpOverride({
  isRunning,
  remainingTime,
  defaultDuration,
  onStart,
  onStop,
  onDurationChange,
  className,
}: PumpOverrideProps) {
  const [duration, setDuration] = useState(defaultDuration);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStart = () => {
    onStart(duration);
    setShowConfirm(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={clsx(className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            isRunning ? 'bg-success-100 dark:bg-success-900/30' : 'bg-secondary-100 dark:bg-secondary-800'
          )}>
            {isRunning ? (
              <Pause className="w-6 h-6 text-success-600 dark:text-success-400" />
            ) : (
              <Play className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">Pump Override</h3>
            <p className="text-sm text-secondary-600 dark:text-secondary-400">
              Manual pump control with timed operation
            </p>
          </div>
        </div>
        {isRunning && remainingTime !== undefined && (
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 bg-success-100 dark:bg-success-900/30 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Clock className="w-4 h-4 text-success-600 dark:text-success-400" />
            <span className="font-mono font-semibold text-success-700 dark:text-success-300">
              {formatTime(remainingTime)}
            </span>
            <span className="text-xs text-success-600 dark:text-success-400">remaining</span>
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        {/* Duration Selector */}
        <div>
          <label className="label">Duration (seconds)</label>
          <Slider
            min={5}
            max={300}
            step={5}
            value={duration}
            onChange={value => {
              setDuration(value);
              onDurationChange(value);
            }}
            showValue
            valueFormat={val => `${val}s`}
            disabled={isRunning}
          />
          <div className="flex gap-2 mt-2">
            {[15, 30, 60, 120, 180, 300].map(d => (
              <Button
                key={d}
                variant={duration === d ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setDuration(d);
                  onDurationChange(d);
                }}
                disabled={isRunning}
              >
                {d}s
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Duration Input */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDuration = Math.max(5, duration - 30);
              setDuration(newDuration);
              onDurationChange(newDuration);
            }}
            disabled={isRunning || duration <= 5}
            leftIcon={<Minus className="w-4 h-4" />}
          >
            -30s
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDuration = Math.min(300, duration + 30);
              setDuration(newDuration);
              onDurationChange(newDuration);
            }}
            disabled={isRunning || duration >= 300}
            leftIcon={<Plus className="w-4 h-4" />}
            className="ml-auto"
          >
            +30s
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {isRunning ? (
            <>
              <Button
                variant="danger"
                size="lg"
                className="flex-1"
                onClick={onStop}
                leftIcon={<Stop className="w-4 h-4" />}
              >
                Stop Pump
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowConfirm(true)}
                leftIcon={<AlertTriangle className="w-4 h-4" />}
              >
                Extend Time
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleStart}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Start Pump for {duration}s
            </Button>
          )}
        </div>

        {/* Safety Notice */}
        <div className="flex items-start gap-3 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800">
          <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-warning-800 dark:text-warning-200">
            <p className="font-medium">Safety Notice</p>
            <p className="mt-1">
              Pump will automatically stop after the set duration. Ensure proper water level before starting.
              Emergency stop is available in the main control panel.
            </p>
          </div>
        </div>

        {/* Extend Time Confirmation */}
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
          >
            <div className="flex items-center gap-2 text-sm text-primary-700 dark:text-primary-300 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Extend pump runtime?</span>
            </div>
            <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">
              This will add the current duration to the remaining time.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={() => { onStart(duration); setShowConfirm(false); }}>
                Extend by {duration}s
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}

import { useState } from 'react';

export default PumpOverride;