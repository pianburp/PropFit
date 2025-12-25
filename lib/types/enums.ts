/**
 * Enum Types and Associated Labels/Colors
 *
 * Contains all enum-like types and their display mappings.
 */

// ============================================
// City Options
// ============================================

export type City = 'klang_valley' | 'penang' | 'johor_bahru';

export const CITY_LABELS: Record<City, string> = {
  klang_valley: 'Klang Valley',
  penang: 'Penang',
  johor_bahru: 'Johor Bahru',
};

// ============================================
// Intent Options
// ============================================

export type Intent = 'rent' | 'buy';

export const INTENT_LABELS: Record<Intent, string> = {
  rent: 'Rent',
  buy: 'Buy',
};

// ============================================
// Move-in Timeline Options
// ============================================

export type MoveInTimeline = 'immediate' | '1_3_months' | '3_6_months' | '6_12_months' | 'flexible';

export const TIMELINE_LABELS: Record<MoveInTimeline, string> = {
  immediate: 'Immediately',
  '1_3_months': '1-3 Months',
  '3_6_months': '3-6 Months',
  '6_12_months': '6-12 Months',
  flexible: 'Flexible',
};

// ============================================
// Employment Type Options
// ============================================

export type EmploymentType = 'permanent' | 'contract' | 'self_employed' | 'business_owner' | 'freelance';

export const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  permanent: 'Permanent Employee',
  contract: 'Contract Worker',
  self_employed: 'Self-Employed',
  business_owner: 'Business Owner',
  freelance: 'Freelancer',
};

// ============================================
// Lead Status Options
// ============================================

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

// ============================================
// Qualification Status Options
// ============================================

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

// ============================================
// Financing Readiness Options
// ============================================

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

// ============================================
// Subscription Status
// ============================================

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';

// ============================================
// Agent Role Options (B2B)
// ============================================

export type AgentRole = 'admin' | 'agent';

export const AGENT_ROLE_LABELS: Record<AgentRole, string> = {
  admin: 'Admin',
  agent: 'Agent',
};

// ============================================
// Upgrade Pipeline Stage Options
// ============================================

export type UpgradeStage = 'monitoring' | 'window_open' | 'planning' | 'executed' | 'lost';

export const UPGRADE_STAGE_LABELS: Record<UpgradeStage, string> = {
  monitoring: 'Monitoring',
  window_open: 'Window Open',
  planning: 'Planning',
  executed: 'Executed',
  lost: 'Lost',
};

export const UPGRADE_STAGE_COLORS: Record<UpgradeStage, string> = {
  monitoring: 'bg-slate-100 text-slate-800',
  window_open: 'bg-blue-100 text-blue-800',
  planning: 'bg-amber-100 text-amber-800',
  executed: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

export const UPGRADE_STAGE_ORDER: UpgradeStage[] = [
  'monitoring',
  'window_open',
  'planning',
  'executed',
  'lost',
];

// ============================================
// Upgrade Readiness State
// ============================================

export type UpgradeReadinessState = 'not_ready' | 'monitoring' | 'ready';

export const UPGRADE_READINESS_LABELS: Record<UpgradeReadinessState, string> = {
  not_ready: 'Not Ready',
  monitoring: 'Monitoring',
  ready: 'Ready',
};

export const UPGRADE_READINESS_COLORS: Record<UpgradeReadinessState, string> = {
  not_ready: 'bg-red-100 text-red-800',
  monitoring: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-green-100 text-green-800',
};

// ============================================
// Life Milestone Types
// ============================================

export type LifeMilestoneType =
  | 'marriage'
  | 'child'
  | 'promotion'
  | 'job_change'
  | 'inheritance'
  | 'bonus'
  | 'kids_school'
  | 'kids_leaving'
  | 'retirement_planning'
  | 'other';

export const LIFE_MILESTONE_LABELS: Record<LifeMilestoneType, string> = {
  marriage: 'Marriage',
  child: 'New Child / Expecting',
  promotion: 'Promotion / Salary Increase',
  job_change: 'Job Change',
  inheritance: 'Inheritance',
  bonus: 'Bonus / Windfall',
  kids_school: 'Kids Starting School',
  kids_leaving: 'Kids Leaving Home',
  retirement_planning: 'Planning for Retirement',
  other: 'Other',
};

// ============================================
// Property Type (for upgrade analysis)
// ============================================

export type PropertyType =
  | 'condo'
  | 'apartment'
  | 'serviced_residence'
  | 'flat'
  | 'terrace'
  | 'semi_d'
  | 'bungalow'
  | 'townhouse'
  | 'soho'
  | 'other';

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  condo: 'Condominium',
  apartment: 'Apartment',
  serviced_residence: 'Serviced Residence',
  flat: 'Flat',
  terrace: 'Terrace House',
  semi_d: 'Semi-Detached',
  bungalow: 'Bungalow',
  townhouse: 'Townhouse',
  soho: 'SOHO',
  other: 'Other',
};

// ============================================
// Lost Reason Types
// ============================================

export type LostReasonType =
  | 'family_disagreement'
  | 'numbers_no_longer_work'
  | 'went_with_competitor'
  | 'decided_to_stay'
  | 'life_circumstances'
  | 'market_conditions'
  | 'financing_rejected'
  | 'timing_not_right'
  | 'other';

