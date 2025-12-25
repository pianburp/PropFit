// ============================================
// Currency and Number Formatting Utilities
// Standardized formatting for Malaysia (MYR)
// ============================================

/**
 * Format amount as Malaysian Ringgit (compact)
 * - >= 1M: "RM 1.2M"
 * - >= 1K: "RM 350K"
 * - < 1K: "RM 500"
 */
export function formatRM(amount: number): string {
  if (amount >= 1000000) {
    return `RM ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `RM ${(amount / 1000).toFixed(0)}K`;
  }
  return `RM ${amount.toLocaleString('en-MY')}`;
}

/**
 * Format amount as Malaysian Ringgit (full)
 * Always shows full number with thousand separators
 * "RM 350,000"
 */
export function formatRMFull(amount: number): string {
  return `RM ${amount.toLocaleString('en-MY')}`;
}

/**
 * Format percentage
 * @param value - The percentage value (e.g., 15.5)
 * @param decimals - Number of decimal places (default: 0)
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format years (for job tenure, property ownership, etc.)
 */
export function formatYears(years: number): string {
  if (years === 1) return '1 year';
  return `${years} years`;
}

/**
 * Format currency range
 * "RM 500K - 800K"
 */
export function formatRMRange(min: number, max: number): string {
  return `${formatRM(min)} - ${formatRM(max)}`;
}
