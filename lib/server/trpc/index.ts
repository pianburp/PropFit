/**
 * tRPC Initialization - Server Only
 * 
 * Core tRPC setup with procedures and middleware.
 * This file should NEVER be imported from client code.
 */
import 'server-only';

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { TRPCContext } from './context';

/**
 * Initialize tRPC with:
 * - SuperJSON transformer for Date, BigInt, etc.
 * - Context type for full type safety
 */
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Don't expose internal errors in production
        zodError: error.cause instanceof Error 
          ? undefined 
          : null,
      },
    };
  },
});

/**
 * Create router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Merge routers together
 */
export const mergeRouters = t.mergeRouters;

/**
 * Public procedure - No authentication required
 * Use sparingly, most procedures should require auth
 */
export const publicProcedure = t.procedure;

/**
 * Middleware: Require authenticated user
 */
const enforceAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }
  
  if (!ctx.agent) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Agent profile not found. Please complete setup.',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      // Narrow types - these are now guaranteed to exist
      user: ctx.user,
      agent: ctx.agent,
    },
  });
});

/**
 * Middleware: Require admin role
 */
const enforceAdmin = t.middleware(async ({ ctx, next }) => {
  // This middleware should be used after enforceAuth
  const agent = ctx.agent as NonNullable<typeof ctx.agent>;
  
  if (agent.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This action requires admin privileges',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      agent,
    },
  });
});

/**
 * Middleware: Rate limiting (simple in-memory implementation)
 * For production, consider Redis-based rate limiting
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');

const rateLimit = t.middleware(async ({ ctx, next }) => {
  // Skip rate limiting if no user (will fail auth anyway)
  if (!ctx.user) {
    return next();
  }
  
  const key = ctx.user.id;
  const now = Date.now();
  
  let record = rateLimitStore.get(key);
  
  if (!record || record.resetAt < now) {
    // Create new window
    record = { count: 1, resetAt: now + RATE_LIMIT_WINDOW };
    rateLimitStore.set(key, record);
  } else {
    record.count++;
    
    if (record.count > RATE_LIMIT_MAX) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Please try again later.',
      });
    }
  }
  
  // Cleanup old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetAt < now) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  return next();
});

/**
 * Middleware: Audit logging for sensitive operations
 */
const auditLog = t.middleware(async ({ ctx, next, path, type }) => {
  const result = await next();
  
  // Log after successful mutation
  if (type === 'mutation' && ctx.user) {
    // In production, store this in database
    console.log(`[AUDIT] ${new Date().toISOString()} | User: ${ctx.user.id} | Action: ${path}`);
  }
  
  return result;
});

/**
 * Protected procedure - Requires authentication
 * Most procedures should use this
 */
export const protectedProcedure = t.procedure
  .use(rateLimit)
  .use(enforceAuth);

/**
 * Admin procedure - Requires admin role + audit logging
 * Use for sensitive operations like reassignments
 */
export const adminProcedure = t.procedure
  .use(rateLimit)
  .use(enforceAuth)
  .use(enforceAdmin)
  .use(auditLog);
