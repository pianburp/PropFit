/**
 * tRPC Client Configuration
 * 
 * This file exports the tRPC React hooks and client for client-side usage.
 * Safe to import in client components.
 */
'use client';

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/lib/server/routers/_app';

/**
 * tRPC React Query hooks
 * 
 * Usage in Client Components:
 * ```tsx
 * 'use client';
 * import { trpc } from '@/lib/trpc/client';
 * 
 * export function LeadsList() {
 *   const { data: leads, isLoading } = trpc.leads.list.useQuery();
 *   // ...
 * }
 * ```
 */
export const trpc = createTRPCReact<AppRouter>();
