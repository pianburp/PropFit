// ============================================
// Lead Qualification Engine
// Rule-based scoring for Malaysia real estate leads
// ============================================

import type {
  Lead,
  CreateLeadInput,
  QualificationStatus,
  FinancingReadiness,
  QualificationBreakdown,
  SuggestedArea,
  PricingRule,
  AreaRule,
  Intent,
  City,
  EmploymentType,
  MoveInTimeline,
} from './types';
import { AREAS_BY_CITY } from './areas';

// ============================================
// Scoring Weights
// ============================================

const SCORING_WEIGHTS = {
  income: 0.4,      // 40% - Income vs Property Affordability
  location: 0.3,    // 30% - Location Fit
  credit: 0.2,      // 20% - Credit/Financing Readiness
  urgency: 0.1,     // 10% - Urgency/Intent
};

// ============================================
// Main Qualification Function
// ============================================

export interface QualificationResult {
  score: number;
  status: QualificationStatus;
  financingReadiness: FinancingReadiness;
  breakdown: QualificationBreakdown;
  suggestedAreas: SuggestedArea[];
}

export function qualifyLead(
  lead: CreateLeadInput | Lead,
  pricingRules: PricingRule[]
): QualificationResult {
  const pricingRule = pricingRules.find(
    (r) => r.city === lead.preferred_city && r.intent === lead.intent
  );

  if (!pricingRule) {
    throw new Error(`No pricing rules found for ${lead.preferred_city} - ${lead.intent}`);
  }

  // Calculate individual scores
  const incomeResult = calculateIncomeScore(lead, pricingRule);
  const locationResult = calculateLocationScore(lead, pricingRule);
  const creditResult = calculateCreditScore(lead);
  const urgencyResult = calculateUrgencyScore(lead);

  // Calculate weighted total
  const totalScore = Math.round(
    incomeResult.score * SCORING_WEIGHTS.income +
    locationResult.score * SCORING_WEIGHTS.location +
    creditResult.score * SCORING_WEIGHTS.credit +
    urgencyResult.score * SCORING_WEIGHTS.urgency
  );

  // Determine qualification status
  const status = determineQualificationStatus(totalScore);
  
  // Calculate financing readiness
  const financingReadiness = calculateFinancingReadiness(lead);

  // Generate suggested areas
  const suggestedAreas = generateSuggestedAreas(lead, pricingRule);

  const breakdown: QualificationBreakdown = {
    income_score: incomeResult.score,
    location_score: locationResult.score,
    credit_score: creditResult.score,
    urgency_score: urgencyResult.score,
    total_score: totalScore,
    details: {
      income_analysis: incomeResult.analysis,
      location_analysis: locationResult.analysis,
      credit_analysis: creditResult.analysis,
      urgency_analysis: urgencyResult.analysis,
    },
  };

  return {
    score: totalScore,
    status,
    financingReadiness,
    breakdown,
    suggestedAreas,
  };
}

// ============================================
// Income Scoring (40% weight)
// ============================================

interface ScoreResult {
  score: number;
  analysis: string;
}

