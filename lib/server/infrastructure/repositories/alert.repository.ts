/**
 * Alert Repository - Data Access Implementation
 * 
 * Handles all database operations for upgrade alerts.
 */
import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { IAlertRepository, CreateAlertData } from '../../domain/interfaces';
import type { UpgradeAlert } from '../../domain/entities';

export class AlertRepository implements IAlertRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByAgentId(agentId: string, unreadOnly = true): Promise<UpgradeAlert[]> {
    let query = this.supabase
      .from('upgrade_alerts')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data } = await query;
    return (data || []) as UpgradeAlert[];
  }

  async findUnreadCount(agentId: string): Promise<number> {
    const { count } = await this.supabase
      .from('upgrade_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agentId)
      .eq('is_read', false)
      .eq('is_dismissed', false);

    return count || 0;
  }

  async create(data: CreateAlertData): Promise<UpgradeAlert> {
    const { data: alert, error } = await this.supabase
      .from('upgrade_alerts')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create alert: ${error.message}`);
    }

    return alert as UpgradeAlert;
  }

  async createMany(data: CreateAlertData[]): Promise<void> {
    if (data.length === 0) return;

    const { error } = await this.supabase
      .from('upgrade_alerts')
      .insert(data);

    if (error) {
      throw new Error(`Failed to create alerts: ${error.message}`);
    }
  }

  async markAsRead(id: string, agentId: string): Promise<void> {
    await this.supabase
      .from('upgrade_alerts')
      .update({ is_read: true })
      .eq('id', id)
      .eq('agent_id', agentId);
  }

  async dismiss(id: string, agentId: string): Promise<void> {
    await this.supabase
      .from('upgrade_alerts')
      .update({ is_dismissed: true })
      .eq('id', id)
      .eq('agent_id', agentId);
  }

  /**
   * Find pending alerts (unread and not dismissed)
   */
  async findPending(agentId: string, limit?: number): Promise<UpgradeAlert[]> {
    let query = this.supabase
      .from('upgrade_alerts')
      .select('*')
      .eq('agent_id', agentId)
      .eq('is_read', false)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data } = await query;
    return (data || []) as UpgradeAlert[];
  }
}
