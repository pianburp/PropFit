/**
 * Agents Router - Server Only (Clean Architecture)
 * 
 * Thin controller layer that delegates to AgentService.
 */
import 'server-only';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { AgentService } from '../application/services';
import { handleDomainError } from '../shared';
import { updateAgentSchema } from '../application/schemas';

export const agentsRouter = createTRPCRouter({
  /**
   * Get current authenticated agent
   */
  getCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.agent;
    }),

  /**
   * Get or create agent profile
   * Called on first login to ensure agent exists
   */
  getOrCreate: publicProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        });
      }

      try {
        const service = new AgentService(ctx.supabase);
        return await service.getOrCreate({
          userId: ctx.user.id,
          email: ctx.user.email,
        });
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Update agent profile
   */
  update: protectedProcedure
    .input(updateAgentSchema)
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      try {
        const service = new AgentService(ctx.supabase);
        await service.update(ctx.user.id, input);
        return { success: true };
      } catch (error) {
        handleDomainError(error);
      }
    }),
});
