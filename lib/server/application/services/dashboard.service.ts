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

    // Calculate upgrade pipeline stats
    const windowOpenLeads = allLeads.filter(l => l.upgrade_stage === 'window_open');
    const planningLeads = allLeads.filter(l => l.upgrade_stage === 'planning');
    const executedLeads = allLeads.filter(l => l.upgrade_stage === 'executed');
    const lostLeads = allLeads.filter(l => l.upgrade_stage === 'lost');
    
    const activeOpportunities = [...windowOpenLeads, ...planningLeads];
    const totalOpportunityValue = activeOpportunities.reduce((sum, lead) => {
      return sum + (lead.upgrade_budget_max || lead.budget_max || 0);
    }, 0);
    
    // Estimate commission (3% for sell + buy double transaction)
    const estimatedCommission = totalOpportunityValue * 0.03;
    
    // Calculate conversion rate
    const totalWindowOpen = windowOpenLeads.length + planningLeads.length + executedLeads.length + lostLeads.length;
    const conversionRate = totalWindowOpen > 0 ? (executedLeads.length / totalWindowOpen) * 100 : 0;
    
    // Get leads approaching equity threshold (15-20% equity)
    // Compute equity from current_property_value and outstanding_loan_balance
    const clientsApproachingEquity = allLeads.filter(l => {
      if (!l.current_property_value || !l.outstanding_loan_balance) return false;
      const equityPercent = ((l.current_property_value - l.outstanding_loan_balance) / l.current_property_value) * 100;
      return equityPercent >= 15 && equityPercent < 20;
    });
    
    // Get lease endings in next 90 days
    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const leaseEndings = allLeads.filter(l => {
      if (!l.lease_end_date) return false;
      const leaseEnd = new Date(l.lease_end_date);
      return leaseEnd >= now && leaseEnd <= ninetyDaysFromNow;
    });
    
    // High income growth clients - compute from income_history if available
    const highIncomeGrowth = allLeads.filter(l => {
      if (!l.income_history || l.income_history.length < 2) return false;
      const sorted = [...l.income_history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const oldest = sorted[0].amount;
      const newest = sorted[sorted.length - 1].amount;
      if (oldest <= 0) return false;
      const growthPercent = ((newest - oldest) / oldest) * 100;
      return growthPercent >= 15;
    });

    // Property anniversary clients (3-year and 5-year milestones)
    // These are prime upgrade windows - agents should call these clients TODAY
    const currentYear = now.getFullYear();
    const propertyAnniversaryClients = allLeads
      .filter(l => {
        if (!l.current_property_purchase_year) return false;
        const yearsOwned = currentYear - l.current_property_purchase_year;
        return yearsOwned === 3 || yearsOwned === 5;
      })
      .map(l => ({
        ...l,
        years_owned: currentYear - l.current_property_purchase_year!,
      }))
      // Sort: 5-year first (higher priority), then 3-year
      .sort((a, b) => b.years_owned - a.years_owned);

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
      
      // Upgrade pipeline metrics
      window_open_count: windowOpenLeads.length,
      planning_count: planningLeads.length,
      total_upgrade_opportunity_value: totalOpportunityValue,
      estimated_double_commission: estimatedCommission,
      conversion_rate_window_to_executed: conversionRate,
      executed_this_month: executedLeads.length,
      lost_this_month: lostLeads.length,
      
      // Timing intelligence
      clients_approaching_equity_threshold: clientsApproachingEquity,
      lease_endings_next_90_days: leaseEndings,
      high_income_growth_clients: highIncomeGrowth,
      property_anniversary_clients: propertyAnniversaryClients,
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
