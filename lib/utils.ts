/**
 * Utility Functions
 *
 * Common utility functions used throughout the application.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence handling.
 * Combines clsx for conditional classes with tailwind-merge for deduplication.
 *
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 * cn('text-red-500', isActive && 'text-blue-500')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Check if Supabase environment variables are configured.
 * Used during initial setup to show appropriate guidance.
 */
export const hasEnvVars =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Format a number as Malaysian Ringgit currency.
 *
 * @param amount - The amount to format
 * @param options - Intl.NumberFormat options
 * @example formatCurrency(1500) // => 'RM 1,500'
 */
export function formatCurrency(
  amount: number,
  options?: Partial<Intl.NumberFormatOptions>
): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

/**
 * Format a date for display in Malaysian locale.
 *
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormat options
 */
export function formatDate(
  date: string | Date,
  options?: Partial<Intl.DateTimeFormatOptions>
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format a percentage value for display.
 *
 * @param value - The percentage value (0-100 or 0-1)
 * @param isDecimal - Whether the value is in decimal form (0-1)
 */
export function formatPercent(value: number, isDecimal = false): string {
  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(1)}%`;
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Delay execution for a specified duration (useful for animations).
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if we're running on the server side.
 */
export const isServer = typeof window === 'undefined';

/**
 * Check if we're running on the client side.
 */
export const isClient = !isServer;