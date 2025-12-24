// ============================================
// Deal Risk Analyzer
// Deterministic risk detection with explanations
// ============================================

import type { Lead, DealRiskFlag, DealRiskType } from '@/lib/types';
import { CALCULATOR_CONFIG, calculateAffordability } from '@/lib/affordability-calculator';

// ============================================
// Configuration
// ============================================

const RISK_CONFIG = {
  // DSR thresholds
  TIGHT_MARGIN_DSR_THRESHOLD: 55, // DSR > 55% is considered tight
  CRITICAL_DSR_THRESHOLD: 65, // DSR > 65% is critical
  
  // Job tenure thresholds
  SHORT_TENURE_MONTHS: 24, // Less than 2 years is considered short
  
  // Rate sensitivity
  RATE_INCREASE_TEST: 0.01, // Test 1% rate increase
  
  // Equity assumptions
  EQUITY_VARIANCE_WARNING: 0.15, // 15% variance warning
};

// ============================================
// Main Analyzer Function
// ============================================

export function analyzeDealRisks(lead: Lead): DealRiskFlag[] {
  const risks: DealRiskFlag[] = [];

  // Check each risk type
  const tightMargin = checkTightMargin(lead);
  if (tightMargin) risks.push(tightMargin);

  const optimisticEquity = checkOptimisticEquity(lead);
  if (optimisticEquity) risks.push(optimisticEquity);

  const shortTenure = checkShortTenure(lead);
  if (shortTenure) risks.push(shortTenure);

  const rateSensitive = checkRateSensitivity(lead);
  if (rateSensitive) risks.push(rateSensitive);

  return risks;
}

// ============================================
// Individual Risk Checks
// ============================================

function checkTightMargin(lead: Lead): DealRiskFlag | null {
  const income = lead.current_income || ((lead.monthly_income_min + lead.monthly_income_max) / 2);
  const existingCommitmentPercent = lead.existing_loan_commitment_percent || 0;
  
  if (existingCommitmentPercent === 0) {
    return null;
  }

  const usedDSR = existingCommitmentPercent;
  const remainingDSR = 70 - usedDSR; // BNM max is 70%

  if (usedDSR >= RISK_CONFIG.TIGHT_MARGIN_DSR_THRESHOLD) {
    const severity = usedDSR >= RISK_CONFIG.CRITICAL_DSR_THRESHOLD ? 'Critical' : 'Warning';
    
    return {
      type: 'tight_margin',
      reason: `Current DSR at ${usedDSR.toFixed(1)}% leaves only ${remainingDSR.toFixed(1)}% for new commitments.`,
      details: 
        `Calculation: Existing loan commitment uses ${usedDSR.toFixed(1)}% of monthly income.\n` +
        `Bank Negara Malaysia maximum DSR is 70%.\n` +
        `Available DSR for new loan: ${remainingDSR.toFixed(1)}%.\n` +
        `Status: ${severity} - ${usedDSR >= RISK_CONFIG.CRITICAL_DSR_THRESHOLD 
          ? 'Very limited room for additional commitment.' 
          : 'Limited buffer for unexpected expenses or rate increases.'}`,
    };
  }

  return null;
}

function checkOptimisticEquity(lead: Lead): DealRiskFlag | null {
  const propertyValue = lead.current_property_value;
  const lastUpdated = lead.property_value_last_updated;

  if (!propertyValue || !lastUpdated) {
    return null;
  }

  // Check if property value is old (more than 6 months)
  const updateDate = new Date(lastUpdated);
  const now = new Date();
  const monthsOld = (now.getFullYear() - updateDate.getFullYear()) * 12 + (now.getMonth() - updateDate.getMonth());

  if (monthsOld >= 6) {
    return {
      type: 'optimistic_equity',
      reason: `Property value was last updated ${monthsOld} months ago.`,
      details: 
        `Current recorded value: RM ${propertyValue.toLocaleString()}\n` +
        `Last updated: ${updateDate.toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' })}\n\n` +
        `Property values can change over time. A valuation older than 6 months may not reflect current market conditions.\n\n` +
        `Recommendation: Consider getting an updated property valuation for more accurate equity calculation.`,
    };
  }

  return null;
}

