/**
 * Calculators - Barrel Export
 *
 * Central export point for all business calculation modules.
 * These are pure functions that can be used on both client and server.
 */

// Affordability calculations
export {
  calculateAffordability,
  calculateEquity,
  analyzeUpgrade,
  CALCULATOR_CONFIG,
  type AffordabilityInput,
  type AffordabilityResult,
  type EquityInput,
  type EquityResult,
  type UpgradeAnalysisInput,
  type UpgradeAnalysisResult,
  type InterestRateProfile,
} from '../affordability-calculator';

// Lead qualification engine
export {
  qualifyLead,
  type QualificationResult,
} from '../qualification-engine';

// Upgrade readiness scoring
export {
  calculateUpgradeReadiness,
  SCORING_CONFIG,
  type UpgradeReadinessResult,
} from '../upgrade-readiness';

// Upgrade trigger detection
export {
  detectUpgradeTriggers,
  type TriggerDetectionResult,
} from '../upgrade-triggers';

// Deal risk analysis
export {
  analyzeDealRisks,
} from '../deal-risk-analyzer';

// "Why Now" justification generator
export {
  generateWhyNowJustification,
  type WhyNowJustification,
  type JustificationPoint,
} from '../why-now-generator';

// Objection handling
export {
  OBJECTION_EXPLANATIONS,
  type ObjectionExplanation,
} from '../objection-categories';

// Area data
export {
  AREAS_BY_CITY,
  getAreaLabel,
  getAreasForCity,
  getAreasByTier,
  type AreaOption,
} from '../areas';
