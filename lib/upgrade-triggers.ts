// ============================================
// Upgrade Trigger System
// Detect when leads are ready for property upgrades
// ============================================

import type {
  Lead,
  UpgradeTrigger,
  UpgradeAlert,
  UpgradeAlertType,
} from './types';

// ============================================
// Trigger Detection Configuration
// ============================================

const TRIGGER_CONFIG = {
  // Lead age threshold for "lead matured" trigger
  LEAD_MATURED_MONTHS: 6,
  
  // Lease ending threshold (months)
  LEASE_ENDING_THRESHOLD_MONTHS: 3,
  
  // Income increase threshold percentage
  INCOME_INCREASE_THRESHOLD_PERCENT: 15,
  
  // Budget increase threshold for "higher tier interest"
  BUDGET_INCREASE_THRESHOLD_PERCENT: 20,
};

// ============================================
// Main Trigger Detection Function
// ============================================

export interface TriggerDetectionResult {
  isUpgradeReady: boolean;
  triggers: UpgradeTrigger[];
  alerts: Omit<UpgradeAlert, 'id' | 'agent_id' | 'created_at'>[];
}

export function detectUpgradeTriggers(
  currentLead: Lead,
  previousLead?: Lead
): TriggerDetectionResult {
  const triggers: UpgradeTrigger[] = [];
  const alerts: Omit<UpgradeAlert, 'id' | 'agent_id' | 'created_at'>[] = [];
  const now = new Date().toISOString();

  // 1. Check for income increase
  if (previousLead) {
    const incomeResult = checkIncomeIncrease(currentLead, previousLead);
    if (incomeResult) {
      triggers.push({
        type: 'income_increase',
        triggered_at: now,
        reason: incomeResult.reason,
      });
      alerts.push({
        lead_id: currentLead.id,
        alert_type: 'income_increase',
        title: '💰 Income Increase Detected',
        description: incomeResult.description,
        suggested_action: incomeResult.suggestedAction,
        is_read: false,
        is_dismissed: false,
      });
    }
  }

  // 2. Check for lead matured (6+ months old)
  const maturedResult = checkLeadMatured(currentLead);
  if (maturedResult) {
    triggers.push({
      type: 'lead_matured',
      triggered_at: now,
      reason: maturedResult.reason,
    });
    alerts.push({
      lead_id: currentLead.id,
      alert_type: 'lead_matured',
      title: '📅 Lead Matured - Time for Follow-up',
      description: maturedResult.description,
      suggested_action: maturedResult.suggestedAction,
      is_read: false,
      is_dismissed: false,
    });
  }

  // 3. Check for lease ending soon
  const leaseResult = checkLeaseEnding(currentLead);
  if (leaseResult) {
    triggers.push({
      type: 'lease_ending',
      triggered_at: now,
      reason: leaseResult.reason,
    });
    alerts.push({
      lead_id: currentLead.id,
      alert_type: 'lease_ending',
      title: '🏠 Lease Ending Soon',
      description: leaseResult.description,
      suggested_action: leaseResult.suggestedAction,
      is_read: false,
      is_dismissed: false,
    });
  }

  // 4. Check for higher tier interest (budget increase)
  if (previousLead) {
    const tierResult = checkHigherTierInterest(currentLead, previousLead);
    if (tierResult) {
      triggers.push({
        type: 'higher_tier_interest',
        triggered_at: now,
        reason: tierResult.reason,
      });
      alerts.push({
        lead_id: currentLead.id,
        alert_type: 'higher_tier_interest',
        title: '⬆️ Higher Budget Interest',
        description: tierResult.description,
        suggested_action: tierResult.suggestedAction,
        is_read: false,
        is_dismissed: false,
      });
    }
  }

  // 5. Check for rent-to-buy readiness
  const rentToBuyResult = checkRentToBuyReadiness(currentLead);
  if (rentToBuyResult) {
    triggers.push({
      type: 'rent_to_buy_ready',
      triggered_at: now,
      reason: rentToBuyResult.reason,
    });
    alerts.push({
      lead_id: currentLead.id,
      alert_type: 'rent_to_buy_ready',
      title: '🔑 Rent to Buy Opportunity',
      description: rentToBuyResult.description,
      suggested_action: rentToBuyResult.suggestedAction,
      is_read: false,
      is_dismissed: false,
    });
  }

  // 6. Check for property ownership anniversary
  const anniversaryResult = checkPropertyAnniversary(currentLead);
  if (anniversaryResult) {
    triggers.push({
      type: anniversaryResult.alertType,
      triggered_at: now,
      reason: anniversaryResult.reason,
    });
    alerts.push({
      lead_id: currentLead.id,
      alert_type: anniversaryResult.alertType,
      title: anniversaryResult.title,
      description: anniversaryResult.description,
      suggested_action: anniversaryResult.suggestedAction,
      is_read: false,
      is_dismissed: false,
    });
  }

  return {
    isUpgradeReady: triggers.length > 0,
    triggers,
    alerts,
  };
}

