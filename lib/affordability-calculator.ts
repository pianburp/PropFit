// ============================================
// Affordability & Equity Calculator
// Malaysia-specific with conservative assumptions
// ============================================

// ============================================
// Configuration (All assumptions visible in UI)
// ============================================

export const CALCULATOR_CONFIG = {
  // Interest Rate Profiles
  INTEREST_RATES: {
    conservative: {
      rate: 0.058, // 5.8% - Default, stress-tested
      label: 'Conservative (5.8%)',
      description: 'Assumes higher-than-market rate for safety',
    },
    standard: {
      rate: 0.05, // 5.0% - Banker-friendly
      label: 'Standard (5.0%)',
      description: 'Close to current market rates',
    },
    optimistic: {
      rate: 0.045, // 4.5% - Internal planning only
      label: 'Optimistic (4.5%)',
      description: 'Best-case scenario (admin only)',
    },
  },

  // Bank Negara DSR Guidelines
  MAX_DSR_RATIO: 0.60, // 60% of net income
  CONSERVATIVE_DSR_RATIO: 0.50, // 50% for safer estimate

  // Mortgage Terms
  MAX_TENURE_YEARS: 35,
  MAX_AGE_AT_MATURITY: 70,
  DEFAULT_TENURE_YEARS: 30,

  // Downpayment Requirements
  FIRST_HOME_DOWNPAYMENT: 0.10, // 10%
  SECOND_HOME_DOWNPAYMENT: 0.20, // 20%
  THIRD_HOME_DOWNPAYMENT: 0.30, // 30%

  // Additional Costs (Malaysia)
  STAMP_DUTY_RATE: 0.03, // ~3% average
  LEGAL_FEES_RATE: 0.01, // ~1%
  MISC_FEES_BUFFER: 5000, // RM 5,000 buffer

  // Equity Calculation
  EQUITY_BUFFER_PERCENT: 0.20, // 20% buffer for safety
  SELLING_COSTS_PERCENT: 0.035, // ~3.5% (agent fees, legal, etc.)
};

export type InterestRateProfile = 'conservative' | 'standard' | 'optimistic';

// ============================================
// Affordability Calculator
// ============================================

export interface AffordabilityInput {
  monthlyNetIncome: number;
  existingMonthlyCommitments?: number;
  currentAge?: number;
  isFirstTimeBuyer?: boolean;
  interestRateProfile?: InterestRateProfile;
}

export interface AffordabilityResult {
  // Property range
  maxPropertyPrice: number;
  conservativePropertyPrice: number;
  
  // Monthly payments
  maxMonthlyInstallment: number;
  conservativeMonthlyInstallment: number;
  
  // Breakdown
  availableDSR: number;
  usedDSR: number;
  remainingDSR: number;
  effectiveTenure: number;
  interestRate: number;
  
  // Upfront costs
  requiredDownpayment: number;
  stampDuty: number;
  legalFees: number;
  totalUpfrontCost: number;
  
  // Assumptions used
  assumptions: string[];
  
  // Disclaimer (always shown)
  disclaimer: string;
}

