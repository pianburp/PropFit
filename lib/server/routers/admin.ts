/**
 * Admin Router - Server Only (Clean Architecture)
 * 
 * Admin-only procedures for agency management.
 * Thin controller layer that delegates to AdminService.
 */
import 'server-only';

import { createTRPCRouter, adminProcedure, protectedProcedure } from '../trpc';
import { AdminService } from '../application/services';
import { handleDomainError } from '../shared';
import { reassignClientSchema } from '../application/schemas';
import type { Agent } from '../domain/entities';

export const adminRouter = createTRPCRouter({
  /**
   * Reassign a client to a different agent (admin only)
   * Note: ctx.user is guaranteed by adminProcedure middleware
   */
  reassignClient: adminProcedure
    .input(reassignClientSchema)
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      try {
        const service = new AdminService(ctx.supabase);
        await service.reassignClient(input, {
          userId: ctx.user!.id,
          agencyId: ctx.agent.agency_id,
        });
        return { success: true };
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Get team members in the agency
   */
  getTeamMembers: adminProcedure
    .query(async ({ ctx }): Promise<Agent[]> => {
      try {
        const service = new AdminService(ctx.supabase);
        return await service.getTeamMembers({
          userId: ctx.user!.id,
          agencyId: ctx.agent.agency_id,
        });
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Get agency dashboard stats
   */
  getAgencyDashboard: adminProcedure
    .query(async ({ ctx }) => {
      try {
        const service = new AdminService(ctx.supabase);
        const stats = await service.getAgencyDashboard({
          userId: ctx.user!.id,
          agencyId: ctx.agent.agency_id,
        });
        return {
          ...stats,
          isAdmin: true,
        };
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Check if current user is admin
   */
  isAdmin: protectedProcedure
    .query(async ({ ctx }) => {
      return { isAdmin: ctx.agent.role === 'admin' };
    }),
});
