/**
 * Validation Schemas - Centralized Zod schemas for input validation
 * 
 * All input validation schemas are defined here for consistency
 * and reusability across the application.
 */
import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

export const uuidSchema = z.string().uuid();

export const citySchema = z.enum(['klang_valley', 'penang', 'johor_bahru']);

export const intentSchema = z.enum(['rent', 'buy']);

export const leadStatusSchema = z.enum([
  'new', 'contacted', 'viewing_scheduled', 
  'negotiating', 'closed_won', 'closed_lost', 'nurturing'
]);

export const qualificationStatusSchema = z.enum([
  'pending', 'not_qualified', 'stretch', 'qualified'
]);

export const employmentTypeSchema = z.enum([
  'permanent', 'contract', 'self_employed', 'business_owner', 'freelance'
]);

export const moveInTimelineSchema = z.enum([
  'immediate', '1_3_months', '3_6_months', '6_12_months', 'flexible'
]);

export const upgradeStageSchema = z.enum([
  'monitoring', 'window_open', 'planning', 'executed', 'lost'
]);

export const conversationStepSchema = z.enum([
  'financial_validation', 'soft_discussion', 'family_alignment', 
  'property_matching', 'execution'
]);

export const fallbackReasonSchema = z.enum([
  'not_ready_financially', 'family_objection', 'timing_not_right', 
  'waiting_for_milestone', 'client_declined', 'other'
]);

export const lifeMilestoneTypeSchema = z.enum([
  'marriage', 'child', 'promotion', 'job_change', 'inheritance', 'bonus', 'other'
]);

// ============================================
// Lead Schemas
// ============================================

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(20),
  monthly_income_min: z.number().positive('Income must be positive'),
  monthly_income_max: z.number().positive('Income must be positive'),
  preferred_city: citySchema,
  preferred_areas: z.array(z.string()).min(1, 'At least one area required'),
  intent: intentSchema,
  budget_min: z.number().positive('Budget must be positive'),
  budget_max: z.number().positive('Budget must be positive'),
  move_in_timeline: moveInTimelineSchema,
  employment_type: employmentTypeSchema.optional(),
  years_in_current_job: z.number().min(0).optional(),
  existing_loan_commitment_percent: z.number().min(0).max(100).optional(),
  previous_loan_rejection: z.boolean().optional(),
  is_first_time_buyer: z.boolean().optional(),
  lease_end_date: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().max(5000).optional(),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  id: uuidSchema,
  status: leadStatusSchema.optional(),
});

export const listLeadsSchema = z.object({
  status: leadStatusSchema.optional(),
  city: citySchema.optional(),
  qualificationStatus: qualificationStatusSchema.optional(),
}).optional();

export const leadIdSchema = z.object({
  id: uuidSchema,
});

export const updateLeadStatusSchema = z.object({
  id: uuidSchema,
  status: leadStatusSchema,
});

export const logContactSchema = z.object({
  leadId: uuidSchema,
  notes: z.string().max(5000).optional(),
});

export const getEventsSchema = z.object({
  leadId: uuidSchema,
});

// ============================================
// Pipeline Schemas
// ============================================

export const financialSnapshotSchema = z.object({
  leadId: uuidSchema,
  currentIncome: z.number().positive().optional(),
  currentPropertyValue: z.number().positive().optional(),
  outstandingLoanBalance: z.number().min(0).optional(),
  lifeMilestone: z.object({
    type: lifeMilestoneTypeSchema,
    date: z.string(),
    notes: z.string().optional(),
  }).optional(),
});

export const changeStageSchema = z.object({
  leadId: uuidSchema,
  newStage: upgradeStageSchema,
  reason: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
});

export const conversationStepUpdateSchema = z.object({
  leadId: uuidSchema,
  step: conversationStepSchema,
  completed: z.boolean(),
  notes: z.string().max(5000).optional(),
});

export const fallbackPlanSchema = z.object({
  leadId: uuidSchema,
  reason: fallbackReasonSchema,
  reason_notes: z.string().max(1000).optional(),
  next_review_date: z.string(),
  advisory_notes: z.string().max(5000).optional(),
});

// ============================================
// Agent Schemas
// ============================================

export const updateAgentSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  agency_name: z.string().max(100).optional(),
  license_number: z.string().max(50).optional(),
  preferred_cities: z.array(citySchema).optional(),
});

// ============================================
// Alert Schemas
// ============================================

export const listAlertsSchema = z.object({
  unreadOnly: z.boolean().default(true),
}).optional();

export const alertIdSchema = z.object({
  id: uuidSchema,
});

// ============================================
// Admin Schemas
// ============================================

export const reassignClientSchema = z.object({
  leadId: uuidSchema,
  toAgentId: uuidSchema,
  reason: z.string().min(1, 'Reason is required').max(500),
  notes: z.string().max(5000).optional(),
});

// ============================================
// Type Exports
// ============================================

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ListLeadsInput = z.infer<typeof listLeadsSchema>;
export type FinancialSnapshotInput = z.infer<typeof financialSnapshotSchema>;
export type ChangeStageInput = z.infer<typeof changeStageSchema>;
export type ConversationStepUpdateInput = z.infer<typeof conversationStepUpdateSchema>;
export type FallbackPlanInput = z.infer<typeof fallbackPlanSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type ReassignClientInput = z.infer<typeof reassignClientSchema>;
