/**
 * Pipeline Service - Business Logic Layer
 * 
 * Encapsulates all business logic for upgrade pipeline management
 * including financial snapshots, stage transitions, and conversation tracking.
 */
import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  Lead, 
  UpgradeStage,
  IncomeHistoryEntry,
  LifeMilestone,
  ConversationTimeline,
  ConversationStep,
  ConversationStepData,
  FallbackPlan,
  FallbackReason,
} from '../../domain/entities';
import { NotFoundError, ForbiddenError } from '../../domain/errors';
import { LeadRepository } from '../../infrastructure/repositories/lead.repository';
import { LeadEventRepository } from '../../infrastructure/repositories/lead-event.repository';
import { AlertRepository } from '../../infrastructure/repositories/alert.repository';
import { AgentRepository } from '../../infrastructure/repositories/agent.repository';
import { UpgradeStageHistoryRepository } from '../../infrastructure/repositories/upgrade-stage-history.repository';
import { calculateUpgradeReadiness } from '@/lib/upgrade-readiness';

export interface PipelineServiceContext {
  userId: string;
  agentRole?: string;
  agencyId?: string;
}

export interface FinancialSnapshotInput {
  leadId: string;
  currentIncome?: number;
  currentPropertyValue?: number;
  outstandingLoanBalance?: number;
  lifeMilestone?: {
    type: LifeMilestone['type'];
    date: string;
    notes?: string;
  };
}

export interface ChangeStageInput {
  leadId: string;
  newStage: UpgradeStage;
  reason?: string;
  notes?: string;
}

export interface ConversationStepInput {
  leadId: string;
  step: ConversationStep;
  completed: boolean;
  notes?: string;
}

export interface FallbackPlanInput {
  leadId: string;
  reason: FallbackReason;
  reason_notes?: string;
  next_review_date: string;
  advisory_notes?: string;
}

export class PipelineService {
  private readonly leadRepo: LeadRepository;
  private readonly eventRepo: LeadEventRepository;
  private readonly alertRepo: AlertRepository;
  private readonly agentRepo: AgentRepository;
  private readonly stageHistoryRepo: UpgradeStageHistoryRepository;

  constructor(private readonly supabase: SupabaseClient) {
    this.leadRepo = new LeadRepository(supabase);
    this.eventRepo = new LeadEventRepository(supabase);
    this.alertRepo = new AlertRepository(supabase);
    this.agentRepo = new AgentRepository(supabase);
    this.stageHistoryRepo = new UpgradeStageHistoryRepository(supabase);
  }

  /**
   * Check if user has access to a lead
   */
  private async checkAccess(lead: Lead, ctx: PipelineServiceContext): Promise<boolean> {
    if (lead.agent_id === ctx.userId) return true;

    if (ctx.agentRole === 'admin' && ctx.agencyId) {
      const leadAgent = await this.agentRepo.findById(lead.agent_id);
      return leadAgent?.agency_id === ctx.agencyId;
    }

    return false;
  }

  /**
   * Get lead with access check
   */
  private async getLeadWithAccess(id: string, ctx: PipelineServiceContext): Promise<Lead> {
    const lead = await this.leadRepo.findById(id);
    if (!lead) {
      throw new NotFoundError('Lead', id);
    }

    const hasAccess = await this.checkAccess(lead, ctx);
    if (!hasAccess) {
      throw new ForbiddenError('Access denied');
    }

    return lead;
  }

  /**
   * Update client financial snapshot
   */
  async updateFinancialSnapshot(input: FinancialSnapshotInput, ctx: PipelineServiceContext): Promise<Lead> {
    const { leadId, currentIncome, currentPropertyValue, outstandingLoanBalance, lifeMilestone } = input;
    
    const existingLead = await this.getLeadWithAccess(leadId, ctx);
    const now = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {};

    // Update income and add to history
    if (currentIncome !== undefined) {
      updatePayload.current_income = currentIncome;
      updatePayload.income_last_updated = now;
      
      const incomeHistory: IncomeHistoryEntry[] = existingLead.income_history || [];
      incomeHistory.push({
        amount: currentIncome,
        date: now,
        notes: 'Updated via financial snapshot',
      });
      updatePayload.income_history = incomeHistory;
    }

    // Update property value
    if (currentPropertyValue !== undefined) {
      updatePayload.current_property_value = currentPropertyValue;
      updatePayload.property_value_last_updated = now;
    }

    // Update loan balance
    if (outstandingLoanBalance !== undefined) {
      updatePayload.outstanding_loan_balance = outstandingLoanBalance;
      updatePayload.loan_balance_last_updated = now;
    }

    // Add life milestone
    if (lifeMilestone) {
      const milestones: LifeMilestone[] = existingLead.life_milestones || [];
      milestones.push(lifeMilestone as LifeMilestone);
      updatePayload.life_milestones = milestones;
    }

    // Recalculate upgrade readiness
    const updatedLead = { ...existingLead, ...updatePayload } as Lead;
    const readinessResult = calculateUpgradeReadiness(updatedLead);
    
    updatePayload.upgrade_readiness_score = readinessResult.score;
    updatePayload.upgrade_readiness_state = readinessResult.state;
    updatePayload.upgrade_readiness_breakdown = readinessResult.breakdown;

    // Check for readiness state change
    const previousState = existingLead.upgrade_readiness_state || 'not_ready';
    const newState = readinessResult.state;

    // Update lead
    const lead = await this.leadRepo.update(leadId, updatePayload);

    // Log event
    await this.eventRepo.createAsync({
      lead_id: leadId,
      agent_id: ctx.userId,
      event_type: 'financial_snapshot_updated',
      event_data: {
        updated_fields: Object.keys(updatePayload),
        new_readiness_score: readinessResult.score,
        new_readiness_state: readinessResult.state,
      },
    });

    // Create alert if readiness state improved to 'ready'
    if (previousState !== 'ready' && newState === 'ready') {
      await this.alertRepo.create({
        lead_id: leadId,
        agent_id: existingLead.agent_id,
        alert_type: 'readiness_state_changed',
        title: '🎯 Client Ready for Upgrade',
        description: `${existingLead.name} has reached upgrade readiness. Score: ${readinessResult.score}/100.`,
        suggested_action: 'Schedule upgrade conversation and prepare affordability analysis.',
        is_read: false,
        is_dismissed: false,
      });
    }

    return lead;
  }

