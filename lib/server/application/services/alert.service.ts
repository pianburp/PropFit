/**
 * Alert Service - Business Logic Layer
 * 
 * Encapsulates all business logic for alert management.
 */
import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { UpgradeAlert } from '../../domain/entities';
import { AlertRepository } from '../../infrastructure/repositories/alert.repository';

export interface AlertServiceContext {
  userId: string;
}

export class AlertService {
  private readonly alertRepo: AlertRepository;

  constructor(private readonly supabase: SupabaseClient) {
    this.alertRepo = new AlertRepository(supabase);
  }

  /**
   * List alerts for current user
   */
  async list(unreadOnly = true, ctx: AlertServiceContext): Promise<UpgradeAlert[]> {
    return this.alertRepo.findByAgentId(ctx.userId, unreadOnly);
  }

  /**
   * Mark alert as read
   */
  async markAsRead(id: string, ctx: AlertServiceContext): Promise<void> {
    await this.alertRepo.markAsRead(id, ctx.userId);
  }

  /**
   * Dismiss an alert
   */
  async dismiss(id: string, ctx: AlertServiceContext): Promise<void> {
    await this.alertRepo.dismiss(id, ctx.userId);
  }

  /**
   * Get unread alert count
   */
  async getUnreadCount(ctx: AlertServiceContext): Promise<number> {
    return this.alertRepo.findUnreadCount(ctx.userId);
  }

  /**
   * Get pending alerts (for dashboard)
   */
  async getPending(limit: number, ctx: AlertServiceContext): Promise<UpgradeAlert[]> {
    return this.alertRepo.findPending(ctx.userId, limit);
  }
}
