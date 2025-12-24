/**
 * Domain Entities - Core business objects
 * 
 * Re-exports type definitions from the shared types module.
 * Domain entities represent the core business concepts.
 */
export type {
  Lead,
  Agent,
  Agency,
  PricingRule,
  UpgradeAlert,
  LeadEvent,
  // Value Objects
  City,
  Intent,
  LeadStatus,
  QualificationStatus,
  FinancingReadiness,
  EmploymentType,
  MoveInTimeline,
  UpgradeStage,
  UpgradeReadinessState,
  UpgradeAlertType,
  LeadEventType,
  AgentRole,
  SubscriptionStatus,
  // Complex Types
  QualificationBreakdown,
  SuggestedArea,
  UpgradeTrigger,
  IncomeHistoryEntry,
  LifeMilestone,
  UpgradeReadinessBreakdown,
  ConversationTimeline,
  ConversationStep,
  ConversationStepData,
  FallbackPlan,
  FallbackReason,
  DealRiskFlag,
  DealRiskType,
  // Input Types
  CreateLeadInput,
  UpdateLeadInput,
  // Dashboard Types
  DashboardStats,
} from '@/lib/types';
