/**
 * Leads Router - Server Only (Clean Architecture)
 * 
 * Thin controller layer that delegates to LeadService.
 * Handles input validation and error mapping to tRPC errors.
 */
import 'server-only';

import { createTRPCRouter, protectedProcedure } from '../trpc';
import { LeadService } from '../application/services';
import { handleDomainError } from '../shared';
import {
  createLeadSchema,
  updateLeadSchema,
  listLeadsSchema,
  leadIdSchema,
  updateLeadStatusSchema,
  logContactSchema,
  getEventsSchema,
} from '../application/schemas';
import type { Lead } from '../domain/entities';

// ============================================
// Router
// ============================================

export const leadsRouter = createTRPCRouter({
  /**
   * Create a new lead with automatic qualification
   */
  create: protectedProcedure
    .input(createLeadSchema)
    .mutation(async ({ ctx, input }): Promise<Lead> => {
      try {
        const service = new LeadService(ctx.supabase);
        const result = await service.create(input, {
          userId: ctx.user.id,
          agentRole: ctx.agent.role,
          agencyId: ctx.agent.agency_id,
        });
        return result.lead;
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Update an existing lead
   */
  update: protectedProcedure
    .input(updateLeadSchema)
    .mutation(async ({ ctx, input }): Promise<Lead> => {
      try {
        const { id, ...updateData } = input;
        const service = new LeadService(ctx.supabase);
        return await service.update(id, updateData, {
          userId: ctx.user.id,
          agentRole: ctx.agent.role,
          agencyId: ctx.agent.agency_id,
        });
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Delete a lead
   */
  delete: protectedProcedure
    .input(leadIdSchema)
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      try {
        const service = new LeadService(ctx.supabase);
        await service.delete(input.id, {
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
   * Get a single lead by ID
   */
  getById: protectedProcedure
    .input(leadIdSchema)
    .query(async ({ ctx, input }): Promise<Lead> => {
      try {
        const service = new LeadService(ctx.supabase);
        return await service.getById(input.id, {
          userId: ctx.user.id,
          agentRole: ctx.agent.role,
          agencyId: ctx.agent.agency_id,
        });
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * List leads with optional filters
   */
  list: protectedProcedure
    .input(listLeadsSchema)
    .query(async ({ ctx, input }): Promise<Lead[]> => {
      try {
        const service = new LeadService(ctx.supabase);
        return await service.list(input, {
          userId: ctx.user.id,
          agentRole: ctx.agent.role,
          agencyId: ctx.agent.agency_id,
        });
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Update lead status shorthand
   */
  updateStatus: protectedProcedure
    .input(updateLeadStatusSchema)
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      try {
        const service = new LeadService(ctx.supabase);
        await service.updateStatus(input.id, input.status, {
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
   * Get lead events/history
   */
  getEvents: protectedProcedure
    .input(getEventsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const service = new LeadService(ctx.supabase);
        return await service.getEvents(input.leadId, {
          userId: ctx.user.id,
          agentRole: ctx.agent.role,
          agencyId: ctx.agent.agency_id,
        });
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Log a contact with a lead
   */
  logContact: protectedProcedure
    .input(logContactSchema)
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      try {
        const service = new LeadService(ctx.supabase);
        await service.logContact(input.leadId, input.notes, {
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
