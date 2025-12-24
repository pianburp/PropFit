/**
 * tRPC Server-Side Caller
 * 
 * For calling tRPC procedures from React Server Components
 */
import 'server-only';

import { createCaller } from '@/lib/server/routers/_app';
import { createTRPCContext } from '@/lib/server/trpc/context';
import { headers } from 'next/headers';
import { cache } from 'react';

/**
 * Create a cached tRPC caller for server-side usage
 * Cached per request to avoid duplicate database calls
 */
export const createServerCaller = cache(async () => {
  const heads = await headers();
  
  const context = await createTRPCContext({
    headers: heads,
  });
  
  return createCaller(context);
});

/**
 * Shorthand for getting the server-side tRPC API
 * 
 * Usage in Server Components:
 * ```tsx
 * import { api } from '@/lib/trpc/server';
 * 
 * export default async function Page() {
 *   const leads = await api().leads.list();
 *   return <LeadsList leads={leads} />;
 * }
 * ```
 */
export const api = createServerCaller;
