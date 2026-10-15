import { forwardRef, useId, InputHTMLAttributes } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({
    label,
    description,
    size = 'md',
    disabled = false,
    error = false,
    className,
    id: providedId,
    ...props
  }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const labelId = `${id}-label`;
    const descriptionId = `${id}-description`;

    const sizeClasses = {
      sm: 'w-8 h-5',
      md: 'w-11 h-6',
      lg: 'w-14 h-7',
    };

    const thumbSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const thumbTranslateClasses = {
      sm: 'translate-x-3',
      md: 'translate-x-5',
      lg: 'translate-x-7',
    };

    return (
      <div className={clsx('flex items-start gap-3', className)}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            disabled={disabled}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            aria-invalid={error}
            className="peer absolute opacity-0 w-0 h-0"
            {...props}
          />
          <label
            htmlFor={id}
            className={clsx(
              'relative inline-flex items-center cursor-pointer transition-colors',
              disabled && 'opacity-50 cursor-not-allowed',
              sizeClasses[size]
            )}
          >
            <motion.div
              className={clsx(
                'relative rounded-full border-2 transition-all duration-200',
                'bg-secondary-200 border-secondary-300 dark:bg-secondary-700 dark:border-secondary-600',
                'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2',
                'peer-checked:bg-primary-600 peer-checked:border-primary-600',
                error && 'peer-checked:bg-danger-600 peer-checked:border-danger-600',
                disabled && 'peer-checked:opacity-50'
              )}
            >
              <motion.div
                className={clsx(
                  'absolute top-1/2 left-1 rounded-full bg-white shadow-lg transition-transform duration-200 ease-out',
                  'peer-checked:translate-x-full',
                  thumbSizeClasses[size],
                  thumbTranslateClasses[size]
                )}
                animate={{
                  x: 0,
                  scale: 1,
                }}
              />
            </motion.div>
          </label>
        </div>

        {(label || description) && (
          <div className="flex flex-col justify-center">
            {label && (
              <label id={labelId} htmlFor={id} className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                {label}
              </label>
            )}
            {description && (
              <p id={descriptionId} className="text-sm text-secondary-500 dark:text-secondary-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

export default Toggle;