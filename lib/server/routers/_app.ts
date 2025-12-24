/**
 * Root App Router - Server Only
 * 
 * Combines all domain routers into the unified app router.
 * This exports the router type for client type inference.
 */
import 'server-only';

import { createTRPCRouter, createCallerFactory } from '../trpc';
import { agentsRouter } from './agents';
import { leadsRouter } from './leads';
import { alertsRouter } from './alerts';
import { dashboardRouter } from './dashboard';
import { pipelineRouter } from './pipeline';
import { adminRouter } from './admin';

/**
 * The root tRPC router combining all domain routers
 */
export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  leads: leadsRouter,
  alerts: alertsRouter,
  dashboard: dashboardRouter,
  pipeline: pipelineRouter,
  admin: adminRouter,
});

/**
 * Export type router for client type inference
 * This is the ONLY thing exported that should be used on the client
 */
export type AppRouter = typeof appRouter;

/**
 * Create caller factory for server-side calls
 * Used in React Server Components
 */
export const createCaller = createCallerFactory(appRouter);
