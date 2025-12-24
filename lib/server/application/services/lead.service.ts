/**
 * Lead Service - Business Logic Layer
 * 
 * Encapsulates all business logic for lead management including
 * qualification, upgrades, and access control.
 */
import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  Lead, 
  PricingRule, 
  CreateLeadInput, 
  LeadStatus,
  LeadEvent,
} from '../../domain/entities';
import { NotFoundError, ForbiddenError, PreconditionError } from '../../domain/errors';
import { LeadRepository } from '../../infrastructure/repositories/lead.repository';
import { PricingRuleRepository } from '../../infrastructure/repositories/pricing-rule.repository';
import { LeadEventRepository } from '../../infrastructure/repositories/lead-event.repository';
import { AlertRepository } from '../../infrastructure/repositories/alert.repository';
import { AgentRepository } from '../../infrastructure/repositories/agent.repository';
import { qualifyLead, type QualificationResult } from '@/lib/qualification-engine';
import { detectUpgradeTriggers } from '@/lib/upgrade-triggers';

export interface LeadServiceContext {
  userId: string;
  agentRole?: string;
  agencyId?: string;
}

export interface CreateLeadResult {
  lead: Lead;
  qualification: QualificationResult;
}

export class LeadService {
  private readonly leadRepo: LeadRepository;
  private readonly pricingRepo: PricingRuleRepository;
  private readonly eventRepo: LeadEventRepository;
  private readonly alertRepo: AlertRepository;
  private readonly agentRepo: AgentRepository;

  constructor(private readonly supabase: SupabaseClient) {
    this.leadRepo = new LeadRepository(supabase);
    this.pricingRepo = new PricingRuleRepository(supabase);
    this.eventRepo = new LeadEventRepository(supabase);
    this.alertRepo = new AlertRepository(supabase);
    this.agentRepo = new AgentRepository(supabase);
  }

  /**
   * Check if user has access to a lead
   */
  private async checkAccess(lead: Lead, ctx: LeadServiceContext): Promise<boolean> {
    // Owner always has access
    if (lead.agent_id === ctx.userId) {
      return true;
    }

    // Admin can access leads in their agency
    if (ctx.agentRole === 'admin' && ctx.agencyId) {
      const leadAgent = await this.agentRepo.findById(lead.agent_id);
      return leadAgent?.agency_id === ctx.agencyId;
    }

    return false;
  }

  /**
   * Get pricing rules or throw if not configured
   */
  private async getPricingRules(): Promise<PricingRule[]> {
    const rules = await this.pricingRepo.findActive();
    if (rules.length === 0) {
      throw new PreconditionError('Pricing rules not configured');
    }
    return rules;
  }

  /**
   * Create a new lead with automatic qualification
   */
  async create(input: CreateLeadInput, ctx: LeadServiceContext): Promise<CreateLeadResult> {
    const pricingRules = await this.getPricingRules();
    
    // Qualify the lead
    const qualificationResult = qualifyLead(input, pricingRules);

    // Create the lead
    const lead = await this.leadRepo.create({
      agent_id: ctx.userId,
      ...input,
      qualification_score: qualificationResult.score,
      qualification_status: qualificationResult.status,
      financing_readiness: qualificationResult.financingReadiness,
      suggested_areas: qualificationResult.suggestedAreas,
      qualification_breakdown: qualificationResult.breakdown,
    });

    // Record creation event
    await this.eventRepo.createAsync({
      lead_id: lead.id,
      agent_id: ctx.userId,
      event_type: 'created',
      event_data: { qualification_score: qualificationResult.score },
    });

    return { lead, qualification: qualificationResult };
  }

