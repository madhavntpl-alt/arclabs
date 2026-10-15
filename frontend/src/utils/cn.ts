import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge class names
 * Similar to cn() from tailwind-merge but using clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export default cn;