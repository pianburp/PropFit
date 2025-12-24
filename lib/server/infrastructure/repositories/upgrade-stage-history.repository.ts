/**
 * Upgrade Stage History Repository - Data Access Implementation
 * 
 * Handles all database operations for upgrade stage change history.
 */
import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { IUpgradeStageHistoryRepository, CreateStageHistoryData } from '../../domain/interfaces';

export class UpgradeStageHistoryRepository implements IUpgradeStageHistoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(data: CreateStageHistoryData): Promise<void> {
    await this.supabase.from('upgrade_stage_history').insert(data);
  }

  async countByStageInDateRange(
    leadIds: string[],
    toStage: string,
    startDate: string
  ): Promise<number> {
    if (leadIds.length === 0) return 0;

    const { data } = await this.supabase
      .from('upgrade_stage_history')
      .select('id')
      .in('lead_id', leadIds)
      .eq('to_stage', toStage)
      .gte('created_at', startDate);

    return (data || []).length;
  }
}
