// ============================================
// Upgrade Readiness Scoring Engine
// Deterministic, rule-based scoring system
// ============================================

import type {
  Lead,
  UpgradeReadinessState,
  UpgradeReadinessBreakdown,
  IncomeHistoryEntry,
} from './types';

// ============================================
// Scoring Configuration (All visible in UI)
// ============================================

const SCORING_CONFIG = {
  // Income growth threshold for positive score
  INCOME_GROWTH_THRESHOLD_PERCENT: 15,
  INCOME_GROWTH_HIGH_THRESHOLD_PERCENT: 25,
  
  // Equity threshold for positive score
  EQUITY_THRESHOLD_PERCENT: 20, // At least 20% equity
  EQUITY_HIGH_THRESHOLD_PERCENT: 30,
  
  // Debt threshold
  LOW_DEBT_THRESHOLD_PERCENT: 30,
  
  // Employment stability
  STABLE_EMPLOYMENT_YEARS: 2,
  
  // Score weights (out of 100)
  WEIGHTS: {
    income_growth: 30,    // Max 30 points
    equity: 25,           // Max 25 points
    debt: 20,             // Max 20 points
    employment: 15,       // Max 15 points
    no_rejection: 10,     // Max 10 points
  },
  
  // Readiness thresholds
  READY_THRESHOLD: 70,
  MONITORING_THRESHOLD: 40,
};

export { SCORING_CONFIG };

// ============================================
// Main Scoring Function
// ============================================

export interface UpgradeReadinessResult {
  score: number;
  state: UpgradeReadinessState;
  breakdown: UpgradeReadinessBreakdown;
}

export function calculateUpgradeReadiness(lead: Lead): UpgradeReadinessResult {
  const incomeResult = scoreIncomeGrowth(lead);
  const equityResult = scoreEquity(lead);
  const debtResult = scoreDebtLevel(lead);
  const employmentResult = scoreEmploymentStability(lead);
  const rejectionResult = scoreNoRejection(lead);

  const totalScore = 
    incomeResult.score +
    equityResult.score +
    debtResult.score +
    employmentResult.score +
    rejectionResult.score;

  // Clamp to 0-100
  const clampedScore = Math.max(0, Math.min(100, totalScore));

  const breakdown: UpgradeReadinessBreakdown = {
    income_growth_score: incomeResult.score,
    income_growth_reason: incomeResult.reason,
    equity_score: equityResult.score,
    equity_reason: equityResult.reason,
    debt_score: debtResult.score,
    debt_reason: debtResult.reason,
    employment_score: employmentResult.score,
    employment_reason: employmentResult.reason,
    rejection_score: rejectionResult.score,
    rejection_reason: rejectionResult.reason,
    total_score: clampedScore,
  };

  const state = determineReadinessState(clampedScore);

  return {
    score: clampedScore,
    state,
    breakdown,
  };
}

// ============================================
// Individual Scoring Functions
// ============================================

interface ScoreResult {
  score: number;
  reason: string;
}

/**
 * Score income growth based on historical data
 * Max: 30 points
 */