  /**
   * Change upgrade stage with audit trail
   */
  async changeUpgradeStage(input: ChangeStageInput, ctx: PipelineServiceContext): Promise<void> {
    const { leadId, newStage, reason, notes } = input;
    
    const existingLead = await this.getLeadWithAccess(leadId, ctx);
    const previousStage = existingLead.upgrade_stage || 'monitoring';

    // Update lead
    await this.leadRepo.update(leadId, { upgrade_stage: newStage });

    // Record stage history
    await this.stageHistoryRepo.create({
      lead_id: leadId,
      from_stage: previousStage,
      to_stage: newStage,
      changed_by: ctx.userId,
      reason,
      notes,
    });

    // Log event
    await this.eventRepo.createAsync({
      lead_id: leadId,
      agent_id: ctx.userId,
      event_type: 'upgrade_stage_changed',
      event_data: {
        from_stage: previousStage,
        to_stage: newStage,
        reason,
      },
      notes,
    });
  }

  /**
   * Get clients grouped by upgrade stage (pipeline view)
   */
  async getClientsByStage(ctx: PipelineServiceContext): Promise<Record<UpgradeStage, Lead[]>> {
    // Get agent IDs to query
    let agentIds: string[];

    if (ctx.agentRole === 'admin' && ctx.agencyId) {
      agentIds = await this.agentRepo.getAgentIdsByAgency(ctx.agencyId);
    } else {
      agentIds = [ctx.userId];
    }

    const leads = await this.leadRepo.findByUpgradeStage(agentIds);

    // Group by stage
    const grouped: Record<UpgradeStage, Lead[]> = {
      monitoring: [],
      window_open: [],
      planning: [],
      executed: [],
      lost: [],
    };

    for (const lead of leads) {
      const stage = (lead.upgrade_stage || 'monitoring') as UpgradeStage;
      if (grouped[stage]) {
        grouped[stage].push(lead);
      }
    }

    return grouped;
  }

  /**
   * Update conversation timeline step
   */
  async updateConversationStep(input: ConversationStepInput, ctx: PipelineServiceContext): Promise<void> {
    const { leadId, step, completed, notes } = input;
    
    const existingLead = await this.getLeadWithAccess(leadId, ctx);

    // Get or initialize timeline
    const timeline: ConversationTimeline = existingLead.conversation_timeline || {
      financial_validation: { completed: false },
      soft_discussion: { completed: false },
      family_alignment: { completed: false },
      property_matching: { completed: false },
      execution: { completed: false },
    };

    // Update the step
    const stepData: ConversationStepData = {
      completed,
      completed_at: completed ? new Date().toISOString() : undefined,
      notes: notes || undefined,
    };
    timeline[step] = stepData;

    // Update lead
    await this.leadRepo.update(leadId, { conversation_timeline: timeline });
  }

  /**
   * Save fallback plan when upgrade not proceeding
   */
  async saveFallbackPlan(input: FallbackPlanInput, ctx: PipelineServiceContext): Promise<void> {
    const { leadId, ...planData } = input;
    
    const existingLead = await this.getLeadWithAccess(leadId, ctx);

    // Create fallback plan with timestamp
    const fallbackPlan: FallbackPlan = {
      ...planData,
      created_at: new Date().toISOString(),
    };

    // Update lead
    await this.leadRepo.update(leadId, { fallback_plan: fallbackPlan });

    // Log event
    await this.eventRepo.createAsync({
      lead_id: leadId,
      agent_id: ctx.userId,
      event_type: 'note_added',
      event_data: {
        type: 'fallback_plan',
        reason: planData.reason,
        next_review_date: planData.next_review_date,
      },
      notes: planData.advisory_notes,
    });
  }

  /**
   * Mark a lead as lost in the upgrade pipeline
   */
  async markAsLost(
    input: { leadId: string; lostReason: string; lostNotes?: string },
    ctx: PipelineServiceContext
  ): Promise<void> {
    const { leadId, lostReason, lostNotes } = input;
    
    const existingLead = await this.getLeadWithAccess(leadId, ctx);
    const previousStage = existingLead.upgrade_stage || 'monitoring';
    const now = new Date().toISOString();

    // Update lead with lost status
    await this.leadRepo.update(leadId, {
      upgrade_stage: 'lost',
      lost_reason: lostReason,
      lost_reason_notes: lostNotes,
      lost_at: now,
    });

    // Record stage history
    await this.stageHistoryRepo.create({
      lead_id: leadId,
      from_stage: previousStage,
      to_stage: 'lost',
      changed_by: ctx.userId,
      reason: lostReason,
      notes: lostNotes,
    });

    // Log event
    await this.eventRepo.createAsync({
      lead_id: leadId,
      agent_id: ctx.userId,
      event_type: 'upgrade_stage_changed',
      event_data: {
        from_stage: previousStage,
        to_stage: 'lost',
        lost_reason: lostReason,
      },
      notes: lostNotes,
    });
  }
}