// ============================================
// Individual Trigger Checkers
// ============================================

interface TriggerResult {
  reason: string;
  description: string;
  suggestedAction: string;
}

function checkIncomeIncrease(
  current: Lead,
  previous: Lead
): TriggerResult | null {
  const currentAvgIncome = (current.monthly_income_min + current.monthly_income_max) / 2;
  const previousAvgIncome = (previous.monthly_income_min + previous.monthly_income_max) / 2;
  
  const increasePercent = ((currentAvgIncome - previousAvgIncome) / previousAvgIncome) * 100;
  
  if (increasePercent >= TRIGGER_CONFIG.INCOME_INCREASE_THRESHOLD_PERCENT) {
    return {
      reason: `Income increased by ${increasePercent.toFixed(0)}%`,
      description: `${current.name}'s income has increased from RM ${previousAvgIncome.toLocaleString()} to RM ${currentAvgIncome.toLocaleString()} (${increasePercent.toFixed(0)}% increase).`,
      suggestedAction: current.intent === 'rent' 
        ? 'Consider showing premium rental options or discussing home purchase.'
        : 'Re-qualify for higher property price range. May now afford premium areas.',
    };
  }
  
  return null;
}

function checkLeadMatured(lead: Lead): TriggerResult | null {
  const createdAt = new Date(lead.created_at);
  const now = new Date();
  const monthsOld = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  // Only trigger for leads that are:
  // 1. At least 6 months old
  // 2. Still in nurturing/new/contacted status (not actively engaged)
  const inactiveStatuses = ['new', 'contacted', 'nurturing'];
  
  if (
    monthsOld >= TRIGGER_CONFIG.LEAD_MATURED_MONTHS &&
    inactiveStatuses.includes(lead.status)
  ) {
    return {
      reason: `Lead is ${Math.floor(monthsOld)} months old`,
      description: `${lead.name} has been in your pipeline for ${Math.floor(monthsOld)} months. Their situation may have changed.`,
      suggestedAction: 'Schedule a check-in call to reassess needs, income, and timeline. Life circumstances may have improved.',
    };
  }
  
  return null;
}