function calculateIncomeScore(
  lead: CreateLeadInput | Lead,
  pricingRule: PricingRule
): ScoreResult {
  const avgIncome = (lead.monthly_income_min + lead.monthly_income_max) / 2;
  const avgBudget = (lead.budget_min + lead.budget_max) / 2;

  if (lead.intent === 'rent') {
    // For rent: Budget should be <= 35% of income (ideal is <= 30%)
    const rentToIncomeRatio = avgBudget / avgIncome;
    
    if (rentToIncomeRatio <= 0.25) {
      return {
        score: 100,
        analysis: `Excellent! Rent budget (RM${avgBudget.toLocaleString()}) is only ${(rentToIncomeRatio * 100).toFixed(0)}% of income. Very comfortable.`,
      };
    } else if (rentToIncomeRatio <= 0.30) {
      return {
        score: 90,
        analysis: `Good. Rent budget is ${(rentToIncomeRatio * 100).toFixed(0)}% of income. Healthy ratio.`,
      };
    } else if (rentToIncomeRatio <= 0.35) {
      return {
        score: 70,
        analysis: `Acceptable. Rent budget is ${(rentToIncomeRatio * 100).toFixed(0)}% of income. At recommended limit.`,
      };
    } else if (rentToIncomeRatio <= 0.40) {
      return {
        score: 50,
        analysis: `Stretch. Rent budget is ${(rentToIncomeRatio * 100).toFixed(0)}% of income. Above recommended 35%.`,
      };
    } else {
      return {
        score: 20,
        analysis: `Warning. Rent budget is ${(rentToIncomeRatio * 100).toFixed(0)}% of income. Too high, may struggle with expenses.`,
      };
    }
  } else {
    // For buy: Calculate max affordable property based on DTI
    const maxDTI = pricingRule.max_dti_ratio;
    const maxMonthlyInstallment = avgIncome * maxDTI;
    const maxAffordablePrice = maxMonthlyInstallment * pricingRule.price_to_installment_ratio;

    // Account for existing loan commitments
    const existingCommitment = lead.existing_loan_commitment_percent || 0;
    const adjustedDTI = maxDTI - (existingCommitment / 100);
    const adjustedMaxInstallment = avgIncome * Math.max(adjustedDTI, 0.1);
    const adjustedMaxPrice = adjustedMaxInstallment * pricingRule.price_to_installment_ratio;

    if (avgBudget <= adjustedMaxPrice * 0.8) {
      return {
        score: 100,
        analysis: `Excellent! Budget (RM${(avgBudget / 1000).toFixed(0)}K) is well within affordability (max RM${(adjustedMaxPrice / 1000).toFixed(0)}K).`,
      };
    } else if (avgBudget <= adjustedMaxPrice) {
      return {
        score: 80,
        analysis: `Good. Budget is within max affordability of RM${(adjustedMaxPrice / 1000).toFixed(0)}K.`,
      };
    } else if (avgBudget <= adjustedMaxPrice * 1.15) {
      return {
        score: 55,
        analysis: `Stretch. Budget slightly exceeds max affordability. May need higher downpayment or co-borrower.`,
      };
    } else {
      return {
        score: 20,
        analysis: `Overbudget. Target RM${(avgBudget / 1000).toFixed(0)}K exceeds affordable range (RM${(adjustedMaxPrice / 1000).toFixed(0)}K). Suggest lower budget or increase income.`,
      };
    }
  }
}

// ============================================
// Location Scoring (30% weight)
// ============================================

function calculateLocationScore(
  lead: CreateLeadInput | Lead,
  pricingRule: PricingRule
): ScoreResult {
  if (lead.preferred_areas.length === 0) {
    return {
      score: 50,
      analysis: 'No specific areas selected. Will provide recommendations based on budget.',
    };
  }

  const avgBudget = (lead.budget_min + lead.budget_max) / 2;
  const areaRules = pricingRule.area_rules;
  
  let matchingAreas = 0;
  let stretchAreas = 0;
  let unmatchedAreas = 0;
  const areaAnalysis: string[] = [];

  for (const area of lead.preferred_areas) {
    const rule = areaRules[area];
    if (!rule) {
      unmatchedAreas++;
      continue;
    }

    if (avgBudget >= rule.min_budget && avgBudget <= rule.max_budget) {
      matchingAreas++;
      areaAnalysis.push(`${formatAreaName(area)}: ✓ Within budget`);
    } else if (avgBudget >= rule.min_budget * 0.85 && avgBudget <= rule.max_budget * 1.15) {
      stretchAreas++;
      areaAnalysis.push(`${formatAreaName(area)}: ⚠ Stretch`);
    } else {
      unmatchedAreas++;
      areaAnalysis.push(`${formatAreaName(area)}: ✗ Outside budget`);
    }
  }

  const totalAreas = lead.preferred_areas.length;
  const matchRatio = totalAreas > 0 ? (matchingAreas + stretchAreas * 0.5) / totalAreas : 0;

  let score: number;
  let summary: string;

  if (matchRatio >= 0.8) {
    score = 100;
    summary = 'Excellent location-budget match!';
  } else if (matchRatio >= 0.6) {
    score = 80;
    summary = 'Good location-budget alignment.';
  } else if (matchRatio >= 0.4) {
    score = 60;
    summary = 'Some areas may be a stretch.';
  } else if (matchRatio >= 0.2) {
    score = 40;
    summary = 'Most preferred areas exceed budget.';
  } else {
    score = 20;
    summary = 'Preferred areas significantly exceed budget.';
  }

  return {
    score,
    analysis: `${summary} ${areaAnalysis.join('. ')}.`,
  };
}

