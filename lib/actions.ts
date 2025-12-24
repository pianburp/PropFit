// ============================================
// Server Actions for Lead Management
// ============================================

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { qualifyLead } from '@/lib/qualification-engine';
import { detectUpgradeTriggers } from '@/lib/upgrade-triggers';
import { calculateUpgradeReadiness } from '@/lib/upgrade-readiness';
import type {
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
  PricingRule,
  Agent,
  LeadEvent,
  UpgradeAlert,
  LeadStatus,
  DashboardStats,
  Agency,
  UpgradeStage,
  IncomeHistoryEntry,
  LifeMilestone,
  ConversationStep,
  ConversationTimeline,
  ConversationStepData,
  FallbackPlan,
  FallbackReason,
} from '@/lib/types';

// ============================================
// Agent Actions
// ============================================

export async function getOrCreateAgent(): Promise<Agent | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Try to get existing agent
  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('id', user.id)
    .single();

  if (agent) return agent as Agent;

  // Create new agent profile
  const { data: newAgent, error } = await supabase
    .from('agents')
    .insert({
      id: user.id,
      full_name: user.email?.split('@')[0] || 'Agent',
      subscription_status: 'trial',
      subscription_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 day trial
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating agent:', error);
    return null;
  }

  return newAgent as Agent;
}

export async function updateAgent(data: Partial<Agent>): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('agents')
    .update(data)
    .eq('id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/protected');
  return { success: true };
}

// ============================================
// Lead Actions
// ============================================

export async function createLead(input: CreateLeadInput): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Get pricing rules for qualification
  const { data: pricingRules } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('is_active', true);

  if (!pricingRules || pricingRules.length === 0) {
    return { success: false, error: 'Pricing rules not configured' };
  }

  // Qualify the lead
  const qualificationResult = qualifyLead(input, pricingRules as PricingRule[]);

  // Create the lead
  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      agent_id: user.id,
      ...input,
      qualification_score: qualificationResult.score,
      qualification_status: qualificationResult.status,
      financing_readiness: qualificationResult.financingReadiness,
      suggested_areas: qualificationResult.suggestedAreas,
      qualification_breakdown: qualificationResult.breakdown,
      status: 'new',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    return { success: false, error: error.message };
  }

  // Record the creation event
  await supabase.from('lead_events').insert({
    lead_id: lead.id,
    agent_id: user.id,
    event_type: 'created',
    event_data: { qualification_score: qualificationResult.score },
  });

  revalidatePath('/protected/leads');
  return { success: true, lead: lead as Lead };
}

