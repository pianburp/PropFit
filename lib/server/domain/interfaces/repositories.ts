/**
 * Repository Interfaces - Data Access Contracts
 * 
 * These interfaces define the contract for data access operations.
 * Implementations are provided by the infrastructure layer.
 */
import type {
  Lead,
  Agent,
  Agency,
  PricingRule,
  UpgradeAlert,
  LeadEvent,
  LeadStatus,
  QualificationStatus,
  City,
  UpgradeStage,
  CreateLeadInput,
} from '../entities';

// ============================================
// Base Repository Interface
// ============================================

export interface IBaseRepository<T, TCreate, TUpdate> {
  findById(id: string): Promise<T | null>;
  create(data: TCreate): Promise<T>;
  update(id: string, data: TUpdate): Promise<T>;
  delete(id: string): Promise<void>;
}

// ============================================
// Lead Repository
// ============================================

export interface LeadFilters {
  agentId?: string;
  agentIds?: string[];
  status?: LeadStatus;
  city?: City;
  qualificationStatus?: QualificationStatus;
  upgradeStage?: UpgradeStage;
  isUpgradeReady?: boolean;
}

export interface CreateLeadData extends CreateLeadInput {
  agent_id: string;
  qualification_score: number;
  qualification_status: QualificationStatus;
  financing_readiness?: string;
  suggested_areas: unknown[];
  qualification_breakdown: unknown;
}

export interface UpdateLeadData {
  status?: LeadStatus;
  qualification_score?: number;
  qualification_status?: QualificationStatus;
  financing_readiness?: string;
  suggested_areas?: unknown[];
  qualification_breakdown?: unknown;
  is_upgrade_ready?: boolean;
  upgrade_triggers?: unknown[];
  current_income?: number;
  income_last_updated?: string;
  income_history?: unknown[];
  current_property_value?: number;
  property_value_last_updated?: string;
  outstanding_loan_balance?: number;
  loan_balance_last_updated?: string;
  life_milestones?: unknown[];
  upgrade_readiness_score?: number;
  upgrade_readiness_state?: string;
  upgrade_readiness_breakdown?: unknown;
  upgrade_stage?: UpgradeStage;
  conversation_timeline?: unknown;
  fallback_plan?: unknown;
  last_contacted_at?: string;
  [key: string]: unknown;
}

export interface ILeadRepository {
  findById(id: string): Promise<Lead | null>;
  findMany(filters: LeadFilters): Promise<Lead[]>;
  create(data: CreateLeadData): Promise<Lead>;
  update(id: string, data: UpdateLeadData): Promise<Lead>;
  delete(id: string, agentId: string): Promise<void>;
  updateStatus(id: string, status: LeadStatus): Promise<void>;
}

// ============================================
// Agent Repository
// ============================================

export interface CreateAgentData {
  id: string;
  full_name: string;
  subscription_status: string;
  subscription_ends_at: string;
}

export interface UpdateAgentData {
  full_name?: string;
  phone?: string;
  agency_name?: string;
  license_number?: string;
  preferred_cities?: City[];
}

export interface IAgentRepository {
  findById(id: string): Promise<Agent | null>;
  findByAgencyId(agencyId: string): Promise<Agent[]>;
  create(data: CreateAgentData): Promise<Agent>;
  update(id: string, data: UpdateAgentData): Promise<void>;
}

// ============================================
// Pricing Rule Repository
// ============================================

export interface IPricingRuleRepository {
  findActive(): Promise<PricingRule[]>;
  findByCity(city: City): Promise<PricingRule[]>;
}

// ============================================
// Alert Repository
// ============================================

export interface CreateAlertData {
  lead_id: string;
  agent_id: string;
  alert_type: string;
  title: string;
  description: string;
  suggested_action?: string;
  is_read: boolean;
  is_dismissed: boolean;
}

export interface IAlertRepository {
  findByAgentId(agentId: string, unreadOnly?: boolean): Promise<UpgradeAlert[]>;
  findUnreadCount(agentId: string): Promise<number>;
  create(data: CreateAlertData): Promise<UpgradeAlert>;
  createMany(data: CreateAlertData[]): Promise<void>;
  markAsRead(id: string, agentId: string): Promise<void>;
  dismiss(id: string, agentId: string): Promise<void>;
}

// ============================================
// Lead Event Repository
// ============================================

export interface CreateLeadEventData {
  lead_id: string;
  agent_id: string;
  event_type: string;
  event_data?: Record<string, unknown>;
  notes?: string;
}

export interface ILeadEventRepository {
  findByLeadId(leadId: string, agentId: string): Promise<LeadEvent[]>;
  create(data: CreateLeadEventData): Promise<LeadEvent>;
}

// ============================================
// Upgrade Stage History Repository
// ============================================

export interface CreateStageHistoryData {
  lead_id: string;
  from_stage: string;
  to_stage: string;
  changed_by: string;
  reason?: string;
  notes?: string;
}

export interface IUpgradeStageHistoryRepository {
  create(data: CreateStageHistoryData): Promise<void>;
  countByStageInDateRange(
    leadIds: string[],
    toStage: string,
    startDate: string
  ): Promise<number>;
}

// ============================================
// Client Reassignment Log Repository
// ============================================

export interface CreateReassignmentLogData {
  lead_id: string;
  from_agent_id: string;
  to_agent_id: string;
  reassigned_by: string;
  reason: string;
  notes?: string;
}

export interface IReassignmentLogRepository {
  create(data: CreateReassignmentLogData): Promise<void>;
}
