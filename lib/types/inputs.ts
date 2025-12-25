/**
 * Input Types - Form and API Request Types
 *
 * Types for form submissions and API input validation.
 */

import type {
  City,
  Intent,
  MoveInTimeline,
  EmploymentType,
  LeadStatus,
  LifeMilestoneType,
  PropertyType,
  FamilyAlignmentStatus,
  UpgradeIntentSignal,
} from './enums';
import type { LifeMilestone } from './entities';

// ============================================
// Lead Input Types
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

  // Upgrade Intent Signals
  upgrade_intent_signals?: UpgradeIntentSignal[];
  upgrade_target_property_type?: PropertyType;
  upgrade_target_areas?: string[];

  // Life Milestones (prominent capture)
  pending_life_milestone?: LifeMilestoneType;
  pending_life_milestone_date?: string;
  pending_life_milestone_notes?: string;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  id: string;
  status?: LeadStatus;
}

// ============================================
// Financial Snapshot Input
// ============================================

export interface FinancialSnapshotInput {
  leadId: string;
  currentIncome?: number;
  currentPropertyValue?: number;
  outstandingLoanBalance?: number;
  lifeMilestone?: LifeMilestone;
}
