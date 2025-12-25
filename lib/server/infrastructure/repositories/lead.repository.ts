/**
 * Lead Repository - Data Access Implementation
 * 
 * Handles all database operations for leads.
 */
import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  ILeadRepository, 
  LeadFilters, 
  CreateLeadData, 
  UpdateLeadData 
} from '../../domain/interfaces';
import type { Lead, LeadStatus } from '../../domain/entities';

export class LeadRepository implements ILeadRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<Lead | null> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Lead;
  }

  async findMany(filters: LeadFilters): Promise<Lead[]> {
    let query = this.supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.agentId) {
      query = query.eq('agent_id', filters.agentId);
    }

    if (filters.agentIds && filters.agentIds.length > 0) {
      query = query.in('agent_id', filters.agentIds);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.city) {
      query = query.eq('preferred_city', filters.city);
    }

    if (filters.qualificationStatus) {
      query = query.eq('qualification_status', filters.qualificationStatus);
    }

    if (filters.upgradeStage) {
      query = query.eq('upgrade_stage', filters.upgradeStage);
    }

    if (filters.isUpgradeReady !== undefined) {
      query = query.eq('is_upgrade_ready', filters.isUpgradeReady);
    }

    const { data } = await query;
    return (data || []) as Lead[];
  }

  async create(data: CreateLeadData): Promise<Lead> {
    const { data: lead, error } = await this.supabase
      .from('leads')
      .insert({
        ...data,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create lead: ${error.message}`);
    }

    return lead as Lead;
  }

  async update(id: string, data: UpdateLeadData): Promise<Lead> {
    const { data: lead, error } = await this.supabase
      .from('leads')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update lead: ${error.message}`);
    }

    return lead as Lead;
  }

  async delete(id: string, agentId: string): Promise<void> {
    const { error } = await this.supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('agent_id', agentId);

    if (error) {
      throw new Error(`Failed to delete lead: ${error.message}`);
    }
  }

  async updateStatus(id: string, status: LeadStatus): Promise<void> {
    const { error } = await this.supabase
      .from('leads')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update lead status: ${error.message}`);
    }
  }

  /**
   * Find leads with agent info for agency access checks
   */
  async findByIdWithAgent(id: string): Promise<(Lead & { agent?: { agency_id?: string } }) | null> {
    const { data } = await this.supabase
      .from('leads')
      .select('*, agent:agents!leads_agent_id_fkey(agency_id)')
      .eq('id', id)
      .single();

    return data as (Lead & { agent?: { agency_id?: string } }) | null;
  }

  /**
   * Get leads grouped by upgrade stage for pipeline view
   */
  async findByUpgradeStage(agentIds: string[]): Promise<Lead[]> {
    const { data } = await this.supabase
      .from('leads')
      .select('*')
      .in('agent_id', agentIds)
      .order('upgrade_stage_changed_at', { ascending: false });

    return (data || []) as Lead[];
  }

  /**
   * Find a lead by identifiers for upsert matching.
   * Priority: IC (strongest) → Phone → Email
   */
  async findByIdentifiers(
    phone: string,
    ic?: string,
    email?: string
  ): Promise<Lead | null> {
    // Priority 1: Match by IC (strongest identifier)
    if (ic) {
      const { data: icMatch } = await this.supabase
        .from('leads')
        .select('*')
        .eq('ic_number', ic)
        .limit(1)
        .maybeSingle();

      if (icMatch) {
        return icMatch as Lead;
      }
    }

    // Priority 2: Match by phone (primary, required field)
    const { data: phoneMatch } = await this.supabase
      .from('leads')
      .select('*')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();

    if (phoneMatch) {
      return phoneMatch as Lead;
    }

    // Priority 3: Match by email (secondary, if provided)
    if (email) {
      const { data: emailMatch } = await this.supabase
        .from('leads')
        .select('*')
        .eq('email', email)
        .limit(1)
        .maybeSingle();

      if (emailMatch) {
        return emailMatch as Lead;
      }
    }

    return null;
  }
}
