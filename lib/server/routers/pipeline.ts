/**
 * Pipeline Router - Server Only (Clean Architecture)
 * 
 * Thin controller layer that delegates to PipelineService.
 * Handles input validation and error mapping to tRPC errors.
 */
import 'server-only';

import { createTRPCRouter, protectedProcedure } from '../trpc';
import { PipelineService } from '../application/services';
import { handleDomainError } from '../shared';
import {
  financialSnapshotSchema,
  changeStageSchema,
  conversationStepUpdateSchema,
  fallbackPlanSchema,
} from '../application/schemas';
import type { Lead, UpgradeStage } from '../domain/entities';

// ============================================
// Router
// ============================================

export const pipelineRouter = createTRPCRouter({
  /**
   * Update client financial snapshot
   */
  updateFinancialSnapshot: protectedProcedure
    .input(financialSnapshotSchema)
    .mutation(async ({ ctx, input }): Promise<Lead> => {
      try {
        const service = new PipelineService(ctx.supabase);
        return await service.updateFinancialSnapshot(input, {
          userId: ctx.user.id,
          agentRole: ctx.agent.role,
          agencyId: ctx.agent.agency_id,
        });
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Change upgrade stage with audit trail
   */
  changeUpgradeStage: protectedProcedure
    .input(changeStageSchema)
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      try {
        const service = new PipelineService(ctx.supabase);
        await service.changeUpgradeStage(input, {
          userId: ctx.user.id,
          agentRole: ctx.agent.role,
          agencyId: ctx.agent.agency_id,
        });
        return { success: true };
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Get clients grouped by upgrade stage (pipeline view)
   */
  getClientsByStage: protectedProcedure
    .query(async ({ ctx }): Promise<Record<UpgradeStage, Lead[]>> => {
      try {
        const service = new PipelineService(ctx.supabase);
        return await service.getClientsByStage({
          userId: ctx.user.id,
          agentRole: ctx.agent.role,
          agencyId: ctx.agent.agency_id,
        });
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Update conversation timeline step
   */
  updateConversationStep: protectedProcedure
    .input(conversationStepUpdateSchema)
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      try {
        const service = new PipelineService(ctx.supabase);
        await service.updateConversationStep(input, {
          userId: ctx.user.id,
          agentRole: ctx.agent.role,
          agencyId: ctx.agent.agency_id,
        });
        return { success: true };
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Save fallback plan when upgrade not proceeding
   */
  saveFallbackPlan: protectedProcedure
    .input(fallbackPlanSchema)
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      try {
        const service = new PipelineService(ctx.supabase);
        await service.saveFallbackPlan(input, {
          userId: ctx.user.id,
          agentRole: ctx.agent.role,
          agencyId: ctx.agent.agency_id,
        });
        return { success: true };
      } catch (error) {
        handleDomainError(error);
      }
    }),
});
