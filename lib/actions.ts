// ============================================
// Server Actions for Lead Management
// ============================================
// 
// These Server Actions delegate to the clean architecture services layer.
// They exist for backward compatibility with React Server Components.
// New code should prefer using tRPC queries/mutations directly.
// ============================================

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  LeadService,
  PipelineService,
  AgentService,
  AlertService,
  DashboardService,
  AdminService,
  type AgencyDashboardStats,
} from '@/lib/server/application/services';
import type {
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
  Agent,
  LeadEvent,
  UpgradeAlert,
  LeadStatus,
  DashboardStats,
  UpgradeStage,
  LifeMilestone,
  ConversationStep,
  FallbackPlan,
} from '@/lib/types';

// Note: Types like AgencyDashboardStats should be imported directly from
// '@/lib/server/application/services' by components that need them.

// ============================================
// Helper to build service context
// ============================================

async function getServiceContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const agentService = new AgentService(supabase);
  const agent = await agentService.getOrCreate({ userId: user.id, email: user.email });
  
  return {
    supabase,
    user,
    agent,
    ctx: {
      userId: user.id,
      agentRole: agent?.role,
      agencyId: agent?.agency_id,
    },
  };
}

// ============================================
// Agent Actions
// ============================================

export async function getOrCreateAgent(): Promise<Agent | null> {
  const context = await getServiceContext();
  return context?.agent ?? null;
}