function checkLeaseEnding(lead: Lead): TriggerResult | null {
  if (!lead.lease_end_date) return null;
  
  const leaseEnd = new Date(lead.lease_end_date);
  const now = new Date();
  const monthsUntilEnd = (leaseEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  if (monthsUntilEnd > 0 && monthsUntilEnd <= TRIGGER_CONFIG.LEASE_ENDING_THRESHOLD_MONTHS) {
    return {
      reason: `Lease ending in ${Math.ceil(monthsUntilEnd)} month(s)`,
      description: `${lead.name}'s current lease ends on ${leaseEnd.toLocaleDateString('en-MY')}. They'll need a new place soon!`,
      suggestedAction: lead.intent === 'rent'
        ? 'Contact immediately with rental options. High conversion potential!'
        : 'Perfect time to discuss purchasing. They need to decide soon.',
    };
  }
  
  return null;
}

function checkHigherTierInterest(
  current: Lead,
  previous: Lead
): TriggerResult | null {
  const currentAvgBudget = (current.budget_min + current.budget_max) / 2;
  const previousAvgBudget = (previous.budget_min + previous.budget_max) / 2;
  
  const increasePercent = ((currentAvgBudget - previousAvgBudget) / previousAvgBudget) * 100;
  
  if (increasePercent >= TRIGGER_CONFIG.BUDGET_INCREASE_THRESHOLD_PERCENT) {
    return {
      reason: `Budget increased by ${increasePercent.toFixed(0)}%`,
      description: `${current.name} has increased their budget from RM ${previousAvgBudget.toLocaleString()} to RM ${currentAvgBudget.toLocaleString()}.`,
      suggestedAction: 'Show premium properties in their newly accessible areas. They may be ready for an upgrade.',
    };
  }
  
  return null;
}

function checkRentToBuyReadiness(lead: Lead): TriggerResult | null {
  // Only check for renters
  if (lead.intent !== 'rent') return null;
  
  // Check if lead has strong financing indicators
  const avgIncome = (lead.monthly_income_min + lead.monthly_income_max) / 2;
  
  // Criteria for rent-to-buy readiness:
  // 1. Stable employment
  // 2. Good job tenure
  // 3. Reasonable income (can support mortgage)
  // 4. Low existing commitments
  
  const hasStableEmployment = 
    lead.employment_type === 'permanent' || 
    lead.employment_type === 'business_owner';
  
  const hasGoodTenure = (lead.years_in_current_job || 0) >= 2;
  
  const hasGoodIncome = avgIncome >= 5000; // RM 5000+ can consider buying
  
  const hasLowCommitments = (lead.existing_loan_commitment_percent || 0) <= 30;
  
  const noPreviousRejection = !lead.previous_loan_rejection;
  
  // Score the readiness (need at least 4 out of 5)
  const readinessScore = [
    hasStableEmployment,
    hasGoodTenure,
    hasGoodIncome,
    hasLowCommitments,
    noPreviousRejection,
  ].filter(Boolean).length;
  
  if (readinessScore >= 4) {
    return {
      reason: 'Strong financing profile for home purchase',
      description: `${lead.name} is currently renting but appears financially ready to buy. They have stable employment, good income, and manageable debt.`,
      suggestedAction: 'Discuss home ownership benefits vs renting. Show entry-level purchase options in their preferred areas.',
    };
  }
  
  return null;
}

// ============================================
// Property Anniversary Checker
// ============================================

interface AnniversaryTriggerResult extends TriggerResult {
  alertType: 'property_anniversary_3yr' | 'property_anniversary_5yr';
  title: string;
}

function checkPropertyAnniversary(lead: Lead): AnniversaryTriggerResult | null {
  // Skip if no purchase year recorded
  if (!lead.current_property_purchase_year) return null;
  
  // Skip if not a property owner (intent is rent and no current property)
  if (lead.intent === 'rent' && !lead.current_property_type) return null;
  
  const currentYear = new Date().getFullYear();
  const yearsOwned = currentYear - lead.current_property_purchase_year;
  
  // 3-year anniversary - common upgrade consideration point
  if (yearsOwned === 3) {
    return {
      alertType: 'property_anniversary_3yr',
      title: '🏠 3-Year Property Anniversary',
      reason: `${yearsOwned} years since property purchase`,
      description: `${lead.name} has owned their property for 3 years. This is a common point where homeowners start considering upgrades as equity has grown and lifestyle needs may have changed.`,
      suggestedAction: 'Reach out to discuss their current situation. Ask about family changes, space needs, or investment goals. Good time to start planting upgrade seeds.',
    };
  }
  
  // 5-year anniversary - refinancing window + significant equity
  if (yearsOwned === 5) {
    return {
      alertType: 'property_anniversary_5yr',
      title: '🔑 5-Year Property Anniversary',
      reason: `${yearsOwned} years since property purchase - refinancing window`,
      description: `${lead.name} has owned their property for 5 years. Lock-in periods typically end around this time, and significant equity has likely built up. Prime upgrade candidate.`,
      suggestedAction: 'Priority follow-up. Discuss refinancing options and upgrade paths. The 5-year mark is the ideal window for property upgrades.',
    };
  }
  
  return null;
}

// ============================================
// Batch Trigger Check (for scheduled jobs)
// ============================================

export function getUpgradeAlertMessage(alertType: UpgradeAlertType): string {
  const messages: Record<UpgradeAlertType, string> = {
    income_increase: 'Income has increased - may afford higher tier properties',
    lead_matured: 'Lead in pipeline for 6+ months - time for a check-in',
    lease_ending: 'Current lease ending soon - urgent opportunity',
    higher_tier_interest: 'Showing interest in higher budget range',
    rent_to_buy_ready: 'Renter with strong buying potential',
    readiness_state_changed: 'Upgrade readiness state has changed',
    property_anniversary_3yr: '3-year property anniversary - good time to discuss upgrade',
    property_anniversary_5yr: '5-year property anniversary - prime upgrade window',
  };
  return messages[alertType];
}

