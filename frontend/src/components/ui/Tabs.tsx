'use client';

import { useState, createContext, useContext, ReactNode } from 'react';
import { clsx } from 'clsx';

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function Tabs({ children, defaultValue, value, onChange, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const controlled = value !== undefined;
  const currentValue = controlled ? value : internalValue;

  const handleChange = (newValue: string) => {
    if (!controlled) setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div className={clsx('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={clsx(
        'inline-flex h-10 items-center justify-center rounded-md bg-secondary-100 dark:bg-secondary-800 p-1',
        className
      )}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function TabsTrigger({ value, children, disabled, className }: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const { value: currentValue, onChange } = context;
  const isActive = currentValue === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && onChange(value)}
      className={clsx(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        isActive
          ? 'bg-white dark:bg-secondary-900 text-secondary-900 dark:text-secondary-100 shadow-sm'
          : 'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100'
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  const { value: currentValue } = context;
  const isActive = currentValue === value;

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      className={clsx('mt-4 ring-offset-background focus:outline-none', className)}
    >
      {isActive && children}
    </div>
  );
}

export default Tabs;