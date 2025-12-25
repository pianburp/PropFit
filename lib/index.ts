/**
 * Lib - Public API Barrel Export
 *
 * This file exports all public APIs from the lib folder.
 * Import from '@/lib' for commonly used utilities and types.
 *
 * For more specific imports, use the direct paths:
 * - '@/lib/types' - Type definitions
 * - '@/lib/calculators' - Business logic calculators
 * - '@/lib/server' - Server-side code (tRPC, services)
 * - '@/lib/supabase/client' - Client-side Supabase
 * - '@/lib/supabase/server' - Server-side Supabase
 */

// Utility functions
export {
  cn,
  hasEnvVars,
  formatCurrency,
  formatDate,
  formatPercent,
  truncate,
  delay,
  isServer,
  isClient,
} from './utils';

// Types (re-export for convenience)
export * from './types';

// Note: Calculators and server-side code should be imported directly
// to enable proper tree-shaking and code splitting.