  /**
   * Update an existing lead
   */
  async update(
    id: string, 
    input: Partial<CreateLeadInput> & { status?: LeadStatus }, 
    ctx: LeadServiceContext
  ): Promise<Lead> {
    // Get existing lead
    const existingLead = await this.leadRepo.findById(id);
    if (!existingLead) {
      throw new NotFoundError('Lead', id);
    }

    // Check access
    const hasAccess = await this.checkAccess(existingLead, ctx);
    if (!hasAccess) {
      throw new ForbiddenError('Access denied');
    }

    // Get pricing rules
    const pricingRules = await this.pricingRepo.findActive();

    // Merge and check if requalification needed
    const mergedData = { ...existingLead, ...input };
    const qualificationFields = [
      'monthly_income_min', 'monthly_income_max', 'preferred_city',
      'preferred_areas', 'intent', 'budget_min', 'budget_max',
      'employment_type', 'existing_loan_commitment_percent',
    ];
    
    const needsRequalification = qualificationFields.some(
      field => input[field as keyof typeof input] !== undefined
    );

    const updatePayload: Record<string, unknown> = { ...input };

    if (needsRequalification && pricingRules.length > 0) {
      const qualificationResult = qualifyLead(
        mergedData as CreateLeadInput,
        pricingRules
      );
      updatePayload.qualification_score = qualificationResult.score;
      updatePayload.qualification_status = qualificationResult.status;
      updatePayload.financing_readiness = qualificationResult.financingReadiness;
      updatePayload.suggested_areas = qualificationResult.suggestedAreas;
      updatePayload.qualification_breakdown = qualificationResult.breakdown;
    }

    // Check for upgrade triggers
    const triggerResult = detectUpgradeTriggers(
      mergedData as Lead,
      existingLead
    );

    if (triggerResult.isUpgradeReady) {
      updatePayload.is_upgrade_ready = true;
      updatePayload.upgrade_triggers = [
        ...(existingLead.upgrade_triggers || []),
        ...triggerResult.triggers,
      ];
    }

    // Update lead
    const lead = await this.leadRepo.update(id, updatePayload);

    // Record events
    if (input.status && input.status !== existingLead.status) {
      await this.eventRepo.createAsync({
        lead_id: id,
        agent_id: ctx.userId,
        event_type: 'status_changed',
        event_data: { old_status: existingLead.status, new_status: input.status },
      });
    }

    // Create upgrade alerts
    if (triggerResult.alerts.length > 0) {
      await this.alertRepo.createMany(
        triggerResult.alerts.map(alert => ({
          ...alert,
          agent_id: ctx.userId,
        }))
      );
    }

    return lead;
  }

  /**
   * Delete a lead
   */
  async delete(id: string, ctx: LeadServiceContext): Promise<void> {
    await this.leadRepo.delete(id, ctx.userId);
  }

  /**
   * Get a single lead by ID
   */
  async getById(id: string, ctx: LeadServiceContext): Promise<Lead> {
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
   * List leads with optional filters
   */
  async list(
    filters: {
      status?: LeadStatus;
      city?: string;
      qualificationStatus?: string;
    } | undefined,
    ctx: LeadServiceContext
  ): Promise<Lead[]> {
    // Determine which agent IDs to query
    let agentIds: string[];

    if (ctx.agentRole === 'admin' && ctx.agencyId) {
      agentIds = await this.agentRepo.getAgentIdsByAgency(ctx.agencyId);
    } else {
      agentIds = [ctx.userId];
    }

    return this.leadRepo.findMany({
      agentIds,
      status: filters?.status as LeadStatus | undefined,
      city: filters?.city as Lead['preferred_city'] | undefined,
      qualificationStatus: filters?.qualificationStatus as Lead['qualification_status'] | undefined,
    });
  }

  /**
   * Update lead status
   */
  async updateStatus(id: string, status: LeadStatus, ctx: LeadServiceContext): Promise<void> {
    const lead = await this.leadRepo.findById(id);
    if (!lead) {
      throw new NotFoundError('Lead', id);
    }

    if (lead.agent_id !== ctx.userId) {
      throw new ForbiddenError('Access denied');
    }

    await this.leadRepo.updateStatus(id, status);

    // Log event
    await this.eventRepo.createAsync({
      lead_id: id,
      agent_id: ctx.userId,
      event_type: 'status_changed',
      event_data: { old_status: lead.status, new_status: status },
    });
  }

  /**
   * Get lead events/history
   */
  async getEvents(leadId: string, ctx: LeadServiceContext): Promise<LeadEvent[]> {
    return this.eventRepo.findByLeadId(leadId, ctx.userId);
  }

  /**
   * Log a contact with a lead
   */
  async logContact(leadId: string, notes: string | undefined, ctx: LeadServiceContext): Promise<void> {
    await this.leadRepo.update(leadId, { last_contacted_at: new Date().toISOString() });

    await this.eventRepo.createAsync({
      lead_id: leadId,
      agent_id: ctx.userId,
      event_type: 'contacted',
      notes,
    });
  }
}
