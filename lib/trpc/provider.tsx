/**
 * tRPC Provider
 * 
 * Wraps the app with React Query and tRPC providers.
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from './client';

/**
 * Get the base URL for tRPC requests
 */
function getBaseUrl() {
    if (typeof window !== 'undefined') {
        // Browser - use relative URL
        return '';
    }

    // SSR - use localhost
    return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * tRPC Provider Component
 * 
 * Usage in layout.tsx:
 * ```tsx
 * import { TRPCProvider } from '@/lib/trpc/provider';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <TRPCProvider>
 *           {children}
 *         </TRPCProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // With SSR, we want to avoid refetching right after hydration
                        staleTime: 30 * 1000, // 30 seconds
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: `${getBaseUrl()}/api/trpc`,
                    transformer: superjson,
                    // Include credentials for cookie-based auth
                    fetch(url, options) {
                        return fetch(url, {
                            ...options as RequestInit,
                            credentials: 'include',
                        });
                    },
                }),
            ],
        })
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
}
