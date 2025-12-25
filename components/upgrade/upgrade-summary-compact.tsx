'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Lead } from '@/lib/types';
import { analyzeUpgrade } from '@/lib/affordability-calculator';
import { getCompactWhyNowSummary } from '@/lib/why-now-generator';
import {
    ArrowRight,
    TrendingUp,
    Home,
    DollarSign,
    AlertCircle,
} from 'lucide-react';

interface UpgradeSummaryCompactProps {
    lead: Lead;
}

export function UpgradeSummaryCompact({ lead }: UpgradeSummaryCompactProps) {
    // Calculate monthly income from the range
    const monthlyIncome = lead.current_income || ((lead.monthly_income_min + lead.monthly_income_max) / 2);
    
    // Get current property value from either current_property_value or purchase price
    const currentPropertyValue = lead.current_property_value || lead.current_property_purchase_price;
    
    // Calculate existing commitments
    const existingCommitments = lead.existing_loan_commitment_percent
        ? monthlyIncome * (lead.existing_loan_commitment_percent / 100)
        : 0;

    const analysis = analyzeUpgrade({
        monthlyNetIncome: monthlyIncome,
        existingMonthlyCommitments: existingCommitments,
        currentAge: 35,
        currentPropertyValue: currentPropertyValue,
        outstandingLoanBalance: lead.outstanding_loan_balance || 0,
        currentMonthlyInstallment: 0,
        isUpgradingFirstHome: lead.is_first_time_buyer === false,
        interestRateProfile: 'conservative',
    });

    const whyNowPoints = getCompactWhyNowSummary(lead);
    
    // Check if we have enough data for meaningful display
    const hasIncomeData = monthlyIncome > 0;
    const hasCurrentProperty = !!currentPropertyValue;
    const hasUpgradeBudget = lead.budget_max > 0;

    return (
        <div className="w-full max-w-md mx-auto bg-background p-4 space-y-4">
            {/* Header */}
            <div className="text-center pb-3 border-b">
                <h2 className="text-lg font-bold">{lead.name}</h2>
                <p className="text-sm text-muted-foreground">Upgrade Summary</p>
            </div>

            {/* Property Comparison */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Property Comparison
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-center flex-1">
                            <p className="text-xs text-muted-foreground">Current</p>
                            <p className="font-bold">
                                {hasCurrentProperty
                                    ? formatRM(currentPropertyValue!)
                                    : '—'}
                            </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        <div className="text-center flex-1">
                            <p className="text-xs text-muted-foreground">Target Budget</p>
                            <p className="font-bold text-primary">
                                {hasUpgradeBudget 
                                    ? formatRM(lead.budget_max)
                                    : hasIncomeData 
                                        ? formatRM(analysis.affordability.conservativePropertyPrice)
                                        : '—'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Commitment / Financial Overview */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Financial Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    {hasIncomeData ? (
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Monthly Income</span>
                                <span className="font-medium">{formatRM(monthlyIncome)}</span>
                            </div>
                            {lead.existing_loan_commitment_percent && lead.existing_loan_commitment_percent > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Existing Commitments</span>
                                    <span className="font-medium">{lead.existing_loan_commitment_percent}%</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm border-t pt-2">
                                <span className="text-muted-foreground">Est. New Monthly</span>
                                <span className="font-bold text-primary">
                                    {formatRM(analysis.affordability.conservativeMonthlyInstallment)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="w-4 h-4" />
                            <span>Income data required for analysis</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Why Now Summary */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Why Now?
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1">
                    {whyNowPoints.length > 0 ? (
                        whyNowPoints.map((point, index) => (
                            <p key={index} className="text-sm">
                                {point}
                            </p>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Add more lead details to generate upgrade justifications.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Readiness Badge */}
            <div className="text-center pt-2">
                <Badge
                    variant={lead.upgrade_readiness_state === 'ready' ? 'default' : 'secondary'}
                    className="text-sm px-4 py-1"
                >
                    {lead.upgrade_readiness_state === 'ready'
                        ? '✅ Ready for Upgrade'
                        : lead.upgrade_readiness_state === 'monitoring'
                            ? '📊 Monitoring'
                            : '⏳ Building Readiness'}
                </Badge>
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-muted-foreground text-center pt-2 border-t">
                Lead Qualification Platform for Malaysia Real Estate Agents
            </p>
        </div>
    );
}

function formatRM(amount: number): string {
    if (amount >= 1000000) {
        return `RM ${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
        return `RM ${(amount / 1000).toFixed(0)}K`;
    }
    return `RM ${amount.toLocaleString()}`;
}
