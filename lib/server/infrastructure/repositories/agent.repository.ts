/**
 * Agent Repository - Data Access Implementation
 * 
 * Handles all database operations for agents.
 */
import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  IAgentRepository, 
  CreateAgentData, 
  UpdateAgentData 
} from '../../domain/interfaces';
import type { Agent, Agency } from '../../domain/entities';

export class AgentRepository implements IAgentRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<Agent | null> {
    const { data } = await this.supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    return data as Agent | null;
  }

  async findByIdWithAgency(id: string): Promise<(Agent & { agency?: Agency }) | null> {
    const { data } = await this.supabase
      .from('agents')
      .select('*, agency:agencies(*)')
      .eq('id', id)
      .single();

    return data as (Agent & { agency?: Agency }) | null;
  }

  async findByAgencyId(agencyId: string): Promise<Agent[]> {
    const { data } = await this.supabase
      .from('agents')
      .select('*')
      .eq('agency_id', agencyId)
      .order('full_name');

    return (data || []) as Agent[];
  }

  async create(data: CreateAgentData): Promise<Agent> {
    const { data: agent, error } = await this.supabase
      .from('agents')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create agent: ${error.message}`);
    }

    return agent as Agent;
  }

  async update(id: string, data: UpdateAgentData): Promise<void> {
    const { error } = await this.supabase
      .from('agents')
      .update(data)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update agent: ${error.message}`);
    }
  }

  /**
   * Get agent IDs for an agency
   */
  async getAgentIdsByAgency(agencyId: string): Promise<string[]> {
    const { data } = await this.supabase
      .from('agents')
      .select('id')
      .eq('agency_id', agencyId);

    return (data || []).map(a => a.id);
  }
}