export function calculateAffordability(input: AffordabilityInput): AffordabilityResult {
  const {
    monthlyNetIncome,
    existingMonthlyCommitments = 0,
    currentAge = 35,
    isFirstTimeBuyer = true,
    interestRateProfile = 'conservative',
  } = input;

  const config = CALCULATOR_CONFIG;
  const rateConfig = config.INTEREST_RATES[interestRateProfile];
  const annualRate = rateConfig.rate;
  const monthlyRate = annualRate / 12;

  // Calculate available DSR
  const maxDSR = config.MAX_DSR_RATIO;
  const usedDSR = existingMonthlyCommitments / monthlyNetIncome;
  const remainingDSR = Math.max(0, maxDSR - usedDSR);
  
  // Max monthly installment based on DSR
  const maxMonthlyInstallment = monthlyNetIncome * remainingDSR;
  const conservativeMonthlyInstallment = monthlyNetIncome * Math.min(remainingDSR, config.CONSERVATIVE_DSR_RATIO);

  // Calculate effective tenure
  const maxAge = config.MAX_AGE_AT_MATURITY;
  const yearsToMaxAge = Math.max(0, maxAge - currentAge);
  const effectiveTenure = Math.min(config.MAX_TENURE_YEARS, yearsToMaxAge);
  const tenureMonths = effectiveTenure * 12;

  // Calculate max property price using present value of annuity formula
  // PV = PMT * [(1 - (1 + r)^-n) / r]
  const calculatePropertyPrice = (monthlyPayment: number) => {
    if (tenureMonths === 0 || monthlyRate === 0) return 0;
    const pvFactor = (1 - Math.pow(1 + monthlyRate, -tenureMonths)) / monthlyRate;
    return monthlyPayment * pvFactor;
  };

  const maxLoanAmount = calculatePropertyPrice(maxMonthlyInstallment);
  const conservativeLoanAmount = calculatePropertyPrice(conservativeMonthlyInstallment);

  // Add downpayment back to get property price
  const downpaymentRate = isFirstTimeBuyer 
    ? config.FIRST_HOME_DOWNPAYMENT 
    : config.SECOND_HOME_DOWNPAYMENT;
  
  // Property Price = Loan Amount / (1 - Downpayment Rate)
  const maxPropertyPrice = Math.round(maxLoanAmount / (1 - downpaymentRate));
  const conservativePropertyPrice = Math.round(conservativeLoanAmount / (1 - downpaymentRate));

  // Calculate upfront costs (using conservative price)
  const requiredDownpayment = Math.round(conservativePropertyPrice * downpaymentRate);
  const stampDuty = calculateStampDuty(conservativePropertyPrice);
  const legalFees = Math.round(conservativePropertyPrice * config.LEGAL_FEES_RATE);
  const totalUpfrontCost = requiredDownpayment + stampDuty + legalFees + config.MISC_FEES_BUFFER;

  // Build assumptions list
  const assumptions = [
    `Interest rate: ${(annualRate * 100).toFixed(1)}% p.a. (${rateConfig.description})`,
    `Max DSR used: ${(maxDSR * 100).toFixed(0)}% (Bank Negara guideline)`,
    `Loan tenure: ${effectiveTenure} years (based on age ${currentAge})`,
    `Downpayment: ${(downpaymentRate * 100).toFixed(0)}% (${isFirstTimeBuyer ? 'first home' : 'subsequent home'})`,
    `Existing commitments: RM ${existingMonthlyCommitments.toLocaleString()}/month`,
  ];

  const disclaimer = 
    'This is an illustrative estimate only. Actual loan approval depends on bank assessment, ' +
    'credit score, documentation, and other eligibility criteria. This is NOT a loan approval.';

  return {
    maxPropertyPrice,
    conservativePropertyPrice,
    maxMonthlyInstallment: Math.round(maxMonthlyInstallment),
    conservativeMonthlyInstallment: Math.round(conservativeMonthlyInstallment),
    availableDSR: maxDSR,
    usedDSR,
    remainingDSR,
    effectiveTenure,
    interestRate: annualRate,
    requiredDownpayment,
    stampDuty,
    legalFees,
    totalUpfrontCost,
    assumptions,
    disclaimer,
  };
}

/**
 * Calculate Malaysia stamp duty (simplified)
 * Actual rates are tiered, this is an approximation
 */
function calculateStampDuty(propertyPrice: number): number {
  // Simplified tiered calculation
  let duty = 0;
  
  if (propertyPrice <= 100000) {
    duty = propertyPrice * 0.01;
  } else if (propertyPrice <= 500000) {
    duty = 1000 + (propertyPrice - 100000) * 0.02;
  } else if (propertyPrice <= 1000000) {
    duty = 9000 + (propertyPrice - 500000) * 0.03;
  } else {
    duty = 24000 + (propertyPrice - 1000000) * 0.04;
  }
  
  return Math.round(duty);
}

// ============================================
// Equity Calculator
// ============================================

export interface EquityInput {
  currentPropertyValue: number;
  outstandingLoanBalance: number;
  includeSellingCosts?: boolean;
}

export interface EquityResult {
  // Gross equity
  grossEquity: number;
  grossEquityPercent: number;
  
  // Net usable equity (after buffer)
  usableEquity: number;
  usableEquityPercent: number;
  
  // Breakdown
  sellingCosts: number;
  safetyBuffer: number;
  
  // What it can be used for
  availableForDownpayment: number;
  affordableUpgradeProperty: number;
  
  // Assumptions
  assumptions: string[];
  
  // Disclaimer
  disclaimer: string;
}

export function calculateEquity(input: EquityInput): EquityResult {
  const {
    currentPropertyValue,
    outstandingLoanBalance,
    includeSellingCosts = true,
  } = input;

  const config = CALCULATOR_CONFIG;

  // Gross equity
  const grossEquity = currentPropertyValue - outstandingLoanBalance;
  const grossEquityPercent = currentPropertyValue > 0 
    ? (grossEquity / currentPropertyValue) * 100 
    : 0;

  // Selling costs if applicable
  const sellingCosts = includeSellingCosts 
    ? Math.round(currentPropertyValue * config.SELLING_COSTS_PERCENT)
    : 0;

  // Safety buffer (20% of property value)
  const safetyBuffer = Math.round(grossEquity * config.EQUITY_BUFFER_PERCENT);

  // Net usable equity
  const usableEquity = Math.max(0, grossEquity - sellingCosts - safetyBuffer);
  const usableEquityPercent = currentPropertyValue > 0 
    ? (usableEquity / currentPropertyValue) * 100 
    : 0;

  // What can be purchased with this equity as downpayment (10% for first home)
  const availableForDownpayment = usableEquity;
  const affordableUpgradeProperty = Math.round(usableEquity / config.FIRST_HOME_DOWNPAYMENT);

  // Build assumptions
  const assumptions = [
    `Property value: RM ${currentPropertyValue.toLocaleString()}`,
    `Outstanding loan: RM ${outstandingLoanBalance.toLocaleString()}`,
    `Safety buffer: ${(config.EQUITY_BUFFER_PERCENT * 100).toFixed(0)}% of equity held back`,
    includeSellingCosts 
      ? `Selling costs: ${(config.SELLING_COSTS_PERCENT * 100).toFixed(1)}% (agent, legal, etc.)`
      : 'Selling costs not included',
  ];

  const disclaimer = 
    'Actual equity depends on final property valuation and settlement costs. ' +
    'Bank valuations may differ from market estimates. This is an estimate only.';

  return {
    grossEquity,
    grossEquityPercent,
    usableEquity,
    usableEquityPercent,
    sellingCosts,
    safetyBuffer,
    availableForDownpayment,
    affordableUpgradeProperty,
    assumptions,
    disclaimer,
  };
}

