'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    type Lead,
    type UpgradeStage,
    UPGRADE_STAGE_LABELS,
    UPGRADE_READINESS_LABELS,
} from '@/lib/types';
import { analyzeUpgrade, type UpgradeAnalysisResult } from '@/lib/affordability-calculator';
import {
    ArrowRight,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    Home,
} from 'lucide-react';

interface UpgradePathSummaryProps {
    lead: Lead;
}

export function UpgradePathSummary({ lead }: UpgradePathSummaryProps) {
    // Calculate upgrade analysis
    const analysis = analyzeUpgrade({
        monthlyNetIncome: lead.current_income || (lead.monthly_income_min + lead.monthly_income_max) / 2,
        existingMonthlyCommitments:
            lead.existing_loan_commitment_percent
                ? (lead.current_income || 0) * (lead.existing_loan_commitment_percent / 100)
                : 0,
        currentAge: 35, // Default
        currentPropertyValue: lead.current_property_value,
        outstandingLoanBalance: lead.outstanding_loan_balance,
        currentMonthlyInstallment: 0, // Unknown
        isUpgradingFirstHome: lead.is_first_time_buyer === false,
        interestRateProfile: 'conservative',
    });

    const steps = getUpgradeSteps(lead, analysis);
    const currentStepIndex = getCurrentStepIndex(lead.upgrade_stage || 'monitoring');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Upgrade Path Summary
                </CardTitle>
                <CardDescription>
                    Step-by-step progress towards property upgrade
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Step Progress */}
                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <StepItem
                            key={step.id}
                            step={step}
                            isCompleted={index < currentStepIndex}
                            isCurrent={index === currentStepIndex}
                        />
                    ))}
                </div>

                {/* Commitment Comparison */}
                {analysis.affordability && (
                    <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Monthly Commitment Comparison
                        </h4>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2"></th>
                                        <th className="text-right py-2">Current</th>
                                        <th className="text-right py-2">After Upgrade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2 text-muted-foreground">Property Value</td>
                                        <td className="text-right py-2">
                                            {lead.current_property_value
                                                ? formatRMFull(lead.current_property_value)
                                                : '-'}
                                        </td>
                                        <td className="text-right py-2 font-medium">
                                            {formatRMFull(analysis.affordability.conservativePropertyPrice)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 text-muted-foreground">Monthly Installment</td>
                                        <td className="text-right py-2">
                                            {analysis.currentMonthlyCommitment > 0
                                                ? formatRMFull(analysis.currentMonthlyCommitment)
                                                : '-'}
                                        </td>
                                        <td className="text-right py-2 font-medium">
                                            {formatRMFull(analysis.newMonthlyCommitment)}
                                        </td>
                                    </tr>
                                    {analysis.monthlyDifference !== 0 && analysis.currentMonthlyCommitment > 0 && (
                                        <tr>
                                            <td className="py-2 font-medium">Net Monthly Change</td>
                                            <td className="text-right py-2"></td>
                                            <td className={`text-right py-2 font-bold ${analysis.monthlyDifference > 0 ? 'text-amber-600' : 'text-green-600'
                                                }`}>
                                                {analysis.monthlyDifference > 0 ? '+' : ''}
                                                {formatRMFull(analysis.monthlyDifference)}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Feasibility Status */}
                <div className={`p-3 rounded-lg ${analysis.isFeasible
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-amber-50 border border-amber-200'
                    }`}>
                    <div className="flex items-start gap-2">
                        {analysis.isFeasible ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                        )}
                        <div>
                            <p className={`text-sm font-medium ${analysis.isFeasible ? 'text-green-800' : 'text-amber-800'
                                }`}>
                                {analysis.feasibilityReason}
                            </p>
                            {analysis.recommendedSteps.length > 0 && (
                                <ul className="mt-2 text-xs space-y-1">
                                    {analysis.recommendedSteps.map((step, i) => (
                                        <li key={i} className={analysis.isFeasible ? 'text-green-700' : 'text-amber-700'}>
                                            • {step}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-muted-foreground italic">
                    These are estimates based on conservative assumptions. Actual approval depends on
                    bank assessment and documentation. No guaranteed approval is implied.
                </p>
            </CardContent>
        </Card>
    );
}

interface Step {
    id: string;
    title: string;
    description: string;
}

interface StepItemProps {
    step: Step;
    isCompleted: boolean;
    isCurrent: boolean;
}

function StepItem({ step, isCompleted, isCurrent }: StepItemProps) {
    return (
        <div className={`flex items-start gap-3 p-2 rounded-lg ${isCurrent ? 'bg-primary/10' : ''
            }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted
                ? 'bg-green-500 text-white'
                : isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.id}
            </div>
            <div className="flex-1">
                <p className={`font-medium text-sm ${isCompleted ? 'text-green-700 line-through' : ''
                    }`}>
                    {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
        </div>
    );
}

function getUpgradeSteps(lead: Lead, analysis: UpgradeAnalysisResult): Step[] {
    return [
        {
            id: '1',
            title: 'Financial Assessment Complete',
            description: lead.current_income
                ? 'Income and financial data recorded'
                : 'Track current income and commitments',
        },
        {
            id: '2',
            title: 'Equity Available for Downpayment',
            description: analysis.equity
                ? `${formatRMFull(analysis.equity.usableEquity)} usable equity identified`
                : 'Determine available equity or savings',
        },
        {
            id: '3',
            title: 'New Affordability Range Calculated',
            description: analysis.affordability
                ? `Can afford up to ${formatRMFull(analysis.affordability.conservativePropertyPrice)}`
                : 'Calculate what client can afford',
        },
        {
            id: '4',
            title: 'Property Options Identified',
            description: 'Find suitable upgrade properties in budget',
        },
        {
            id: '5',
            title: 'Loan Pre-Qualification',
            description: 'Submit to banks for preliminary assessment',
        },
        {
            id: '6',
            title: 'Upgrade Execution',
            description: 'Complete purchase and move-in',
        },
    ];
}

function getCurrentStepIndex(stage: UpgradeStage): number {
    switch (stage) {
        case 'monitoring':
            return 0;
        case 'window_open':
            return 2;
        case 'planning':
            return 4;
        case 'executed':
            return 6;
        case 'lost':
            return -1;
        default:
            return 0;
    }
}

// Export formatRMFull for use in types
function formatRMFull(amount: number): string {
    return `RM ${amount.toLocaleString()}`;
}
