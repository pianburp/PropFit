// ============================================
// Server Actions for Lead Management
// ============================================

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { qualifyLead } from '@/lib/qualification-engine';
import { detectUpgradeTriggers } from '@/lib/upgrade-triggers';
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
