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

  // ============================================
  // Upgrader-Specific Objections
  // ============================================

  interest_rates_high: {
    category: 'interest_rates_high',
    title: 'Interest Rates Too High',
    description: 'When a client feels current interest rates make upgrading unattractive compared to staying put.',
    keyPoints: [
      'Interest rates are cyclical and currently elevated compared to historical lows.',
      'Property appreciation over time often outpaces interest cost differences.',
      'Banks may offer promotional rates or refinancing options later.',
      'Waiting for "perfect" rates means missing on equity growth and life improvements.',
    ],
    factualResponse: 
      'Interest rates are indeed higher than 2021-2022. Here are the facts to consider:\n\n' +
      '• Rates follow cycles. BNM has historically adjusted rates based on economic conditions.\n' +
      '• The difference between 4.0% and 4.5% on a RM500K loan is approximately RM115/month.\n' +
      '• Property values in established areas have historically appreciated 3-5% annually.\n' +
      '• You can refinance later when rates drop, but you cannot go back in time to buy at today\'s prices.\n' +
      '• The key question is: does the upgrade serve your family\'s needs? If yes, the rate difference is a cost of progress, not a blocker.',
    disclaimer: 
      'Interest rate predictions are speculative. This is factual information about current conditions, not advice. Consult a licensed mortgage advisor for rate comparisons.',
  },

  waiting_market_drop: {
    category: 'waiting_market_drop',
    title: 'Waiting for Market Drop',
    description: 'When a client wants to wait for property prices to fall before upgrading.',
    keyPoints: [
      'No one can reliably predict market timing.',
      'Established areas rarely see significant price drops.',
      'Your current property value would also drop in a downturn.',
      'Time in the market beats timing the market.',
    ],
    factualResponse: 
      'The desire to buy at the "bottom" is understandable. Here are the realities:\n\n' +
      '• In Malaysia, urban prime areas have shown long-term appreciation. Brief corrections of 5-10% are rare and typically short-lived.\n' +
      '• If prices drop 10%, your current property also loses 10%. Upgrading is about the price *difference*, which tends to remain stable.\n' +
      '• Waiting 2 years hoping for a drop means 2 years not in your ideal home, not building equity in a better asset, and potential rent/opportunity costs.\n' +
      '• The question is: is your current home meeting your needs? If not, the market is secondary to life quality.',
    disclaimer: 
      'No one can predict property market movements. This information is educational, not a prediction or advice. Past performance does not guarantee future results.',
  },

  kids_school_concern: {
    category: 'kids_school_concern',
    title: "Kids' School Concern",
    description: 'When a client hesitates to upgrade because children would need to change schools.',
    keyPoints: [
      'School disruption is a valid concern that deserves serious thought.',
      'Many families successfully navigate school transitions.',
      'Some upgrade paths allow staying in the same school catchment.',
      'Timing the move during natural transitions (year-end, primary to secondary) can reduce disruption.',
    ],
    factualResponse: 
      'Moving children to a new school is a significant decision. Here are factors to consider:\n\n' +
      '• Timing matters: Moving during natural transitions (end of school year, primary to secondary) is less disruptive.\n' +
      '• Some upgrade paths keep you in the same general area, preserving school options.\n' +
      '• Children are often more adaptable than parents expect. In 6-12 months, most settle into new routines.\n' +
      '• The trade-off is: a few months of adjustment vs. years in a home that better supports your family\'s space and lifestyle needs.\n\n' +
      'This is a personal decision. We can map upgrade areas that minimize school impact if that is a priority.',
    disclaimer: 
      'This is general information, not advice on your specific family situation. School decisions should be made by parents considering their children\'s individual needs.',
  },

  current_loan_not_paid: {
    category: 'current_loan_not_paid',
    title: 'Current Loan Not Paid Off',
    description: 'When a client feels they should fully pay off their current mortgage before upgrading.',
    keyPoints: [
      'Most upgraders have existing mortgages - this is normal.',
      'Equity (value minus loan) is what matters, not loan balance.',
      'Banks consider total debt-service-ratio, not whether previous loan is "finished".',
      'Waiting to fully pay off may mean missing the best upgrade window.',
    ],
    factualResponse: 
      'The idea of paying off your mortgage before upgrading sounds prudent, but here is how upgrades actually work:\n\n' +
      '• When you sell your current property, the outstanding loan is cleared from the sale proceeds.\n' +
      '• Example: Property worth RM600K, loan balance RM350K → You have RM250K equity to use as downpayment.\n' +
      '• Banks assess your ability to service a new loan based on income and debt ratios, not whether your previous loan is "finished".\n' +
      '• If you wait 10 more years to fully pay off, you will be 10 years older when applying for the upgrade loan (shorter tenure, higher monthly payments).\n' +
      '• The key metric is: Do you have sufficient equity and income to support the upgrade? If yes, the existing loan is not a blocker.',
    disclaimer: 
      'Loan eligibility depends on bank assessment. Consult a licensed mortgage advisor for your specific situation. This is general information only.',
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
