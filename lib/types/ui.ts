/**
 * UI Types - Dashboard and Display Types
 *
 * Types specific to UI components and display purposes.
 */

import type { City, LeadStatus, WindowClosingReason } from './enums';
import type { Lead, UpgradeAlert } from './entities';

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  total_leads: number;
  qualified_leads: number;
  stretch_leads: number;
  not_qualified_leads: number;
  upgrade_ready_leads: number;
  leads_by_status: Record<LeadStatus, number>;
  leads_by_city: Record<City, number>;
  recent_leads: Lead[];
  pending_alerts: UpgradeAlert[];

  // Upgrade Opportunity Metrics
  total_upgrade_opportunity_value?: number;
  estimated_double_commission?: number;
  window_open_count?: number;
  planning_count?: number;

  // Timing Intelligence
  clients_approaching_equity_threshold?: Lead[];
  lease_endings_next_90_days?: Lead[];
  high_income_growth_clients?: Lead[];

  // Conversion Tracking
  conversion_rate_window_to_executed?: number;
  average_days_window_to_executed?: number;
  lost_this_month?: number;
  executed_this_month?: number;

  // Window Closing Alerts
  window_closing_alerts?: WindowClosingAlert[];
}

export interface WindowClosingAlert {
  lead_id: string;
  lead_name: string;
  reason: WindowClosingReason;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  created_at: string;
}

// ============================================
// Budget Range Presets (RM)
// ============================================

export interface BudgetRange {
  min: number;
  max: number;
  label: string;
}

export const INCOME_RANGES: BudgetRange[] = [
  { min: 2000, max: 3000, label: 'RM 2,000 - 3,000' },
  { min: 3000, max: 4000, label: 'RM 3,000 - 4,000' },
  { min: 4000, max: 5000, label: 'RM 4,000 - 5,000' },
  { min: 5000, max: 6000, label: 'RM 5,000 - 6,000' },
  { min: 6000, max: 8000, label: 'RM 6,000 - 8,000' },
  { min: 8000, max: 10000, label: 'RM 8,000 - 10,000' },
  { min: 10000, max: 15000, label: 'RM 10,000 - 15,000' },
  { min: 15000, max: 20000, label: 'RM 15,000 - 20,000' },
  { min: 20000, max: 30000, label: 'RM 20,000 - 30,000' },
  { min: 30000, max: 50000, label: 'RM 30,000+' },
];

export const RENT_BUDGET_RANGES: BudgetRange[] = [
  { min: 500, max: 1000, label: 'RM 500 - 1,000' },
  { min: 1000, max: 1500, label: 'RM 1,000 - 1,500' },
  { min: 1500, max: 2000, label: 'RM 1,500 - 2,000' },
  { min: 2000, max: 3000, label: 'RM 2,000 - 3,000' },
  { min: 3000, max: 4000, label: 'RM 3,000 - 4,000' },
  { min: 4000, max: 5000, label: 'RM 4,000 - 5,000' },
  { min: 5000, max: 7000, label: 'RM 5,000 - 7,000' },
  { min: 7000, max: 10000, label: 'RM 7,000 - 10,000' },
  { min: 10000, max: 15000, label: 'RM 10,000 - 15,000' },
  { min: 15000, max: 25000, label: 'RM 15,000+' },
];

export const BUY_BUDGET_RANGES: BudgetRange[] = [
  { min: 150000, max: 250000, label: 'RM 150K - 250K' },
  { min: 250000, max: 400000, label: 'RM 250K - 400K' },
  { min: 400000, max: 600000, label: 'RM 400K - 600K' },
  { min: 600000, max: 800000, label: 'RM 600K - 800K' },
  { min: 800000, max: 1000000, label: 'RM 800K - 1M' },
  { min: 1000000, max: 1500000, label: 'RM 1M - 1.5M' },
  { min: 1500000, max: 2000000, label: 'RM 1.5M - 2M' },
  { min: 2000000, max: 3000000, label: 'RM 2M - 3M' },
  { min: 3000000, max: 5000000, label: 'RM 3M+' },
];
