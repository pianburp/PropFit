// ============================================
// Database Types for Lead Qualification Platform
// ============================================

// City Options
export type City = 'klang_valley' | 'penang' | 'johor_bahru';

export const CITY_LABELS: Record<City, string> = {
  klang_valley: 'Klang Valley',
  penang: 'Penang',
  johor_bahru: 'Johor Bahru',
};

// Intent Options
export type Intent = 'rent' | 'buy';

export const INTENT_LABELS: Record<Intent, string> = {
  rent: 'Rent',
  buy: 'Buy',
};

// Move-in Timeline Options
export type MoveInTimeline = 'immediate' | '1_3_months' | '3_6_months' | '6_12_months' | 'flexible';

export const TIMELINE_LABELS: Record<MoveInTimeline, string> = {
  immediate: 'Immediately',
  '1_3_months': '1-3 Months',
  '3_6_months': '3-6 Months',
  '6_12_months': '6-12 Months',
  flexible: 'Flexible',
};

// Employment Type Options
export type EmploymentType = 'permanent' | 'contract' | 'self_employed' | 'business_owner' | 'freelance';

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  permanent: 'Permanent Employee',
  contract: 'Contract Worker',
  self_employed: 'Self-Employed',
  business_owner: 'Business Owner',
  freelance: 'Freelancer',
};

// Lead Status Options
export type LeadStatus = 'new' | 'contacted' | 'viewing_scheduled' | 'negotiating' | 'closed_won' | 'closed_lost' | 'nurturing';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  viewing_scheduled: 'Viewing Scheduled',
  negotiating: 'Negotiating',
  closed_won: 'Closed (Won)',
  closed_lost: 'Closed (Lost)',
  nurturing: 'Nurturing',
};

// Qualification Status Options
export type QualificationStatus = 'pending' | 'not_qualified' | 'stretch' | 'qualified';

export const QUALIFICATION_STATUS_LABELS: Record<QualificationStatus, string> = {
  pending: 'Pending',
  not_qualified: 'Not Qualified',
  stretch: 'Stretch',
  qualified: 'Qualified',
};

export const QUALIFICATION_STATUS_COLORS: Record<QualificationStatus, string> = {
  pending: 'bg-gray-100 text-gray-800',
  not_qualified: 'bg-red-100 text-red-800',
  stretch: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
};

// Financing Readiness Options
export type FinancingReadiness = 'weak' | 'moderate' | 'strong';

export const FINANCING_READINESS_LABELS: Record<FinancingReadiness, string> = {
  weak: 'Weak',
  moderate: 'Moderate',
  strong: 'Strong',
};

export const FINANCING_READINESS_COLORS: Record<FinancingReadiness, string> = {
  weak: 'bg-red-100 text-red-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  strong: 'bg-green-100 text-green-800',
};

// Subscription Status
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';

// Lead Event Types
export type LeadEventType =
  | 'created'
  | 'status_changed'
  | 'income_updated'
  | 'budget_updated'
  | 'areas_updated'
  | 'intent_changed'
  | 'contacted'
  | 'viewing_scheduled'
  | 'note_added'
  | 'upgrade_triggered'
  | 'qualification_recalculated';

// Upgrade Alert Types
export type UpgradeAlertType =
  | 'income_increase'
  | 'lead_matured'
  | 'lease_ending'
  | 'higher_tier_interest'
  | 'rent_to_buy_ready';

// ============================================
// Database Table Types
// ============================================

export interface Agent {
  id: string;
  full_name: string;
  phone?: string;
  agency_name?: string;
  license_number?: string;
  preferred_cities: City[];
  subscription_status: SubscriptionStatus;
  subscription_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  agent_id: string;
  
  // Required fields
  name: string;
  phone: string;
  monthly_income_min: number;
  monthly_income_max: number;
  preferred_city: City;
  preferred_areas: string[];
  intent: Intent;
  budget_min: number;
  budget_max: number;
  move_in_timeline: MoveInTimeline;
  
  // Optional fields
  employment_type?: EmploymentType;
  years_in_current_job?: number;
  existing_loan_commitment_percent?: number;
  previous_loan_rejection?: boolean;
  is_first_time_buyer?: boolean;
  lease_end_date?: string;
  email?: string;
  notes?: string;
  
  // Scoring results
  qualification_score: number;
  qualification_status: QualificationStatus;
  financing_readiness?: FinancingReadiness;
  
  // Suggestions
  suggested_areas: SuggestedArea[];
  qualification_breakdown: QualificationBreakdown;
  
  // Status
  status: LeadStatus;
  is_upgrade_ready: boolean;
  upgrade_triggers: UpgradeTrigger[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_contacted_at?: string;
}

export interface LeadEvent {
  id: string;
  lead_id: string;
  agent_id: string;
  event_type: LeadEventType;
  event_data: Record<string, unknown>;
  notes?: string;
  created_at: string;
}

export interface AreaRule {
  min_budget: number;
  max_budget: number;
  tier: 'budget' | 'mid' | 'premium';
  avg_rent?: number;
  avg_price?: number;
}

export interface PricingRule {
  id: string;
  city: City;
  intent: Intent;
  area_rules: Record<string, AreaRule>;
  max_dti_ratio: number;
  price_to_installment_ratio: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpgradeAlert {
  id: string;
  lead_id: string;
  agent_id: string;
  alert_type: UpgradeAlertType;
  title: string;
  description: string;
  suggested_action?: string;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

// ============================================
// Business Logic Types
// ============================================

export interface SuggestedArea {
  area: string;
  reason: string;
  fit: 'perfect' | 'stretch' | 'alternative';
  estimated_budget: {
    min: number;
    max: number;
  };
}

export interface QualificationBreakdown {
  income_score: number;
  location_score: number;
  credit_score: number;
  urgency_score: number;
  total_score: number;
  details: {
    income_analysis: string;
    location_analysis: string;
    credit_analysis: string;
    urgency_analysis: string;
  };
}

export interface UpgradeTrigger {
  type: UpgradeAlertType;
  triggered_at: string;
  reason: string;
}

// ============================================
// Form Types
// ============================================

export interface CreateLeadInput {
  name: string;
  phone: string;
  monthly_income_min: number;
  monthly_income_max: number;
  preferred_city: City;
  preferred_areas: string[];
  intent: Intent;
  budget_min: number;
  budget_max: number;
  move_in_timeline: MoveInTimeline;
  
  employment_type?: EmploymentType;
  years_in_current_job?: number;
  existing_loan_commitment_percent?: number;
  previous_loan_rejection?: boolean;
  is_first_time_buyer?: boolean;
  lease_end_date?: string;
  email?: string;
  notes?: string;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  id: string;
  status?: LeadStatus;
}

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
}

// ============================================
// Income Range Presets (RM)
// ============================================

export const INCOME_RANGES = [
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

// Budget Ranges for Rent (RM/month)
export const RENT_BUDGET_RANGES = [
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

// Budget Ranges for Buy (RM)
export const BUY_BUDGET_RANGES = [
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