// ============================================
// Combined Upgrade Analysis
// ============================================

export interface UpgradeAnalysisInput {
  // Current situation
  monthlyNetIncome: number;
  existingMonthlyCommitments?: number;
  currentAge?: number;
  
  // Current property (if any)
  currentPropertyValue?: number;
  outstandingLoanBalance?: number;
  currentMonthlyInstallment?: number;
  
  // Upgrade preferences
  isUpgradingFirstHome?: boolean;
  interestRateProfile?: InterestRateProfile;
}

export interface UpgradeAnalysisResult {
  affordability: AffordabilityResult;
  equity: EquityResult | null;
  
  // Comparison
  currentMonthlyCommitment: number;
  newMonthlyCommitment: number;
  monthlyDifference: number;
  
  // Feasibility
  isFeasible: boolean;
  feasibilityReason: string;
  
  // Next steps
  recommendedSteps: string[];
}

export function analyzeUpgrade(input: UpgradeAnalysisInput): UpgradeAnalysisResult {
  const {
    monthlyNetIncome,
    existingMonthlyCommitments = 0,
    currentAge = 35,
    currentPropertyValue,
    outstandingLoanBalance = 0,
    currentMonthlyInstallment = 0,
    isUpgradingFirstHome = false,
    interestRateProfile = 'conservative',
  } = input;

  // Calculate affordability (excluding current mortgage from commitments)
  const nonMortgageCommitments = existingMonthlyCommitments - currentMonthlyInstallment;
  const affordability = calculateAffordability({
    monthlyNetIncome,
    existingMonthlyCommitments: Math.max(0, nonMortgageCommitments),
    currentAge,
    isFirstTimeBuyer: !isUpgradingFirstHome,
    interestRateProfile,
  });

  // Calculate equity if property exists
  const equity = currentPropertyValue 
    ? calculateEquity({
        currentPropertyValue,
        outstandingLoanBalance,
        includeSellingCosts: true,
      })
    : null;

  // Calculate monthly commitment comparison
  const currentMonthlyCommitment = currentMonthlyInstallment;
  const newMonthlyCommitment = affordability.conservativeMonthlyInstallment;
  const monthlyDifference = newMonthlyCommitment - currentMonthlyCommitment;

  // Determine feasibility
  let isFeasible = false;
  let feasibilityReason = '';

  if (affordability.remainingDSR <= 0) {
    feasibilityReason = 'Existing commitments exceed available DSR. Not feasible.';
  } else if (equity && equity.usableEquity < affordability.requiredDownpayment * 0.5) {
    feasibilityReason = 'Limited equity for downpayment. May need additional savings.';
    isFeasible = equity.usableEquity > 0;
  } else if (affordability.conservativePropertyPrice < (currentPropertyValue || 0)) {
    feasibilityReason = 'Cannot afford a more expensive property. Lateral move possible.';
    isFeasible = true;
  } else {
    feasibilityReason = 'Upgrade appears financially feasible.';
    isFeasible = true;
  }

  // Build recommended steps
  const recommendedSteps: string[] = [];
  
  if (isFeasible) {
    recommendedSteps.push('Get updated property valuation for current home');
    recommendedSteps.push('Request mortgage pre-approval from 2-3 banks');
    if (equity && equity.usableEquity > 0) {
      recommendedSteps.push('Confirm equity release timeline with current lender');
    }
    recommendedSteps.push('Identify target properties in affordable range');
  } else {
    if (affordability.remainingDSR <= 0) {
      recommendedSteps.push('Focus on reducing existing debt first');
    }
    if (!equity || equity.usableEquity < affordability.requiredDownpayment * 0.5) {
      recommendedSteps.push('Build additional savings for downpayment');
    }
    recommendedSteps.push('Reassess in 6-12 months');
  }

  return {
    affordability,
    equity,
    currentMonthlyCommitment,
    newMonthlyCommitment,
    monthlyDifference,
    isFeasible,
    feasibilityReason,
    recommendedSteps,
  };
}

// ============================================
// Formatting Utilities
// ============================================

export function formatRMCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `RM ${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `RM ${(amount / 1000).toFixed(0)}K`;
  }
  return `RM ${amount.toLocaleString()}`;
}

export function formatRMFull(amount: number): string {
  return `RM ${amount.toLocaleString()}`;
}
