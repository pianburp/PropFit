// ============================================
// Family & Spouse Objection Categories
// Neutral, compliance-safe explanations
// ============================================

import type { ObjectionCategory } from '@/lib/types';

// ============================================
// Types
// ============================================

export interface ObjectionExplanation {
  category: ObjectionCategory;
  title: string;
  description: string;
  keyPoints: string[];
  factualResponse: string;
  disclaimer: string;
}

// ============================================
// Predefined Objection Categories
// ============================================

export const OBJECTION_EXPLANATIONS: Record<ObjectionCategory, ObjectionExplanation> = {
  spouse_concern: {
    category: 'spouse_concern',
    title: 'Spouse Concern',
    description: 'When a spouse wants to review or has concerns about the upgrade decision.',
    keyPoints: [
      'Joint financial decisions benefit from both parties reviewing the numbers together.',
      'All calculations are based on documented income and conservative assumptions.',
      'The affordability analysis can be reviewed together at any time.',
    ],
    factualResponse: 
      'This is a significant financial decision, and it is appropriate for both partners to review the details. ' +
      'The financial analysis is based on your recorded income, current loan balance, and property value. ' +
      'All assumptions used in calculations are visible and can be explained. ' +
      'Consider scheduling a joint review session where both of you can ask questions.',
    disclaimer: 
      'This information is for discussion purposes only. Final loan approval depends on bank assessment and documentation from both borrowers if applying jointly.',
  },

  parent_advice: {
    category: 'parent_advice',
    title: 'Parent Advice',
    description: 'When parents or family elders provide input on the property decision.',
    keyPoints: [
      'Family input is valued, especially from those with property ownership experience.',
      'Market conditions and financing rules may differ from previous generations.',
      'Current affordability calculations are based on today\'s regulations and rates.',
    ],
    factualResponse: 
      'Family advice is valuable, especially from those who have navigated property purchases before. ' +
      'However, some aspects of property financing have changed over time. ' +
      'Current Bank Negara Malaysia guidelines set the maximum Debt Service Ratio at 70%. ' +
      'Interest rates and property prices have evolved since earlier generations purchased property. ' +
      'The analysis provided is based on current market conditions and regulations.',
    disclaimer: 
      'Past property market performance does not guarantee future results. Consult licensed financial advisors for personalised guidance.',
  },

  commitment_fear: {
    category: 'commitment_fear',
    title: 'Commitment Fear',
    description: 'When there is concern about taking on a larger financial commitment.',
    keyPoints: [
      'Understanding the exact monthly difference helps clarify the commitment.',
      'The analysis shows both current and new monthly obligations.',
      'Conservative assumptions are used to provide a realistic view.',
    ],
    factualResponse: 
      'Concerns about larger commitments are understandable. Here are the facts to consider:\n\n' +
      '• The monthly installment difference is calculated and visible.\n' +
      '• Calculations use a conservative interest rate assumption to account for potential rate changes.\n' +
      '• The Debt Service Ratio shows what percentage of income goes to loan repayments.\n' +
      '• No decision needs to be made immediately; this is an assessment of readiness.\n\n' +
      'Taking time to understand the numbers fully is encouraged.',
    disclaimer: 
      'These calculations are estimates. Actual loan terms depend on bank approval and prevailing rates at application time.',
  },

  timing_uncertainty: {
    category: 'timing_uncertainty',
    title: 'Timing Uncertainty',
    description: 'When there is uncertainty about whether now is the right time to upgrade.',
    keyPoints: [
      'Timing depends on personal factors, not market predictions.',
      'Key indicators include income stability, equity position, and life stage.',
      'The readiness assessment is based on objective, measurable factors.',
    ],
    factualResponse: 
      'Determining the right timing is personal and depends on several measurable factors:\n\n' +
      '• Income stability: How long in current employment and income trend.\n' +
      '• Equity availability: Current property value minus outstanding loan.\n' +
      '• Life stage: Family needs and space requirements.\n' +
      '• Financial buffer: Savings and ability to handle unexpected expenses.\n\n' +
      'The readiness score is calculated from these objective factors, not market predictions or speculation.',
    disclaimer: 
      'No one can predict optimal market timing. This assessment focuses on personal financial readiness, not market forecasting.',
  },
};

// ============================================
// Helper Functions
// ============================================

export function getObjectionExplanation(category: ObjectionCategory): ObjectionExplanation {
  return OBJECTION_EXPLANATIONS[category];
}

export function getAllObjectionCategories(): ObjectionExplanation[] {
  return Object.values(OBJECTION_EXPLANATIONS);
}

export function formatForClipboard(explanation: ObjectionExplanation): string {
  return `${explanation.title}\n\n${explanation.factualResponse}\n\n⚠️ ${explanation.disclaimer}`;
}
