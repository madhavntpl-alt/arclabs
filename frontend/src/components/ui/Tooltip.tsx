import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + gap;
        break;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, { passive: true });
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  const tooltipContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={tooltipRef}
          className={clsx(
            'absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-secondary-900 dark:bg-secondary-50 rounded-lg shadow-lg pointer-events-none',
            className
          )}
          style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
          initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          role="tooltip"
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const triggerElement = children.props as { onMouseEnter?: () => void; onMouseLeave?: () => void; onFocus?: () => void; onBlur?: () => void };

  const enhancedChildren = {
    ...children,
    props: {
      ...children.props,
      ref: triggerRef,
      onMouseEnter: (e: React.MouseEvent) => {
        showTooltip();
        triggerElement.onMouseEnter?.(e);
      },
      onMouseLeave: (e: React.MouseEvent) => {
        hideTooltip();
        triggerElement.onMouseLeave?.(e);
      },
      onFocus: (e: React.FocusEvent) => {
        showTooltip();
        triggerElement.onFocus?.(e);
      },
      onBlur: (e: React.FocusEvent) => {
        hideTooltip();
        triggerElement.onBlur?.(e);
      },
    },
  };

  return (
    <>
      {React.cloneElement(children, enhancedChildren.props as any)}
      {typeof window !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
}

export default Tooltip;