export async function updateLead(input: UpdateLeadInput): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Get the existing lead
  const { data: existingLead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', input.id)
    .eq('agent_id', user.id)
    .single();

  if (!existingLead) {
    return { success: false, error: 'Lead not found' };
  }

  // Get pricing rules
  const { data: pricingRules } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('is_active', true);

  // Merge updates with existing data
  const updatedData = { ...existingLead, ...input };
  
  // Re-qualify if relevant fields changed
  const qualificationFields = [
    'monthly_income_min', 'monthly_income_max', 'preferred_city',
    'preferred_areas', 'intent', 'budget_min', 'budget_max',
    'employment_type', 'existing_loan_commitment_percent',
  ];
  
  const needsRequalification = qualificationFields.some(
    field => input[field as keyof UpdateLeadInput] !== undefined
  );

  let qualificationResult;
  if (needsRequalification && pricingRules) {
    qualificationResult = qualifyLead(updatedData as CreateLeadInput, pricingRules as PricingRule[]);
  }

  // Check for upgrade triggers
  const triggerResult = detectUpgradeTriggers(
    updatedData as Lead,
    existingLead as Lead
  );

  // Update the lead
  const updatePayload: Record<string, unknown> = { ...input };
  delete updatePayload.id;

  if (qualificationResult) {
    updatePayload.qualification_score = qualificationResult.score;
    updatePayload.qualification_status = qualificationResult.status;
    updatePayload.financing_readiness = qualificationResult.financingReadiness;
    updatePayload.suggested_areas = qualificationResult.suggestedAreas;
    updatePayload.qualification_breakdown = qualificationResult.breakdown;
  }

  if (triggerResult.isUpgradeReady) {
    updatePayload.is_upgrade_ready = true;
    updatePayload.upgrade_triggers = [
      ...(existingLead.upgrade_triggers || []),
      ...triggerResult.triggers,
    ];
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .update(updatePayload)
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Record events
  if (input.status && input.status !== existingLead.status) {
    await supabase.from('lead_events').insert({
      lead_id: input.id,
      agent_id: user.id,
      event_type: 'status_changed',
      event_data: { old_status: existingLead.status, new_status: input.status },
    });
  }

  if (needsRequalification) {
    await supabase.from('lead_events').insert({
      lead_id: input.id,
      agent_id: user.id,
      event_type: 'qualification_recalculated',
      event_data: { new_score: qualificationResult?.score },
    });
  }

  // Create upgrade alerts
  if (triggerResult.alerts.length > 0) {
    await supabase.from('upgrade_alerts').insert(
      triggerResult.alerts.map(alert => ({
        ...alert,
        agent_id: user.id,
      }))
    );
  }

  revalidatePath('/protected/leads');
  revalidatePath(`/protected/leads/${input.id}`);
  return { success: true, lead: lead as Lead };
}

export async function deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)
    .eq('agent_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/protected/leads');
  return { success: true };
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<{ success: boolean; error?: string }> {
  return updateLead({ id, status });
}

// ============================================
// Query Functions
// ============================================

export async function getLeads(filters?: {
  status?: LeadStatus;
  city?: string;
  qualificationStatus?: string;
}): Promise<Lead[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('leads')
    .select('*')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.city) {
    query = query.eq('preferred_city', filters.city);
  }
  if (filters?.qualificationStatus) {
    query = query.eq('qualification_status', filters.qualificationStatus);
  }

  const { data } = await query;
  return (data || []) as Lead[];
}

export async function getLead(id: string): Promise<Lead | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .eq('agent_id', user.id)
    .single();

  return data as Lead | null;
}

export async function getLeadEvents(leadId: string): Promise<LeadEvent[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('lead_events')
    .select('*')
    .eq('lead_id', leadId)
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false });

  return (data || []) as LeadEvent[];
}

export async function getPricingRules(): Promise<PricingRule[]> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('is_active', true);

  return (data || []) as PricingRule[];
}

// ============================================
// Alerts
// ============================================

export async function getUpgradeAlerts(unreadOnly = true): Promise<UpgradeAlert[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('upgrade_alerts')
    .select('*')
    .eq('agent_id', user.id)
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false });

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data } = await query;
  return (data || []) as UpgradeAlert[];
}

export async function markAlertAsRead(alertId: string): Promise<void> {
  const supabase = await createClient();
  
  await supabase
    .from('upgrade_alerts')
    .update({ is_read: true })
    .eq('id', alertId);
}

export async function dismissAlert(alertId: string): Promise<void> {
  const supabase = await createClient();
  
  await supabase
    .from('upgrade_alerts')
    .update({ is_dismissed: true })
    .eq('id', alertId);

  revalidatePath('/protected');
}

// ============================================
// Dashboard Stats
// ============================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return {
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
  }

  // Get all leads
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('agent_id', user.id);

  const allLeads = (leads || []) as Lead[];

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
  };

  // Group by status
  for (const lead of allLeads) {
    stats.leads_by_status[lead.status] = (stats.leads_by_status[lead.status] || 0) + 1;
    stats.leads_by_city[lead.preferred_city] = (stats.leads_by_city[lead.preferred_city] || 0) + 1;
  }

  // Get pending alerts
  const { data: alerts } = await supabase
    .from('upgrade_alerts')
    .select('*')
    .eq('agent_id', user.id)
    .eq('is_read', false)
    .eq('is_dismissed', false)
    .order('created_at', { ascending: false })
    .limit(5);

  stats.pending_alerts = (alerts || []) as UpgradeAlert[];

  return stats;
}

