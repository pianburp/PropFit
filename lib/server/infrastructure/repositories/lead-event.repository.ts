/**
 * Lead Event Repository - Data Access Implementation
 * 
 * Handles all database operations for lead events/history.
 */
import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ILeadEventRepository, CreateLeadEventData } from '../../domain/interfaces';
import type { LeadEvent } from '../../domain/entities';

export class LeadEventRepository implements ILeadEventRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByLeadId(leadId: string, agentId: string): Promise<LeadEvent[]> {
    const { data } = await this.supabase
      .from('lead_events')
      .select('*')
      .eq('lead_id', leadId)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    return (data || []) as LeadEvent[];
  }

  async create(data: CreateLeadEventData): Promise<LeadEvent> {
    const { data: event, error } = await this.supabase
      .from('lead_events')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create lead event: ${error.message}`);
    }

    return event as LeadEvent;
  }

  /**
   * Create event without returning (fire and forget for non-critical events)
   */
  async createAsync(data: CreateLeadEventData): Promise<void> {
    await this.supabase.from('lead_events').insert(data);
  }
}
