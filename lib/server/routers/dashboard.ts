/**
 * Dashboard Router - Server Only (Clean Architecture)
 * 
 * Thin controller layer that delegates to DashboardService.
 */
import 'server-only';

import { createTRPCRouter, protectedProcedure } from '../trpc';
import { DashboardService } from '../application/services';
import { handleDomainError } from '../shared';
import type { DashboardStats, PricingRule } from '../domain/entities';

export const dashboardRouter = createTRPCRouter({
  /**
   * Get dashboard statistics for the current agent
   */
  getStats: protectedProcedure
    .query(async ({ ctx }): Promise<DashboardStats> => {
      try {
        const service = new DashboardService(ctx.supabase);
        return await service.getStats({
          userId: ctx.user.id,
        });
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Get pricing rules (for qualification display)
   */
  getPricingRules: protectedProcedure
    .query(async ({ ctx }): Promise<PricingRule[]> => {
      try {
        const service = new DashboardService(ctx.supabase);
        return await service.getPricingRules();
      } catch (error) {
        handleDomainError(error);
      }
    }),
});