// ============================================
// Contact Logging
// ============================================

export async function logContact(
  leadId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Update lead
  const { error: updateError } = await supabase
    .from('leads')
    .update({ last_contacted_at: new Date().toISOString() })
    .eq('id', leadId)
    .eq('agent_id', user.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Log event
  await supabase.from('lead_events').insert({
    lead_id: leadId,
    agent_id: user.id,
    event_type: 'contacted',
    notes,
  });

  revalidatePath(`/protected/leads/${leadId}`);
  return { success: true };
}

// ============================================
// Upgrade Pipeline Actions (NEW)
// ============================================

/**
 * Update client financial snapshot
 */
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
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const { leadId, currentIncome, currentPropertyValue, outstandingLoanBalance, lifeMilestone } = input;

  // Get existing lead
  const { data: existingLead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (fetchError || !existingLead) {
    return { success: false, error: 'Lead not found' };
  }

  // Check access (owner or agency admin)
  const hasAccess = await checkLeadAccess(supabase, user.id, existingLead);
  if (!hasAccess) {
    return { success: false, error: 'Access denied' };
  }

  const now = new Date().toISOString();
  const updatePayload: Record<string, unknown> = {};

  // Update income and add to history
  if (currentIncome !== undefined) {
    updatePayload.current_income = currentIncome;
    updatePayload.income_last_updated = now;
    
    // Add to income history
    const incomeHistory: IncomeHistoryEntry[] = existingLead.income_history || [];
    incomeHistory.push({
      amount: currentIncome,
      date: now,
      notes: 'Updated via financial snapshot',
    });
    updatePayload.income_history = incomeHistory;
  }

  // Update property value
  if (currentPropertyValue !== undefined) {
    updatePayload.current_property_value = currentPropertyValue;
    updatePayload.property_value_last_updated = now;
  }

  // Update loan balance
  if (outstandingLoanBalance !== undefined) {
    updatePayload.outstanding_loan_balance = outstandingLoanBalance;
    updatePayload.loan_balance_last_updated = now;
  }

  // Add life milestone
  if (lifeMilestone) {
    const milestones: LifeMilestone[] = existingLead.life_milestones || [];
    milestones.push(lifeMilestone);
    updatePayload.life_milestones = milestones;
  }

  // Recalculate upgrade readiness
  const updatedLead = { ...existingLead, ...updatePayload } as Lead;
  const readinessResult = calculateUpgradeReadiness(updatedLead);
  
  updatePayload.upgrade_readiness_score = readinessResult.score;
  updatePayload.upgrade_readiness_state = readinessResult.state;
  updatePayload.upgrade_readiness_breakdown = readinessResult.breakdown;

  // Check for readiness state change (for alerts)
  const previousState = existingLead.upgrade_readiness_state || 'not_ready';
  const newState = readinessResult.state;

  const { data: lead, error: updateError } = await supabase
    .from('leads')
    .update(updatePayload)
    .eq('id', leadId)
    .select()
    .single();

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Log event
  await supabase.from('lead_events').insert({
    lead_id: leadId,
    agent_id: user.id,
    event_type: 'financial_snapshot_updated',
    event_data: {
      updated_fields: Object.keys(updatePayload),
      new_readiness_score: readinessResult.score,
      new_readiness_state: readinessResult.state,
    },
  });

  // Create alert if readiness state improved to 'ready'
  if (previousState !== 'ready' && newState === 'ready') {
    await supabase.from('upgrade_alerts').insert({
      lead_id: leadId,
      agent_id: existingLead.agent_id,
      alert_type: 'readiness_state_changed',
      title: '🎯 Client Ready for Upgrade',
      description: `${existingLead.name} has reached upgrade readiness. Score: ${readinessResult.score}/100.`,
      suggested_action: 'Schedule upgrade conversation and prepare affordability analysis.',
      is_read: false,
      is_dismissed: false,
    });
  }

  revalidatePath(`/protected/leads/${leadId}`);
  revalidatePath('/protected/pipeline');
  return { success: true, lead: lead as Lead };
}

/**
 * Change upgrade stage with audit trail
 */
export async function changeUpgradeStage(
  leadId: string,
  newStage: UpgradeStage,
  reason?: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Get existing lead
  const { data: existingLead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (fetchError || !existingLead) {
    return { success: false, error: 'Lead not found' };
  }

  // Check access
  const hasAccess = await checkLeadAccess(supabase, user.id, existingLead);
  if (!hasAccess) {
    return { success: false, error: 'Access denied' };
  }

  const previousStage = existingLead.upgrade_stage || 'monitoring';

  // Update lead
  const { error: updateError } = await supabase
    .from('leads')
    .update({
      upgrade_stage: newStage,
      // upgrade_stage_changed_at is updated by trigger
    })
    .eq('id', leadId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Record stage history
  await supabase.from('upgrade_stage_history').insert({
    lead_id: leadId,
    from_stage: previousStage,
    to_stage: newStage,
    changed_by: user.id,
    reason,
    notes,
  });

  // Log event
  await supabase.from('lead_events').insert({
    lead_id: leadId,
    agent_id: user.id,
    event_type: 'upgrade_stage_changed',
    event_data: {
      from_stage: previousStage,
      to_stage: newStage,
      reason,
    },
    notes,
  });

  revalidatePath(`/protected/leads/${leadId}`);
  revalidatePath('/protected/pipeline');
  return { success: true };
}

/**
 * Get clients grouped by upgrade stage (for pipeline view)
 */
export async function getClientsByUpgradeStage(): Promise<Record<UpgradeStage, Lead[]>> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { monitoring: [], window_open: [], planning: [], executed: [], lost: [] };

  // Get current agent to check role
  const { data: agent } = await supabase
    .from('agents')
    .select('*, agency:agencies(*)')
    .eq('id', user.id)
    .single();

  if (!agent) {
    return { monitoring: [], window_open: [], planning: [], executed: [], lost: [] };
  }

  let query = supabase
    .from('leads')
    .select('*')
    .order('upgrade_stage_changed_at', { ascending: false });

  // If admin, get all agency leads; otherwise, only own leads
  if (agent.role === 'admin' && agent.agency_id) {
    // Get all agent IDs in the agency
    const { data: agencyAgents } = await supabase
      .from('agents')
      .select('id')
      .eq('agency_id', agent.agency_id);
    
    const agentIds = (agencyAgents || []).map(a => a.id);
    if (agentIds.length > 0) {
      query = query.in('agent_id', agentIds);
    }
  } else {
    query = query.eq('agent_id', user.id);
  }

  const { data: leads } = await query;
  const allLeads = (leads || []) as Lead[];

  // Group by stage
  const grouped: Record<UpgradeStage, Lead[]> = {
    monitoring: [],
    window_open: [],
    planning: [],
    executed: [],
    lost: [],
  };

  for (const lead of allLeads) {
    const stage = (lead.upgrade_stage || 'monitoring') as UpgradeStage;
    if (grouped[stage]) {
      grouped[stage].push(lead);
    }
  }

  return grouped;
}

/**
 * Get agency dashboard stats (admin only)
 */
export interface AgencyDashboardStats {
  totalClients: number;
  clientsByReadinessState: Record<string, number>;
  clientsByUpgradeStage: Record<string, number>;
  upgradesExecutedThisMonth: number;
  upgradesExecutedThisYear: number;
  teamMembers: Agent[];
  isAdmin: boolean;
}

export async function getAgencyDashboardStats(): Promise<AgencyDashboardStats | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get current agent
  const { data: agent } = await supabase
    .from('agents')
    .select('*, agency:agencies(*)')
    .eq('id', user.id)
    .single();

  if (!agent) return null;

  const isAdmin = agent.role === 'admin';

  // Get team members if admin
  let teamMembers: Agent[] = [];
  let agentIds: string[] = [user.id];

  if (isAdmin && agent.agency_id) {
    const { data: agencyAgents } = await supabase
      .from('agents')
      .select('*')
      .eq('agency_id', agent.agency_id);
    
    teamMembers = (agencyAgents || []) as Agent[];
    agentIds = teamMembers.map(a => a.id);
  }

  // Get all leads for the agent(s)
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .in('agent_id', agentIds);

  const allLeads = (leads || []) as Lead[];
  const totalClients = allLeads.length;

  // Count by readiness state
  const clientsByReadinessState: Record<string, number> = {
    not_ready: 0,
    monitoring: 0,
    ready: 0,
  };

  // Count by upgrade stage
  const clientsByUpgradeStage: Record<string, number> = {
    monitoring: 0,
    window_open: 0,
    planning: 0,
    executed: 0,
    lost: 0,
  };

  for (const lead of allLeads) {
    const readinessState = lead.upgrade_readiness_state || 'not_ready';
    const upgradeStage = lead.upgrade_stage || 'monitoring';
    
    clientsByReadinessState[readinessState] = (clientsByReadinessState[readinessState] || 0) + 1;
    clientsByUpgradeStage[upgradeStage] = (clientsByUpgradeStage[upgradeStage] || 0) + 1;
  }

  // Count executed upgrades this month and year
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisYearStart = new Date(now.getFullYear(), 0, 1).toISOString();

  const { data: executedThisMonth } = await supabase
    .from('upgrade_stage_history')
    .select('id')
    .in('lead_id', allLeads.map(l => l.id))
    .eq('to_stage', 'executed')
    .gte('created_at', thisMonthStart);

  const { data: executedThisYear } = await supabase
    .from('upgrade_stage_history')
    .select('id')
    .in('lead_id', allLeads.map(l => l.id))
    .eq('to_stage', 'executed')
    .gte('created_at', thisYearStart);

  return {
    totalClients,
    clientsByReadinessState,
    clientsByUpgradeStage,
    upgradesExecutedThisMonth: (executedThisMonth || []).length,
    upgradesExecutedThisYear: (executedThisYear || []).length,
    teamMembers,
    isAdmin,
  };
}

/**
 * Reassign client to another agent (admin only)
 */
export async function reassignClient(
  leadId: string,
  toAgentId: string,
  reason: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Check if current user is admin
  const { data: currentAgent } = await supabase
    .from('agents')
    .select('role, agency_id')
    .eq('id', user.id)
    .single();

  if (!currentAgent || currentAgent.role !== 'admin') {
    return { success: false, error: 'Only admins can reassign clients' };
  }

  // Get the lead
  const { data: lead } = await supabase
    .from('leads')
    .select('*, agent:agents!leads_agent_id_fkey(agency_id)')
    .eq('id', leadId)
    .single();

  if (!lead) {
    return { success: false, error: 'Lead not found' };
  }

  // Verify target agent is in same agency
  const { data: targetAgent } = await supabase
    .from('agents')
    .select('id, agency_id')
    .eq('id', toAgentId)
    .single();

  if (!targetAgent || targetAgent.agency_id !== currentAgent.agency_id) {
    return { success: false, error: 'Target agent not in your agency' };
  }

  const fromAgentId = lead.agent_id;

  // Reason is required
  if (!reason || reason.trim().length === 0) {
    return { success: false, error: 'Reason is required for reassignment' };
  }

  // Update lead
  const { error: updateError } = await supabase
    .from('leads')
    .update({ agent_id: toAgentId })
    .eq('id', leadId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Log reassignment
  await supabase.from('client_reassignment_log').insert({
    lead_id: leadId,
    from_agent_id: fromAgentId,
    to_agent_id: toAgentId,
    reassigned_by: user.id,
    reason,
    notes,
  });

  // Log event
  await supabase.from('lead_events').insert({
    lead_id: leadId,
    agent_id: user.id,
    event_type: 'client_reassigned',
    event_data: {
      from_agent_id: fromAgentId,
      to_agent_id: toAgentId,
      reason,
    },
    notes,
  });

  revalidatePath('/protected/leads');
  revalidatePath('/protected/pipeline');
  revalidatePath('/protected/admin');
  return { success: true };
}

// ============================================
// Upgrade Features Actions (NEW)
// ============================================

/**
 * Update conversation timeline step
 */
export async function updateConversationStep(
  leadId: string,
  step: ConversationStep,
  completed: boolean,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Get existing lead
  const { data: existingLead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (fetchError || !existingLead) {
    return { success: false, error: 'Lead not found' };
  }

  // Check access
  const hasAccess = await checkLeadAccess(supabase, user.id, existingLead);
  if (!hasAccess) {
    return { success: false, error: 'Access denied' };
  }

  // Get or initialize timeline
  const timeline: ConversationTimeline = existingLead.conversation_timeline || {
    financial_validation: { completed: false },
    soft_discussion: { completed: false },
    family_alignment: { completed: false },
    property_matching: { completed: false },
    execution: { completed: false },
  };

  // Update the step
  const stepData: ConversationStepData = {
    completed,
    completed_at: completed ? new Date().toISOString() : undefined,
    notes: notes || undefined,
  };
  timeline[step] = stepData;

  // Update lead
  const { error: updateError } = await supabase
    .from('leads')
    .update({ conversation_timeline: timeline })
    .eq('id', leadId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath(`/protected/leads/${leadId}`);
  return { success: true };
}

/**
 * Save fallback plan when upgrade is not proceeding
 */
export async function saveFallbackPlan(
  leadId: string,
  plan: Omit<FallbackPlan, 'created_at'>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Get existing lead
  const { data: existingLead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (fetchError || !existingLead) {
    return { success: false, error: 'Lead not found' };
  }

  // Check access
  const hasAccess = await checkLeadAccess(supabase, user.id, existingLead);
  if (!hasAccess) {
    return { success: false, error: 'Access denied' };
  }

  // Create fallback plan with timestamp
  const fallbackPlan: FallbackPlan = {
    ...plan,
    created_at: new Date().toISOString(),
  };

  // Update lead
  const { error: updateError } = await supabase
    .from('leads')
    .update({ fallback_plan: fallbackPlan })
    .eq('id', leadId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Log event
  await supabase.from('lead_events').insert({
    lead_id: leadId,
    agent_id: user.id,
    event_type: 'note_added',
    event_data: {
      type: 'fallback_plan',
      reason: plan.reason,
      next_review_date: plan.next_review_date,
    },
    notes: plan.advisory_notes,
  });

  revalidatePath(`/protected/leads/${leadId}`);
  return { success: true };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check if user has access to a lead (owner or agency admin)
 */
async function checkLeadAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  lead: { agent_id: string }
): Promise<boolean> {
  // Owner always has access
  if (lead.agent_id === userId) {
    return true;
  }

  // Check if user is agency admin with same agency as lead owner
  const { data: currentAgent } = await supabase
    .from('agents')
    .select('role, agency_id')
    .eq('id', userId)
    .single();

  if (!currentAgent || currentAgent.role !== 'admin') {
    return false;
  }

  const { data: leadAgent } = await supabase
    .from('agents')
    .select('agency_id')
    .eq('id', lead.agent_id)
    .single();

  return leadAgent?.agency_id === currentAgent.agency_id;
}