function checkShortTenure(lead: Lead): DealRiskFlag | null {
  const yearsInJob = lead.years_in_current_job;
  const employmentType = lead.employment_type;

  if (yearsInJob === undefined || yearsInJob === null) {
    return null;
  }

  const monthsInJob = yearsInJob * 12;

  if (monthsInJob < RISK_CONFIG.SHORT_TENURE_MONTHS) {
    // Self-employed and business owners have different considerations
    if (employmentType === 'self_employed' || employmentType === 'business_owner') {
      return {
        type: 'short_tenure',
        reason: `${employmentType === 'business_owner' ? 'Business' : 'Self-employment'} is less than 2 years old.`,
        details: 
          `Current tenure: ${yearsInJob.toFixed(1)} years (${monthsInJob} months)\n` +
          `Employment type: ${employmentType === 'business_owner' ? 'Business Owner' : 'Self-Employed'}\n\n` +
          `Bank requirements for self-employed/business owners typically include:\n` +
          `• Minimum 2 years of business operation\n` +
          `• Business registration documents (SSM)\n` +
          `• 2 years of audited accounts or Form B tax returns\n\n` +
          `Some banks may offer loans with less tenure but with stricter conditions.`,
      };
    }

    return {
      type: 'short_tenure',
      reason: `Employment tenure is ${yearsInJob.toFixed(1)} years (less than 2 years).`,
      details: 
        `Current tenure: ${yearsInJob.toFixed(1)} years (${monthsInJob} months)\n` +
        `Minimum recommended: 2 years (24 months)\n\n` +
        `Most banks prefer applicants with at least 2 years in current employment for stability assessment.\n` +
        `Shorter tenure may result in:\n` +
        `• More documentation requirements\n` +
        `• Stricter income verification\n` +
        `• Some banks declining the application\n\n` +
        `Note: Confirmed permanent employees may have more flexibility.`,
    };
  }

  return null;
}

function checkRateSensitivity(lead: Lead): DealRiskFlag | null {
  const income = lead.current_income || ((lead.monthly_income_min + lead.monthly_income_max) / 2);
  const existingCommitmentPercent = lead.existing_loan_commitment_percent || 0;

  if (!income || existingCommitmentPercent === 0) {
    return null;
  }

  // Calculate affordability at current rate
  const currentAffordability = calculateAffordability({
    monthlyNetIncome: income,
    existingMonthlyCommitments: income * (existingCommitmentPercent / 100),
    interestRateProfile: 'standard',
  });

  // Calculate affordability at higher rate (conservative = stress test)
  const stressedAffordability = calculateAffordability({
    monthlyNetIncome: income,
    existingMonthlyCommitments: income * (existingCommitmentPercent / 100),
    interestRateProfile: 'conservative',
  });

  const maxPriceDrop = currentAffordability.maxPropertyPrice - stressedAffordability.maxPropertyPrice;
  const dropPercent = (maxPriceDrop / currentAffordability.maxPropertyPrice) * 100;

  // If a 1% rate increase reduces max property by more than 10%, flag it
  if (dropPercent > 10) {
    return {
      type: 'rate_sensitive',
      reason: `A 1% rate increase would reduce maximum property price by ${dropPercent.toFixed(1)}%.`,
      details: 
        `Current max property (at conservative rate): RM ${currentAffordability.maxPropertyPrice.toLocaleString()}\n` +
        `Max property (stress-tested rate): RM ${stressedAffordability.maxPropertyPrice.toLocaleString()}\n` +
        `Reduction: RM ${maxPriceDrop.toLocaleString()} (${dropPercent.toFixed(1)}%)\n\n` +
        `Interest rates can change during the loan tenure. The stress test shows affordability if rates increase by approximately 1%.\n\n` +
        `Recommendation: Consider targeting properties at or below the stress-tested maximum to maintain buffer for rate changes.`,
    };
  }

  return null;
}

// ============================================
// Helper Functions
// ============================================

export function hasHighRisk(risks: DealRiskFlag[]): boolean {
  return risks.some(r => r.type === 'tight_margin' || r.type === 'short_tenure');
}

export function getRiskSeverity(risk: DealRiskFlag): 'high' | 'medium' | 'low' {
  switch (risk.type) {
    case 'tight_margin':
    case 'short_tenure':
      return 'high';
    case 'rate_sensitive':
      return 'medium';
    case 'optimistic_equity':
      return 'low';
    default:
      return 'medium';
  }
}