export const LOST_REASON_LABELS: Record<LostReasonType, string> = {
  family_disagreement: 'Family Disagreement',
  numbers_no_longer_work: 'Numbers No Longer Work',
  went_with_competitor: 'Went with Competitor',
  decided_to_stay: 'Decided to Stay',
  life_circumstances: 'Life Circumstances Changed',
  market_conditions: 'Market Conditions',
  financing_rejected: 'Financing Rejected',
  timing_not_right: 'Timing Not Right',
  other: 'Other',
};

// ============================================
// Family Alignment Status
// ============================================

export type FamilyAlignmentStatus =
  | 'not_discussed'
  | 'spouse_pending'
  | 'spouse_aligned'
  | 'family_objection'
  | 'all_aligned';

export const FAMILY_ALIGNMENT_LABELS: Record<FamilyAlignmentStatus, string> = {
  not_discussed: 'Not Yet Discussed',
  spouse_pending: 'Spouse Review Pending',
  spouse_aligned: 'Spouse Aligned',
  family_objection: 'Family Objection',
  all_aligned: 'All Decision Makers Aligned',
};

export const FAMILY_ALIGNMENT_COLORS: Record<FamilyAlignmentStatus, string> = {
  not_discussed: 'bg-slate-100 text-slate-800',
  spouse_pending: 'bg-yellow-100 text-yellow-800',
  spouse_aligned: 'bg-blue-100 text-blue-800',
  family_objection: 'bg-red-100 text-red-800',
  all_aligned: 'bg-green-100 text-green-800',
};

// ============================================
// Upgrade Intent Signals
// ============================================

export type UpgradeIntentSignal =
  | 'wants_bigger_space'
  | 'wants_landed'
  | 'wants_better_location'
  | 'investment_opportunity'
  | 'downsizing'
  | 'relocating';

export const UPGRADE_INTENT_LABELS: Record<UpgradeIntentSignal, string> = {
  wants_bigger_space: 'Wants Bigger Space',
  wants_landed: 'Wants Landed Property',
  wants_better_location: 'Wants Better Location',
  investment_opportunity: 'Investment Opportunity',
  downsizing: 'Downsizing',
  relocating: 'Relocating',
};

// ============================================
// Lead Event Types
// ============================================

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
  | 'qualification_recalculated'
  | 'upgrade_stage_changed'
  | 'financial_snapshot_updated'
  | 'client_reassigned';

// ============================================
// Upgrade Alert Types
// ============================================

export type UpgradeAlertType =
  | 'income_increase'
  | 'lead_matured'
  | 'lease_ending'
  | 'higher_tier_interest'
  | 'rent_to_buy_ready'
  | 'readiness_state_changed';

// ============================================
// Conversation Timeline
// ============================================

export type ConversationStep =
  | 'financial_validation'
  | 'soft_discussion'
  | 'family_alignment'
  | 'property_matching'
  | 'execution';

export const CONVERSATION_STEP_LABELS: Record<ConversationStep, string> = {
  financial_validation: 'Financial Validation',
  soft_discussion: 'Soft Upgrade Discussion',
  family_alignment: 'Family Alignment',
  property_matching: 'Property Matching',
  execution: 'Execution',
};

export const CONVERSATION_STEP_ORDER: ConversationStep[] = [
  'financial_validation',
  'soft_discussion',
  'family_alignment',
  'property_matching',
  'execution',
];

// ============================================
// Fallback Planner
// ============================================

export type FallbackReason =
  | 'not_ready_financially'
  | 'family_objection'
  | 'timing_not_right'
  | 'waiting_for_milestone'
  | 'client_declined'
  | 'other';

export const FALLBACK_REASON_LABELS: Record<FallbackReason, string> = {
  not_ready_financially: 'Not Ready Financially',
  family_objection: 'Family Objection',
  timing_not_right: 'Timing Not Right',
  waiting_for_milestone: 'Waiting for Milestone',
  client_declined: 'Client Declined',
  other: 'Other',
};

// ============================================
// Objection Categories
// ============================================

export type ObjectionCategory =
  | 'spouse_concern'
  | 'parent_advice'
  | 'commitment_fear'
  | 'timing_uncertainty';

export const OBJECTION_CATEGORY_LABELS: Record<ObjectionCategory, string> = {
  spouse_concern: 'Spouse Concern',
  parent_advice: 'Parent Advice',
  commitment_fear: 'Commitment Fear',
  timing_uncertainty: 'Timing Uncertainty',
};

// ============================================
// Deal Risk Types
// ============================================

export type DealRiskType =
  | 'tight_margin'
  | 'optimistic_equity'
  | 'short_tenure'
  | 'rate_sensitive';

export const DEAL_RISK_LABELS: Record<DealRiskType, string> = {
  tight_margin: 'Tight Affordability Margin',
  optimistic_equity: 'Optimistic Equity Assumptions',
  short_tenure: 'Short Job Tenure',
  rate_sensitive: 'High Rate Sensitivity',
};

// ============================================
// Window Closing Reasons
// ============================================

export type WindowClosingReason =
  | 'dsr_increasing'
  | 'property_value_declining'
  | 'interest_rates_rising'
  | 'job_change_risk'
  | 'stale_opportunity';

export const WINDOW_CLOSING_REASON_LABELS: Record<WindowClosingReason, string> = {
  dsr_increasing: 'DSR Increasing (New Commitments)',
  property_value_declining: 'Property Value May Have Declined',
  interest_rates_rising: 'Interest Rates Rising',
  job_change_risk: 'Job Stability Concern',
  stale_opportunity: 'Opportunity Getting Stale (No Progress)',
};
