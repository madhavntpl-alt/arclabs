import { forwardRef, useId, useState, useRef, useEffect, SelectHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({
    options,
    placeholder = 'Select...',
    value,
    onChange,
    error = false,
    label,
    helperText,
    disabled = false,
    searchable = false,
    className,
    id: providedId,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const generatedId = useId();
    const id = providedId || generatedId;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = searchable
      ? options.filter(opt =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          opt.value.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          optionsRef.current &&
          !optionsRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
      if (isOpen && searchable) {
        searchInputRef.current?.focus();
      }
    }, [isOpen, searchable]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      const enabledOptions = filteredOptions.filter(opt => !opt.disabled);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(prev =>
            prev < enabledOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : enabledOptions.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && enabledOptions[highlightedIndex]) {
            onChange?.(enabledOptions[highlightedIndex].value);
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      }
    };

    const handleOptionClick = (optionValue: string) => {
      onChange?.(optionValue);
      setIsOpen(false);
      setHighlightedIndex(-1);
    };

    const triggerId = `${id}-trigger`;
    const listboxId = `${id}-listbox`;

    const dropdownContent = (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={optionsRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={triggerId}
            className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-secondary-900 rounded-lg border border-secondary-200 dark:border-secondary-700 shadow-elevated py-1"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {searchable && (
              <div className="p-2 border-b border-secondary-200 dark:border-secondary-700">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-secondary-500 dark:text-secondary-400">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;
                const isDisabled = option.disabled;

                return (
                  <motion.div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled}
                    id={`${listboxId}-option-${index}`}
                    className={clsx(
                      'px-3 py-2 text-sm cursor-pointer transition-colors',
                      isSelected && 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
                      isHighlighted && !isSelected && 'bg-secondary-100 dark:bg-secondary-800',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => !isDisabled && handleOptionClick(option.value)}
                    onMouseEnter={() => !isDisabled && setHighlightedIndex(index)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.1 }}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
                      <span>{option.label}</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );

    return (
      <div ref={ref} className={clsx('w-full', className)} {...props}>
        {label && (
          <label htmlFor={triggerId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <button
            ref={triggerRef}
            id={triggerId}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={clsx(
              'w-full relative flex items-center justify-between px-3 py-2.5 text-left rounded-lg border transition-colors',
              'bg-white dark:bg-secondary-800',
              'placeholder:text-secondary-400 dark:placeholder:text-secondary-500',
              error
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
                : 'border-secondary-300 dark:border-secondary-600 focus:border-primary-500 focus:ring-primary-500/20',
              disabled && 'opacity-50 cursor-not-allowed',
              'focus:outline-none focus:ring-2'
            )}
          >
            <span className={clsx('flex-1', value ? 'text-secondary-900 dark:text-secondary-100' : 'text-secondary-500 dark:text-secondary-400')}>
              {value ? selectedOption?.label : placeholder}
            </span>
            <ChevronDown
              className={clsx(
                'w-4 h-4 text-secondary-400 transition-transform',
                isOpen && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </button>
          {typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
        </div>
        {helperText && !error && (
          <p className="form-hint mt-1.5">{helperText}</p>
        )}
        {error && helperText && (
          <p className="form-error mt-1.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;