/**
 * Entity Types - Core Business Objects
 *
 * Database entity types representing the core domain models.
 */

import type {
  City,
  Intent,
  MoveInTimeline,
  EmploymentType,
  LeadStatus,
  QualificationStatus,
  FinancingReadiness,
  SubscriptionStatus,
  AgentRole,
  UpgradeStage,
  UpgradeReadinessState,
  LeadEventType,
  UpgradeAlertType,
  LifeMilestoneType,
  PropertyType,
  LostReasonType,
  FamilyAlignmentStatus,
  UpgradeIntentSignal,
  ConversationStep,
  FallbackReason,
  DealRiskType,
} from './enums';

// ============================================
// Agency
// ============================================

export interface Agency {
  id: string;
  name: string;
  is_personal: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Agent
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
  agency_id?: string;
  role: AgentRole;
  agency?: Agency;
  created_at: string;
  updated_at: string;
}

// ============================================
// Value Objects
// ============================================

export interface IncomeHistoryEntry {
  amount: number;
  date: string;
  notes?: string;
}

export interface LifeMilestone {
  type: LifeMilestoneType;
  date: string;
  notes?: string;
}

export interface UpgradeReadinessBreakdown {
  income_growth_score: number;
  income_growth_reason: string;
  equity_score: number;
  equity_reason: string;
  debt_score: number;
  debt_reason: string;
  employment_score: number;
  employment_reason: string;
  rejection_score: number;
  rejection_reason: string;
  total_score: number;
}

export interface ConversationStepData {
  completed: boolean;
  completed_at?: string;
  notes?: string;
}

export interface ConversationTimeline {
  financial_validation: ConversationStepData;
  soft_discussion: ConversationStepData;
  family_alignment: ConversationStepData;
  property_matching: ConversationStepData;
  execution: ConversationStepData;
}

export interface FallbackPlan {
  reason: FallbackReason;
  reason_notes?: string;
  next_review_date: string;
  advisory_notes?: string;
  created_at: string;
}

export interface DealRiskFlag {
  type: DealRiskType;
  reason: string;
  details: string;
}

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

export interface AreaRule {
  min_budget: number;
  max_budget: number;
  tier: 'budget' | 'mid' | 'premium';
  avg_rent?: number;
  avg_price?: number;
}

// ============================================
// Lead
// ============================================

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

  // Current Property (for upgrade analysis)
  current_property_type?: PropertyType;
  current_property_location?: string;
  current_property_city?: City;
  current_property_purchase_year?: number;
  current_property_purchase_price?: number;

  // Family & Decision Maker Alignment
  family_alignment_status?: FamilyAlignmentStatus;
  family_alignment_notes?: string;
  co_applicant_income?: number;
  number_of_decision_makers?: number;

  // Upgrade Intent Signals
  upgrade_intent_signals?: UpgradeIntentSignal[];
  upgrade_target_property_type?: PropertyType;
  upgrade_target_areas?: string[];
  upgrade_budget_min?: number;
  upgrade_budget_max?: number;

  // Lost Deal Tracking
  lost_reason?: LostReasonType;
  lost_reason_notes?: string;
  lost_at?: string;

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

  // Financial Snapshot
  current_income?: number;
  income_last_updated?: string;
  income_history: IncomeHistoryEntry[];
  current_property_value?: number;
  property_value_last_updated?: string;
  outstanding_loan_balance?: number;
  loan_balance_last_updated?: string;
  life_milestones: LifeMilestone[];

  // Upgrade Pipeline
  upgrade_stage: UpgradeStage;
  upgrade_stage_changed_at: string;
  upgrade_readiness_score: number;
  upgrade_readiness_state: UpgradeReadinessState;
  upgrade_readiness_breakdown: UpgradeReadinessBreakdown;

  // Conversation Timeline
  conversation_timeline?: ConversationTimeline;

  // Fallback Plan
  fallback_plan?: FallbackPlan;

  // Timestamps
  created_at: string;
  updated_at: string;
  last_contacted_at?: string;
}

// ============================================
// Lead Event
// ============================================

export interface LeadEvent {
  id: string;
  lead_id: string;
  agent_id: string;
  event_type: LeadEventType;
  event_data: Record<string, unknown>;
  notes?: string;
  created_at: string;
}

// ============================================
// Pricing Rule
// ============================================

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

// ============================================
// Upgrade Alert
// ============================================

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
