/**
 * Agent Service - Business Logic Layer
 * 
 * Encapsulates all business logic for agent management.
 */
import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Agent, Agency, City } from '../../domain/entities';
import { AgentRepository } from '../../infrastructure/repositories/agent.repository';

export interface AgentServiceContext {
  userId: string;
  email?: string;
}

export interface UpdateAgentInput {
  full_name?: string;
  phone?: string;
  agency_name?: string;
  license_number?: string;
  preferred_cities?: City[];
}

export class AgentService {
  private readonly agentRepo: AgentRepository;

  constructor(private readonly supabase: SupabaseClient) {
    this.agentRepo = new AgentRepository(supabase);
  }

  /**
   * Get agent by ID with agency info
   */
  async getById(id: string): Promise<(Agent & { agency?: Agency }) | null> {
    return this.agentRepo.findByIdWithAgency(id);
  }

  /**
   * Get or create agent profile
   * Called on first login to ensure agent exists
   */
  async getOrCreate(ctx: AgentServiceContext): Promise<Agent> {
    // Check if agent already exists
    const existingAgent = await this.agentRepo.findById(ctx.userId);
    if (existingAgent) {
      return existingAgent;
    }

    // Create new agent profile with 14-day trial
    const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    
    return this.agentRepo.create({
      id: ctx.userId,
      full_name: ctx.email?.split('@')[0] || 'Agent',
      subscription_status: 'trial',
      subscription_ends_at: trialEndDate,
    });
  }

  /**
   * Update agent profile
   */
  async update(id: string, input: UpdateAgentInput): Promise<void> {
    await this.agentRepo.update(id, input);
  }
}
