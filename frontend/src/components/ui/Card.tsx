import { forwardRef, HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', padding = 'md', hover = false, className, ...props }, ref) => {
    const baseClasses = 'rounded-xl transition-all duration-200';

    const variantClasses = {
      default: 'bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 shadow-card',
      elevated: 'bg-white dark:bg-secondary-900 shadow-elevated',
      outlined: 'bg-transparent border-2 border-secondary-200 dark:border-secondary-700',
      glass: 'bg-white/80 dark:bg-secondary-900/80 backdrop-blur-lg border border-secondary-200/50 dark:border-secondary-700/50 shadow-card',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const hoverClasses = hover ? 'hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer' : '';

    return (
      <div
        ref={ref}
        className={clsx(baseClasses, variantClasses[variant], paddingClasses[padding], hoverClasses, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={clsx('mb-4', className)} {...props}>
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className, ...props }, ref) => (
    <h3 ref={ref} className={clsx('text-lg font-semibold text-secondary-900 dark:text-secondary-100', className)} {...props}>
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...props }, ref) => (
    <p ref={ref} className={clsx('text-sm text-secondary-500 dark:text-secondary-400 mt-1', className)} {...props}>
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={clsx('', className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={clsx('mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700 flex items-center gap-2', className)} {...props}>
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

export default Card;