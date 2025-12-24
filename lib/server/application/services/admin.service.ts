/**
 * Admin Service - Business Logic Layer
 * 
 * Encapsulates all business logic for admin operations.
 */
import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Agent, Lead } from '../../domain/entities';
import { NotFoundError, ForbiddenError, PreconditionError } from '../../domain/errors';
import { LeadRepository } from '../../infrastructure/repositories/lead.repository';
import { AgentRepository } from '../../infrastructure/repositories/agent.repository';
import { LeadEventRepository } from '../../infrastructure/repositories/lead-event.repository';
import { ReassignmentLogRepository } from '../../infrastructure/repositories/reassignment-log.repository';
import { UpgradeStageHistoryRepository } from '../../infrastructure/repositories/upgrade-stage-history.repository';

export interface AdminServiceContext {
  userId: string;
  agencyId?: string;
}

export interface ReassignClientInput {
  leadId: string;
  toAgentId: string;
  reason: string;
  notes?: string;
}

export interface AgencyDashboardStats {
  totalClients: number;
  clientsByReadinessState: Record<string, number>;
  clientsByUpgradeStage: Record<string, number>;
  upgradesExecutedThisMonth: number;
  upgradesExecutedThisYear: number;
  teamMembers: Agent[];
  isAdmin: boolean;
}

export class AdminService {
  private readonly leadRepo: LeadRepository;
  private readonly agentRepo: AgentRepository;
  private readonly eventRepo: LeadEventRepository;
  private readonly reassignmentRepo: ReassignmentLogRepository;
  private readonly stageHistoryRepo: UpgradeStageHistoryRepository;

  constructor(private readonly supabase: SupabaseClient) {
    this.leadRepo = new LeadRepository(supabase);
    this.agentRepo = new AgentRepository(supabase);
    this.eventRepo = new LeadEventRepository(supabase);
    this.reassignmentRepo = new ReassignmentLogRepository(supabase);
    this.stageHistoryRepo = new UpgradeStageHistoryRepository(supabase);
  }

  /**
   * Reassign a client to a different agent
   */
  async reassignClient(input: ReassignClientInput, ctx: AdminServiceContext): Promise<void> {
    const { leadId, toAgentId, reason, notes } = input;

    if (!ctx.agencyId) {
      throw new PreconditionError('No agency associated');
    }

    // Get the lead
    const lead = await this.leadRepo.findByIdWithAgent(leadId);
    if (!lead) {
      throw new NotFoundError('Lead', leadId);
    }

    // Verify target agent is in same agency
    const targetAgent = await this.agentRepo.findById(toAgentId);
    if (!targetAgent) {
      throw new NotFoundError('Agent', toAgentId);
    }

    if (targetAgent.agency_id !== ctx.agencyId) {
      throw new ForbiddenError('Target agent not in your agency');
    }

    const fromAgentId = lead.agent_id;

    // Update lead
    await this.leadRepo.update(leadId, { agent_id: toAgentId });

    // Log reassignment
    await this.reassignmentRepo.create({
      lead_id: leadId,
      from_agent_id: fromAgentId,
      to_agent_id: toAgentId,
      reassigned_by: ctx.userId,
      reason,
      notes,
    });

    // Log event
    await this.eventRepo.createAsync({
      lead_id: leadId,
      agent_id: ctx.userId,
      event_type: 'client_reassigned',
      event_data: {
        from_agent_id: fromAgentId,
        to_agent_id: toAgentId,
        reason,
      },
      notes,
    });
  }

  /**
   * Get team members in the agency
   */
  async getTeamMembers(ctx: AdminServiceContext): Promise<Agent[]> {
    if (!ctx.agencyId) {
      return [];
    }
    return this.agentRepo.findByAgencyId(ctx.agencyId);
  }

  /**
   * Get agency dashboard stats
   */
  async getAgencyDashboard(ctx: AdminServiceContext): Promise<AgencyDashboardStats> {
    if (!ctx.agencyId) {
      throw new PreconditionError('No agency associated');
    }

    // Get team members
    const team = await this.agentRepo.findByAgencyId(ctx.agencyId);
    const agentIds = team.map(a => a.id);

    // Get all leads for the agency
    const allLeads = await this.leadRepo.findMany({ agentIds });
    const totalClients = allLeads.length;

    // Count by readiness state
    const clientsByReadinessState: Record<string, number> = {
      not_ready: 0,
      monitoring: 0,
      ready: 0,
    };

    // Count by upgrade stage
    const clientsByUpgradeStage: Record<string, number> = {
      monitoring: 0,
      window_open: 0,
      planning: 0,
      executed: 0,
      lost: 0,
    };

    for (const lead of allLeads) {
      const readinessState = lead.upgrade_readiness_state || 'not_ready';
      const upgradeStage = lead.upgrade_stage || 'monitoring';
      
      clientsByReadinessState[readinessState] = (clientsByReadinessState[readinessState] || 0) + 1;
      clientsByUpgradeStage[upgradeStage] = (clientsByUpgradeStage[upgradeStage] || 0) + 1;
    }

    // Count executed upgrades this month and year
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thisYearStart = new Date(now.getFullYear(), 0, 1).toISOString();
    const leadIds = allLeads.map(l => l.id);

    const upgradesExecutedThisMonth = await this.stageHistoryRepo.countByStageInDateRange(
      leadIds,
      'executed',
      thisMonthStart
    );

    const upgradesExecutedThisYear = await this.stageHistoryRepo.countByStageInDateRange(
      leadIds,
      'executed',
      thisYearStart
    );

    return {
      totalClients,
      clientsByReadinessState,
      clientsByUpgradeStage,
      upgradesExecutedThisMonth,
      upgradesExecutedThisYear,
      teamMembers: team,
      isAdmin: true, // Only admins can access this endpoint
    };
  }
}