export async function updateAgent(data: Partial<Agent>): Promise<{ success: boolean; error?: string }> {
  try {
    const context = await getServiceContext();
    if (!context) return { success: false, error: 'Not authenticated' };

    const agentService = new AgentService(context.supabase);
    await agentService.update(context.user.id, data);

    revalidatePath('/protected');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Lead Actions
// ============================================

export async function createLead(input: CreateLeadInput): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  try {
    const context = await getServiceContext();
    if (!context) return { success: false, error: 'Not authenticated' };

    const leadService = new LeadService(context.supabase);
    const result = await leadService.create(input, context.ctx);

    revalidatePath('/protected/leads');
    return { success: true, lead: result.lead };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateLead(input: UpdateLeadInput): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  try {
    const context = await getServiceContext();
    if (!context) return { success: false, error: 'Not authenticated' };

    const { id, ...updateData } = input;
    const leadService = new LeadService(context.supabase);
    const lead = await leadService.update(id!, updateData, context.ctx);

    revalidatePath('/protected/leads');
    revalidatePath(`/protected/leads/${id}`);
    return { success: true, lead };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const context = await getServiceContext();
    if (!context) return { success: false, error: 'Not authenticated' };

    const leadService = new LeadService(context.supabase);
    await leadService.delete(id, context.ctx);

    revalidatePath('/protected/leads');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const context = await getServiceContext();
    if (!context) return { success: false, error: 'Not authenticated' };

    const leadService = new LeadService(context.supabase);
    await leadService.updateStatus(id, status, context.ctx);

    revalidatePath('/protected/leads');
    revalidatePath(`/protected/leads/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Query Functions
// ============================================

export async function getLeads(filters?: {
  status?: LeadStatus;
  city?: string;
  qualificationStatus?: string;
}): Promise<Lead[]> {
  try {
    const context = await getServiceContext();
    if (!context) return [];

    const leadService = new LeadService(context.supabase);
    return await leadService.list(filters ?? {}, context.ctx);
  } catch {
    return [];
  }
}

export async function getLead(id: string): Promise<Lead | null> {
  try {
    const context = await getServiceContext();
    if (!context) return null;

    const leadService = new LeadService(context.supabase);
    return await leadService.getById(id, context.ctx);
  } catch {
    return null;
  }
}

export async function getLeadEvents(leadId: string): Promise<LeadEvent[]> {
  try {
    const context = await getServiceContext();
    if (!context) return [];

    const leadService = new LeadService(context.supabase);
    return await leadService.getEvents(leadId, context.ctx);
  } catch {
    return [];
  }
}

// ============================================
// Alerts
// ============================================

export async function getUpgradeAlerts(unreadOnly = true): Promise<UpgradeAlert[]> {
  try {
    const context = await getServiceContext();
    if (!context) return [];

    const alertService = new AlertService(context.supabase);
    return await alertService.list(unreadOnly, { userId: context.user.id });
  } catch {
    return [];
  }
}

export async function markAlertAsRead(alertId: string): Promise<void> {
  try {
    const context = await getServiceContext();
    if (!context) return;

    const alertService = new AlertService(context.supabase);
    await alertService.markAsRead(alertId, { userId: context.user.id });
  } catch {
    // Silently fail for non-critical action
  }
}

export async function dismissAlert(alertId: string): Promise<void> {
  try {
    const context = await getServiceContext();
    if (!context) return;

    const alertService = new AlertService(context.supabase);
    await alertService.dismiss(alertId, { userId: context.user.id });

    revalidatePath('/protected');
  } catch {
    // Silently fail for non-critical action
  }
}

// ============================================
// Dashboard Stats
// ============================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const defaultStats: DashboardStats = {
    total_leads: 0,
    qualified_leads: 0,
    stretch_leads: 0,
    not_qualified_leads: 0,
    upgrade_ready_leads: 0,
    leads_by_status: {} as Record<LeadStatus, number>,
    leads_by_city: {} as Record<string, number>,
    recent_leads: [],
    pending_alerts: [],
  };

  try {
    const context = await getServiceContext();
    if (!context) return defaultStats;

    const dashboardService = new DashboardService(context.supabase);
    return await dashboardService.getStats({ userId: context.user.id });
  } catch {
    return defaultStats;
  }
}

// ============================================
// Contact Logging
// ============================================

export async function logContact(
  leadId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const context = await getServiceContext();
    if (!context) return { success: false, error: 'Not authenticated' };

    const leadService = new LeadService(context.supabase);
    await leadService.logContact(leadId, notes, context.ctx);

    revalidatePath(`/protected/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Upgrade Pipeline Actions
// ============================================

export interface FinancialSnapshotInput {
  leadId: string;
  currentIncome?: number;
  currentPropertyValue?: number;
  outstandingLoanBalance?: number;
  lifeMilestone?: LifeMilestone;
}

export async function updateFinancialSnapshot(
  input: FinancialSnapshotInput
): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  try {
    const context = await getServiceContext();
    if (!context) return { success: false, error: 'Not authenticated' };

    const pipelineService = new PipelineService(context.supabase);
    const lead = await pipelineService.updateFinancialSnapshot(input, context.ctx);

    revalidatePath(`/protected/leads/${input.leadId}`);
    revalidatePath('/protected/pipeline');
    return { success: true, lead };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function changeUpgradeStage(
  leadId: string,
  newStage: UpgradeStage,
  reason?: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const context = await getServiceContext();
    if (!context) return { success: false, error: 'Not authenticated' };

    const pipelineService = new PipelineService(context.supabase);
    await pipelineService.changeUpgradeStage(
      { leadId, newStage, reason, notes },
      context.ctx
    );

    revalidatePath(`/protected/leads/${leadId}`);
    revalidatePath('/protected/pipeline');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getClientsByUpgradeStage(): Promise<Record<UpgradeStage, Lead[]>> {
  const defaultGrouped: Record<UpgradeStage, Lead[]> = {
    monitoring: [],
    window_open: [],
    planning: [],
    executed: [],
    lost: [],
  };

  try {
    const context = await getServiceContext();
    if (!context) return defaultGrouped;

    const pipelineService = new PipelineService(context.supabase);
    return await pipelineService.getClientsByStage(context.ctx);
  } catch {
    return defaultGrouped;
  }
}

// ============================================
// Agency Dashboard (Admin)
// ============================================

export async function getAgencyDashboardStats(): Promise<AgencyDashboardStats | null> {
  try {
    const context = await getServiceContext();
    if (!context) return null;

    const adminService = new AdminService(context.supabase);
    return await adminService.getAgencyDashboard(context.ctx);
  } catch {
    return null;
  }
}

export async function reassignClient(
  leadId: string,
  toAgentId: string,
  reason: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const context = await getServiceContext();
    if (!context) return { success: false, error: 'Not authenticated' };

    const adminService = new AdminService(context.supabase);
    await adminService.reassignClient(
      { leadId, toAgentId, reason, notes },
      context.ctx
    );

    revalidatePath('/protected/leads');
    revalidatePath('/protected/pipeline');
    revalidatePath('/protected/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// Upgrade Features Actions
// ============================================

export async function updateConversationStep(
  leadId: string,
  step: ConversationStep,
  completed: boolean,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const context = await getServiceContext();
    if (!context) return { success: false, error: 'Not authenticated' };

    const pipelineService = new PipelineService(context.supabase);
    await pipelineService.updateConversationStep(
      { leadId, step, completed, notes },
      context.ctx
    );

    revalidatePath(`/protected/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function saveFallbackPlan(
  leadId: string,
  plan: Omit<FallbackPlan, 'created_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const context = await getServiceContext();
    if (!context) return { success: false, error: 'Not authenticated' };

    const pipelineService = new PipelineService(context.supabase);
    await pipelineService.saveFallbackPlan({ leadId, ...plan }, context.ctx);

    revalidatePath(`/protected/leads/${leadId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
