/**
 * Alerts Router - Server Only (Clean Architecture)
 * 
 * Thin controller layer that delegates to AlertService.
 */
import 'server-only';

import { createTRPCRouter, protectedProcedure } from '../trpc';
import { AlertService } from '../application/services';
import { handleDomainError } from '../shared';
import { listAlertsSchema, alertIdSchema } from '../application/schemas';
import type { UpgradeAlert } from '../domain/entities';

export const alertsRouter = createTRPCRouter({
  /**
   * List upgrade alerts
   */
  list: protectedProcedure
    .input(listAlertsSchema)
    .query(async ({ ctx, input }): Promise<UpgradeAlert[]> => {
      try {
        const service = new AlertService(ctx.supabase);
        return await service.list(input?.unreadOnly ?? true, {
          userId: ctx.user.id,
        });
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Mark alert as read
   */
  markAsRead: protectedProcedure
    .input(alertIdSchema)
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      try {
        const service = new AlertService(ctx.supabase);
        await service.markAsRead(input.id, {
          userId: ctx.user.id,
        });
        return { success: true };
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Dismiss an alert
   */
  dismiss: protectedProcedure
    .input(alertIdSchema)
    .mutation(async ({ ctx, input }): Promise<{ success: boolean }> => {
      try {
        const service = new AlertService(ctx.supabase);
        await service.dismiss(input.id, {
          userId: ctx.user.id,
        });
        return { success: true };
      } catch (error) {
        handleDomainError(error);
      }
    }),

  /**
   * Get unread alert count
   */
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }): Promise<{ count: number }> => {
      try {
        const service = new AlertService(ctx.supabase);
        const count = await service.getUnreadCount({
          userId: ctx.user.id,
        });
        return { count };
      } catch (error) {
        handleDomainError(error);
      }
    }),
});
