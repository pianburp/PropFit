// ============================================
// "Why Now?" Upgrade Justification Generator
// Deterministic, factual summary generation
// ============================================

import type { Lead, IncomeHistoryEntry } from '@/lib/types';
import { CALCULATOR_CONFIG, calculateEquity } from '@/lib/affordability-calculator';

// ============================================
// Types
// ============================================

export interface WhyNowJustification {
  incomeGrowth: JustificationPoint | null;
  equityPosition: JustificationPoint | null;
  affordabilityThreshold: JustificationPoint | null;
  summary: string[];
}

export interface JustificationPoint {
  title: string;
  factualStatement: string;
  dataSource: string;
  timestamp?: string;
}

// ============================================
// Main Generator Function
// ============================================

export function generateWhyNowJustification(lead: Lead): WhyNowJustification {
  const incomeGrowth = analyzeIncomeGrowth(lead);
  const equityPosition = analyzeEquityPosition(lead);
  const affordabilityThreshold = analyzeAffordabilityThreshold(lead);

  // Build summary array of short, factual statements
  const summary: string[] = [];
  
  if (incomeGrowth) {
    summary.push(incomeGrowth.factualStatement);
  }
  
  if (equityPosition) {
    summary.push(equityPosition.factualStatement);
  }
  
  if (affordabilityThreshold) {
    summary.push(affordabilityThreshold.factualStatement);
  }

  return {
    incomeGrowth,
    equityPosition,
    affordabilityThreshold,
    summary,
  };
}

// ============================================
// Income Growth Analysis
// ============================================

function analyzeIncomeGrowth(lead: Lead): JustificationPoint | null {
  const currentIncome = lead.current_income;
  const incomeHistory = lead.income_history || [];

  if (!currentIncome || incomeHistory.length === 0) {
    return null;
  }

  // Find oldest income entry
  const sortedHistory = [...incomeHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const oldestEntry = sortedHistory[0];
  
  if (!oldestEntry || oldestEntry.amount >= currentIncome) {
    return null;
  }

  const growthAmount = currentIncome - oldestEntry.amount;
  const growthPercent = ((growthAmount / oldestEntry.amount) * 100).toFixed(1);
  const months = getMonthsDifference(oldestEntry.date, lead.income_last_updated || new Date().toISOString());

  return {
    title: 'Income Growth',
    factualStatement: `Income increased by RM ${growthAmount.toLocaleString()} (${growthPercent}%) over ${months} months.`,
    dataSource: `Recorded income history from ${formatDate(oldestEntry.date)} to ${formatDate(lead.income_last_updated || '')}`,
    timestamp: lead.income_last_updated,
  };
}

// ============================================
// Equity Position Analysis
// ============================================

function analyzeEquityPosition(lead: Lead): JustificationPoint | null {
  const propertyValue = lead.current_property_value;
  const loanBalance = lead.outstanding_loan_balance;

  if (!propertyValue) {
    return null;
  }

  if (loanBalance === undefined || loanBalance === null) {
    return {
      title: 'Property Ownership',
      factualStatement: `Current property valued at RM ${propertyValue.toLocaleString()}.`,
      dataSource: `Property value recorded on ${formatDate(lead.property_value_last_updated || '')}`,
      timestamp: lead.property_value_last_updated,
    };
  }

  const equityResult = calculateEquity({
    currentPropertyValue: propertyValue,
    outstandingLoanBalance: loanBalance,
    includeSellingCosts: true,
  });

  const equityPercent = equityResult.grossEquityPercent.toFixed(1);

  return {
    title: 'Equity Position',
    factualStatement: `Gross equity of RM ${equityResult.grossEquity.toLocaleString()} (${equityPercent}% of property value). Usable equity after costs: RM ${equityResult.usableEquity.toLocaleString()}.`,
    dataSource: `Based on property value RM ${propertyValue.toLocaleString()} and loan balance RM ${loanBalance.toLocaleString()}. ${CALCULATOR_CONFIG.EQUITY_BUFFER_PERCENT * 100}% safety buffer applied.`,
    timestamp: lead.property_value_last_updated,
  };
}

// ============================================
// Affordability Threshold Analysis
// ============================================

function analyzeAffordabilityThreshold(lead: Lead): JustificationPoint | null {
  const readinessState = lead.upgrade_readiness_state;
  const readinessScore = lead.upgrade_readiness_score || 0;

  if (!readinessState || readinessState === 'not_ready') {
    return null;
  }

  const stateLabels: Record<string, string> = {
    ready: 'Ready',
    monitoring: 'Monitoring',
  };

  const thresholdInfo = readinessState === 'ready' 
    ? 'Score crossed the 70-point threshold for "Ready" status.'
    : 'Score is in the 40-69 range (Monitoring status).';

  return {
    title: 'Upgrade Readiness',
    factualStatement: `Upgrade readiness score: ${readinessScore}/100 (${stateLabels[readinessState] || readinessState}). ${thresholdInfo}`,
    dataSource: 'Calculated from income growth, equity, debt level, employment stability, and credit history factors.',
    timestamp: lead.updated_at,
  };
}

// ============================================
// Helper Functions
// ============================================

function getMonthsDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, months);
}

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-MY', { 
    year: 'numeric', 
    month: 'short',
    day: 'numeric',
  });
}

// ============================================
// Summary for WhatsApp-Ready View
// ============================================

export function getCompactWhyNowSummary(lead: Lead): string[] {
  const justification = generateWhyNowJustification(lead);
  
  // Return short, shareable statements
  const compact: string[] = [];
  
  if (justification.incomeGrowth) {
    compact.push(`📈 ${justification.incomeGrowth.factualStatement}`);
  }
  
  if (justification.equityPosition) {
    compact.push(`🏠 ${justification.equityPosition.factualStatement}`);
  }
  
  if (justification.affordabilityThreshold) {
    compact.push(`✅ ${justification.affordabilityThreshold.factualStatement}`);
  }
  
  if (compact.length === 0) {
    compact.push('Insufficient data for upgrade justification summary.');
  }
  
  return compact;
}