// ============================================
// Credit/Financing Readiness Scoring (20% weight)
// ============================================

function calculateCreditScore(lead: CreateLeadInput | Lead): ScoreResult {
  let score = 70; // Base score
  const factors: string[] = [];

  // Employment type scoring
  const employmentScores: Record<EmploymentType, number> = {
    permanent: 25,
    business_owner: 20,
    contract: 10,
    self_employed: 5,
    freelance: 0,
  };

  if (lead.employment_type) {
    score += employmentScores[lead.employment_type] || 0;
    if (employmentScores[lead.employment_type] >= 20) {
      factors.push(`Stable employment (${lead.employment_type.replace('_', ' ')})`);
    } else {
      factors.push(`Variable income source may affect loan approval`);
    }
  }

  // Years in job scoring
  if (lead.years_in_current_job !== undefined) {
    if (lead.years_in_current_job >= 3) {
      score += 15;
      factors.push(`${lead.years_in_current_job}+ years employment stability`);
    } else if (lead.years_in_current_job >= 1) {
      score += 8;
      factors.push('Moderate job tenure');
    } else {
      score -= 10;
      factors.push('Less than 1 year at current job');
    }
  }

  // Existing loan commitments
  if (lead.existing_loan_commitment_percent !== undefined) {
    if (lead.existing_loan_commitment_percent <= 20) {
      score += 10;
      factors.push('Low existing debt obligations');
    } else if (lead.existing_loan_commitment_percent <= 40) {
      score -= 5;
      factors.push('Moderate existing debt');
    } else {
      score -= 20;
      factors.push('High existing debt may limit loan eligibility');
    }
  }

  // Previous loan rejection
  if (lead.previous_loan_rejection) {
    score -= 25;
    factors.push('Previous loan rejection - needs addressing');
  }

  // First-time buyer bonus (for buying)
  if (lead.intent === 'buy' && lead.is_first_time_buyer) {
    score += 5;
    factors.push('First-time buyer - may qualify for special schemes');
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    analysis: factors.length > 0 ? factors.join('. ') + '.' : 'Limited financing information provided.',
  };
}

// ============================================
// Urgency Scoring (10% weight)
// ============================================

function calculateUrgencyScore(lead: CreateLeadInput | Lead): ScoreResult {
  const timelineScores: Record<MoveInTimeline, number> = {
    immediate: 100,
    '1_3_months': 90,
    '3_6_months': 70,
    '6_12_months': 50,
    flexible: 30,
  };

  let score = timelineScores[lead.move_in_timeline];
  let analysis = '';

  switch (lead.move_in_timeline) {
    case 'immediate':
      analysis = 'High urgency - ready to move immediately. Prioritize this lead.';
      break;
    case '1_3_months':
      analysis = 'Good urgency - looking within 1-3 months. Active buyer/renter.';
      break;
    case '3_6_months':
      analysis = 'Moderate timeline - 3-6 months. Good for nurturing.';
      break;
    case '6_12_months':
      analysis = 'Long timeline - 6-12 months. Early stage, keep in touch.';
      break;
    case 'flexible':
      analysis = 'No timeline pressure - may be exploring options.';
      break;
  }

  // Boost score if lease is ending soon (for renters or rent-to-buy)
  if (lead.lease_end_date) {
    const leaseEnd = new Date(lead.lease_end_date);
    const today = new Date();
    const monthsUntilEnd = (leaseEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsUntilEnd <= 3 && monthsUntilEnd > 0) {
      score = Math.min(100, score + 20);
      analysis += ' Lease ending soon - added urgency.';
    }
  }

  return { score, analysis };
}

// ============================================
// Financing Readiness Calculator
// ============================================

