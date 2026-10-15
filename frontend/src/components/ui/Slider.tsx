import { forwardRef, useRef, useState, useEffect, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  min?: number;
  max?: number;
  step?: number;
  value?: number | number[];
  onChange?: (value: number | number[]) => void;
  label?: string;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  marks?: { value: number; label: string }[];
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  ({
    min = 0,
    max = 100,
    step = 1,
    value,
    onChange,
    label,
    showValue = true,
    valueFormat,
    marks,
    disabled = false,
    error = false,
    className,
    ...props
  }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const [activeThumb, setActiveThumb] = useState<0 | 1>(0);
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbsRef = useRef<(HTMLDivElement | null)[]>([null, null]);

    const isRange = Array.isArray(value);
    const values = isRange ? value : [value ?? min];
    const [firstValue, secondValue] = values;

    const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;
    const getValueFromPosition = (clientX: number) => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percentage * (max - min);
      return Math.round(rawValue / step) * step;
    };

    const handleMouseDown = (index: 0 | 1) => (event: React.MouseEvent) => {
      if (disabled) return;
      event.preventDefault();
      setIsDragging(true);
      setActiveThumb(index);
    };

    const handleTouchStart = (index: 0 | 1) => (event: React.TouchEvent) => {
      if (disabled) return;
      setIsDragging(true);
      setActiveThumb(index);
    };

    useEffect(() => {
      const handleMove = (event: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const newValue = getValueFromPosition(clientX);
        const clampedValue = Math.max(min, Math.min(max, newValue));

        if (isRange) {
          const newValues = [...values];
          newValues[activeThumb] = clampedValue;
          // Ensure order for range
          if (activeThumb === 0 && newValues[0] > newValues[1]) {
            newValues[1] = clampedValue;
          } else if (activeThumb === 1 && newValues[1] < newValues[0]) {
            newValues[0] = clampedValue;
          }
          onChange?.(newValues);
        } else {
          onChange?.(clampedValue);
        }
      };

      const handleUp = () => {
        setIsDragging(false);
      };

      if (isDragging) {
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchmove', handleMove, { passive: true });
        window.addEventListener('touchend', handleUp);
      }

      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleUp);
      };
    }, [isDragging, activeThumb, isRange, min, max, onChange, values]);

    const formatValue = (val: number) => valueFormat ? valueFormat(val) : `${val}`;

    return (
      <div ref={ref} className={clsx('w-full', className)} {...props}>
        {label && <label className="label">{label}</label>}

        <div className="relative">
          <div
            ref={trackRef}
            className={clsx(
              'relative h-2 rounded-full bg-secondary-200 dark:bg-secondary-700',
              error && 'bg-danger-200 dark:bg-danger-800'
            )}
            onMouseDown={(e) => {
              if (!disabled && !isRange) {
                e.preventDefault();
                const newValue = getValueFromPosition(e.clientX);
                onChange?.(Math.max(min, Math.min(max, newValue)));
              }
            }}
          >
            {/* Track fill for single value */}
            {!isRange && (
              <div
                className="absolute h-full rounded-full bg-primary-600 dark:bg-primary-500 transition-all duration-100"
                style={{ width: `${getPercentage(firstValue)}%` }}
              />
            )}

            {/* Track fill for range */}
            {isRange && (
              <div
                className="absolute h-full rounded-full bg-primary-600 dark:bg-primary-500 transition-all duration-100"
                style={{
                  left: `${getPercentage(firstValue)}%`,
                  width: `${getPercentage(secondValue) - getPercentage(firstValue)}%`,
                }}
              />
            )}

            {/* Marks */}
            {marks && marks.map((mark, index) => (
              <div
                key={index}
                className="absolute top-full mt-1 text-xs text-secondary-500 dark:text-secondary-400 transform -translate-x-1/2 whitespace-nowrap"
                style={{ left: `${getPercentage(mark.value)}%` }}
              >
                {mark.label}
              </div>
            ))}

            {/* Thumb 1 */}
            <div
              ref={el => (thumbsRef.current[0] = el)}
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-primary-600 dark:border-primary-500 shadow-md transition-all duration-100',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                isDragging && activeThumb === 0 && 'scale-125 shadow-lg',
                disabled && 'opacity-50 cursor-not-allowed',
                error && 'border-danger-500'
              )}
              style={{ left: `calc(${getPercentage(firstValue)}% - 10px)` }}
              onMouseDown={handleMouseDown(0)}
              onTouchStart={handleTouchStart(0)}
              tabIndex={disabled ? -1 : 0}
              role="slider"
              aria-valuemin={min}
              aria-valuemax={isRange ? secondValue : max}
              aria-valuenow={firstValue}
              aria-label={label}
              aria-orientation="horizontal"
            />

            {/* Thumb 2 for range */}
            {isRange && (
              <div
                ref={el => (thumbsRef.current[1] = el)}
                className={clsx(
                  'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-primary-600 dark:border-primary-500 shadow-md transition-all duration-100',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                  isDragging && activeThumb === 1 && 'scale-125 shadow-lg',
                  disabled && 'opacity-50 cursor-not-allowed',
                  error && 'border-danger-500'
                )}
                style={{ left: `calc(${getPercentage(secondValue)}% - 10px)` }}
                onMouseDown={handleMouseDown(1)}
                onTouchStart={handleTouchStart(1)}
                tabIndex={disabled ? -1 : 0}
                role="slider"
                aria-valuemin={firstValue}
                aria-valuemax={max}
                aria-valuenow={secondValue}
                aria-label={label}
                aria-orientation="horizontal"
              />
            )}
          </div>

          {/* Value display */}
          {showValue && (
            <div className="mt-2 flex items-center justify-between text-sm text-secondary-600 dark:text-secondary-400">
              <span>{formatValue(firstValue)}</span>
              {isRange && <span>{formatValue(secondValue)}</span>}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export default Slider;