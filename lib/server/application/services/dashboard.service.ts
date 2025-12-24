/**
 * Dashboard Service - Business Logic Layer
 * 
 * Encapsulates all business logic for dashboard statistics.
 */
import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DashboardStats, Lead, LeadStatus, PricingRule } from '../../domain/entities';
import { LeadRepository } from '../../infrastructure/repositories/lead.repository';
import { AlertRepository } from '../../infrastructure/repositories/alert.repository';
import { PricingRuleRepository } from '../../infrastructure/repositories/pricing-rule.repository';

export interface DashboardServiceContext {
  userId: string;
}

export class DashboardService {
  private readonly leadRepo: LeadRepository;
  private readonly alertRepo: AlertRepository;
  private readonly pricingRepo: PricingRuleRepository;

  constructor(private readonly supabase: SupabaseClient) {
    this.leadRepo = new LeadRepository(supabase);
    this.alertRepo = new AlertRepository(supabase);
    this.pricingRepo = new PricingRuleRepository(supabase);
  }

  /**
   * Get dashboard statistics for the current agent
   */
  async getStats(ctx: DashboardServiceContext): Promise<DashboardStats> {
    // Get all leads for the agent
    const allLeads = await this.leadRepo.findMany({ agentId: ctx.userId });

    // Calculate stats
    const stats: DashboardStats = {
      total_leads: allLeads.length,
      qualified_leads: allLeads.filter(l => l.qualification_status === 'qualified').length,
      stretch_leads: allLeads.filter(l => l.qualification_status === 'stretch').length,
      not_qualified_leads: allLeads.filter(l => l.qualification_status === 'not_qualified').length,
      upgrade_ready_leads: allLeads.filter(l => l.is_upgrade_ready).length,
      leads_by_status: {} as Record<LeadStatus, number>,
      leads_by_city: {} as Record<string, number>,
      recent_leads: allLeads.slice(0, 5),
      pending_alerts: [],
    };

    // Group by status
    for (const lead of allLeads) {
      stats.leads_by_status[lead.status] = (stats.leads_by_status[lead.status] || 0) + 1;
      stats.leads_by_city[lead.preferred_city] = (stats.leads_by_city[lead.preferred_city] || 0) + 1;
    }

    // Get pending alerts
    stats.pending_alerts = await this.alertRepo.findPending(ctx.userId, 5);

    return stats;
  }

  /**
   * Get pricing rules (for qualification display)
   */
  async getPricingRules(): Promise<PricingRule[]> {
    return this.pricingRepo.findActive();
  }
}