function calculateFinancingReadiness(lead: CreateLeadInput | Lead): FinancingReadiness {
  let points = 0;

  // Employment type
  if (lead.employment_type === 'permanent') points += 3;
  else if (lead.employment_type === 'business_owner') points += 2;
  else if (lead.employment_type === 'contract') points += 1;

  // Job tenure
  if (lead.years_in_current_job && lead.years_in_current_job >= 2) points += 2;
  else if (lead.years_in_current_job && lead.years_in_current_job >= 1) points += 1;

  // Existing commitments
  if (lead.existing_loan_commitment_percent !== undefined) {
    if (lead.existing_loan_commitment_percent <= 20) points += 2;
    else if (lead.existing_loan_commitment_percent <= 40) points += 1;
    else points -= 1;
  }

  // No previous rejection
  if (lead.previous_loan_rejection === false) points += 2;
  else if (lead.previous_loan_rejection === true) points -= 2;

  // First time buyer bonus
  if (lead.is_first_time_buyer) points += 1;

  if (points >= 7) return 'strong';
  if (points >= 4) return 'moderate';
  return 'weak';
}

// ============================================
// Qualification Status Determination
// ============================================

function determineQualificationStatus(score: number): QualificationStatus {
  if (score >= 70) return 'qualified';
  if (score >= 45) return 'stretch';
  return 'not_qualified';
}

// ============================================
// Area Suggestion Generator
// ============================================

function generateSuggestedAreas(
  lead: CreateLeadInput | Lead,
  pricingRule: PricingRule
): SuggestedArea[] {
  const avgBudget = (lead.budget_min + lead.budget_max) / 2;
  const suggestions: SuggestedArea[] = [];
  const areaRules = pricingRule.area_rules;
  const cityAreas = AREAS_BY_CITY[lead.preferred_city];

  // First, check preferred areas
  for (const area of lead.preferred_areas) {
    const rule = areaRules[area];
    if (!rule) continue;

    const areaInfo = cityAreas.find((a) => a.value === area);
    
    if (avgBudget >= rule.min_budget && avgBudget <= rule.max_budget) {
      suggestions.push({
        area: areaInfo?.label || area,
        reason: 'Perfect fit for your budget',
        fit: 'perfect',
        estimated_budget: { min: rule.min_budget, max: rule.max_budget },
      });
    } else if (avgBudget >= rule.min_budget * 0.85 && avgBudget <= rule.max_budget * 1.15) {
      suggestions.push({
        area: areaInfo?.label || area,
        reason: 'Slightly outside typical budget but achievable',
        fit: 'stretch',
        estimated_budget: { min: rule.min_budget, max: rule.max_budget },
      });
    }
  }

  // Then, suggest alternative areas based on budget
  for (const [areaKey, rule] of Object.entries(areaRules)) {
    // Skip if already in preferred areas
    if (lead.preferred_areas.includes(areaKey)) continue;
    
    const areaInfo = cityAreas.find((a) => a.value === areaKey);
    
    // Find areas where budget fits well
    if (avgBudget >= rule.min_budget && avgBudget <= rule.max_budget) {
      suggestions.push({
        area: areaInfo?.label || areaKey,
        reason: 'Alternative area within your budget',
        fit: 'alternative',
        estimated_budget: { min: rule.min_budget, max: rule.max_budget },
      });
    }
  }

  // Sort: perfect first, then stretch, then alternatives
  const fitOrder = { perfect: 0, stretch: 1, alternative: 2 };
  suggestions.sort((a, b) => fitOrder[a.fit] - fitOrder[b.fit]);

  // Return top 5 suggestions
  return suggestions.slice(0, 5);
}

// ============================================
// Helper Functions
// ============================================

function formatAreaName(area: string): string {
  return area
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================
// Export utility for formatting currency
// ============================================

export function formatRM(amount: number): string {
  if (amount >= 1000000) {
    return `RM ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `RM ${(amount / 1000).toFixed(0)}K`;
  }
  return `RM ${amount.toLocaleString()}`;
}

export function formatRMFull(amount: number): string {
  return `RM ${amount.toLocaleString()}`;
}