function scoreIncomeGrowth(lead: Lead): ScoreResult {
  const { income_history, current_income } = lead;

  // No current income tracked
  if (!current_income) {
    return {
      score: 0,
      reason: 'Current income not tracked. Update financial snapshot.',
    };
  }

  // No history to compare with
  if (!income_history || income_history.length === 0) {
    return {
      score: 10,
      reason: 'Income recorded but no history for comparison.',
    };
  }

  // Get the oldest recorded income for growth calculation
  const sortedHistory = [...income_history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const oldestIncome = sortedHistory[0].amount;

  // Calculate growth percentage
  const growthPercent = ((current_income - oldestIncome) / oldestIncome) * 100;

  if (growthPercent >= SCORING_CONFIG.INCOME_GROWTH_HIGH_THRESHOLD_PERCENT) {
    return {
      score: SCORING_CONFIG.WEIGHTS.income_growth,
      reason: `Excellent! Income grew ${growthPercent.toFixed(0)}% (from RM ${oldestIncome.toLocaleString()} to RM ${current_income.toLocaleString()}).`,
    };
  }

  if (growthPercent >= SCORING_CONFIG.INCOME_GROWTH_THRESHOLD_PERCENT) {
    return {
      score: Math.round(SCORING_CONFIG.WEIGHTS.income_growth * 0.7),
      reason: `Good income growth of ${growthPercent.toFixed(0)}%.`,
    };
  }

  if (growthPercent > 0) {
    return {
      score: Math.round(SCORING_CONFIG.WEIGHTS.income_growth * 0.4),
      reason: `Modest income growth of ${growthPercent.toFixed(0)}%. Watch for more growth.`,
    };
  }

  return {
    score: 5,
    reason: growthPercent < 0 
      ? `Income decreased by ${Math.abs(growthPercent).toFixed(0)}%. Not ready for upgrade.`
      : 'No income growth detected.',
  };
}

/**
 * Score equity position based on property value and loan
 * Max: 25 points
 */
function scoreEquity(lead: Lead): ScoreResult {
  const { current_property_value, outstanding_loan_balance } = lead;

  // No property data
  if (!current_property_value) {
    return {
      score: 0,
      reason: 'No current property value recorded. Client may be renting.',
    };
  }

  // Calculate equity percentage
  const loanBalance = outstanding_loan_balance || 0;
  const equity = current_property_value - loanBalance;
  const equityPercent = (equity / current_property_value) * 100;

  if (equityPercent >= SCORING_CONFIG.EQUITY_HIGH_THRESHOLD_PERCENT) {
    return {
      score: SCORING_CONFIG.WEIGHTS.equity,
      reason: `Strong equity position: ${equityPercent.toFixed(0)}% (RM ${equity.toLocaleString()} available).`,
    };
  }

  if (equityPercent >= SCORING_CONFIG.EQUITY_THRESHOLD_PERCENT) {
    return {
      score: Math.round(SCORING_CONFIG.WEIGHTS.equity * 0.7),
      reason: `Good equity of ${equityPercent.toFixed(0)}%. May be enough for upgrade downpayment.`,
    };
  }

  if (equityPercent > 10) {
    return {
      score: Math.round(SCORING_CONFIG.WEIGHTS.equity * 0.3),
      reason: `Limited equity of ${equityPercent.toFixed(0)}%. May need additional savings for upgrade.`,
    };
  }

  return {
    score: 0,
    reason: equityPercent <= 0 
      ? 'Property is underwater or has no equity.'
      : `Very low equity (${equityPercent.toFixed(0)}%). Not suitable for upgrade.`,
  };
}

/**
 * Score debt level
 * Max: 20 points
 */
function scoreDebtLevel(lead: Lead): ScoreResult {
  const { existing_loan_commitment_percent } = lead;

  // No debt info
  if (existing_loan_commitment_percent === undefined) {
    return {
      score: Math.round(SCORING_CONFIG.WEIGHTS.debt * 0.5),
      reason: 'Existing debt commitment not recorded.',
    };
  }

  if (existing_loan_commitment_percent <= 20) {
    return {
      score: SCORING_CONFIG.WEIGHTS.debt,
      reason: `Excellent! Low existing debt at ${existing_loan_commitment_percent}% of income.`,
    };
  }

  if (existing_loan_commitment_percent <= SCORING_CONFIG.LOW_DEBT_THRESHOLD_PERCENT) {
    return {
      score: Math.round(SCORING_CONFIG.WEIGHTS.debt * 0.7),
      reason: `Manageable debt at ${existing_loan_commitment_percent}% of income.`,
    };
  }

  if (existing_loan_commitment_percent <= 50) {
    return {
      score: Math.round(SCORING_CONFIG.WEIGHTS.debt * 0.3),
      reason: `High debt at ${existing_loan_commitment_percent}% of income. May affect loan eligibility.`,
    };
  }

  return {
    score: 0,
    reason: `Very high debt at ${existing_loan_commitment_percent}% of income. Upgrade unlikely to be approved.`,
  };
}

/**
 * Score employment stability
 * Max: 15 points
 */
function scoreEmploymentStability(lead: Lead): ScoreResult {
  const { employment_type, years_in_current_job } = lead;

  // Check employment type
  const stableTypes = ['permanent', 'business_owner'];
  const isStableType = employment_type && stableTypes.includes(employment_type);

  // Check tenure
  const yearsEmployed = years_in_current_job || 0;
  const hasStableTenure = yearsEmployed >= SCORING_CONFIG.STABLE_EMPLOYMENT_YEARS;

  if (isStableType && hasStableTenure) {
    return {
      score: SCORING_CONFIG.WEIGHTS.employment,
      reason: `Stable: ${employment_type?.replace('_', ' ')} for ${yearsEmployed}+ years.`,
    };
  }

  if (isStableType || hasStableTenure) {
    return {
      score: Math.round(SCORING_CONFIG.WEIGHTS.employment * 0.6),
      reason: isStableType 
        ? `Stable employment type but short tenure (${yearsEmployed} years).`
        : `Good tenure (${yearsEmployed} years) but variable employment type.`,
    };
  }

  if (!employment_type) {
    return {
      score: Math.round(SCORING_CONFIG.WEIGHTS.employment * 0.3),
      reason: 'Employment information not recorded.',
    };
  }

  return {
    score: 5,
    reason: `Variable income source (${employment_type?.replace('_', ' ')}). May need longer credit history.`,
  };
}

/**
 * Score loan rejection history
 * Max: 10 points
 */
function scoreNoRejection(lead: Lead): ScoreResult {
  const { previous_loan_rejection } = lead;

  if (previous_loan_rejection === undefined) {
    return {
      score: Math.round(SCORING_CONFIG.WEIGHTS.no_rejection * 0.5),
      reason: 'Loan rejection history not recorded.',
    };
  }

  if (previous_loan_rejection === false) {
    return {
      score: SCORING_CONFIG.WEIGHTS.no_rejection,
      reason: 'No previous loan rejections on record.',
    };
  }

  return {
    score: 0,
    reason: 'Previous loan rejection. Will need to address credit issues before upgrade.',
  };
}

// ============================================
// State Determination
// ============================================

function determineReadinessState(score: number): UpgradeReadinessState {
  if (score >= SCORING_CONFIG.READY_THRESHOLD) {
    return 'ready';
  }
  if (score >= SCORING_CONFIG.MONITORING_THRESHOLD) {
    return 'monitoring';
  }
  return 'not_ready';
}

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate income growth percentage from history
 */
export function calculateIncomeGrowth(
  currentIncome: number,
  incomeHistory: IncomeHistoryEntry[]
): { growthPercent: number; oldestAmount: number } | null {
  if (!incomeHistory || incomeHistory.length === 0) {
    return null;
  }

  const sortedHistory = [...incomeHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const oldestAmount = sortedHistory[0].amount;
  const growthPercent = ((currentIncome - oldestAmount) / oldestAmount) * 100;

  return { growthPercent, oldestAmount };
}

/**
 * Get readiness state label with explanation
 */
export function getReadinessStateExplanation(state: UpgradeReadinessState): string {
  switch (state) {
    case 'ready':
      return 'Client shows strong upgrade indicators. Proceed with upgrade conversation.';
    case 'monitoring':
      return 'Client has some positive indicators. Continue monitoring for improvement.';
    case 'not_ready':
      return 'Client does not meet upgrade criteria. Focus on other priorities.';
  }
}

/**
 * Get next steps based on readiness state
 */
export function getReadinessNextSteps(
  state: UpgradeReadinessState,
  breakdown: UpgradeReadinessBreakdown
): string[] {
  const steps: string[] = [];

  switch (state) {
    case 'ready':
      steps.push('Schedule upgrade conversation with client');
      steps.push('Prepare affordability analysis');
      steps.push('Identify suitable upgrade properties');
      break;
      
    case 'monitoring':
      if (breakdown.income_growth_score < 20) {
        steps.push('Check for income updates at next touchpoint');
      }
      if (breakdown.equity_score < 15) {
        steps.push('Request updated property valuation');
      }
      if (breakdown.debt_score < 10) {
        steps.push('Discuss debt reduction strategies');
      }
      steps.push('Schedule 3-month follow-up');
      break;
      
    case 'not_ready':
      if (breakdown.income_growth_score < 10) {
        steps.push('Encourage client to report income changes');
      }
      if (breakdown.employment_score < 10) {
        steps.push('Wait for employment stability');
      }
      if (breakdown.rejection_score === 0) {
        steps.push('Recommend credit repair before upgrade discussion');
      }
      steps.push('Schedule 6-month follow-up');
      break;
  }

  return steps;
}
