import { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  dotColor?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'md', dot = false, dotColor, className, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center gap-1.5 font-medium rounded-full';

    const variantClasses = {
      default: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300',
      primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
      success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300',
      warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300',
      danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300',
      secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-300',
      outline: 'border border-secondary-300 bg-transparent text-secondary-700 dark:border-secondary-600 dark:text-secondary-300',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    };

    const dotClasses = 'w-1.5 h-1.5 rounded-full flex-shrink-0';

    return (
      <span
        ref={ref}
        className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {dot && (
          <span className={clsx(dotClasses, dotColor || '')} style={{ backgroundColor: dotColor }} />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;