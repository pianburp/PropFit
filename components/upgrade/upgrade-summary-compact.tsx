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
} from 'lucide-react';

interface UpgradeSummaryCompactProps {
    lead: Lead;
}

export function UpgradeSummaryCompact({ lead }: UpgradeSummaryCompactProps) {
    const analysis = analyzeUpgrade({
        monthlyNetIncome: lead.current_income || (lead.monthly_income_min + lead.monthly_income_max) / 2,
        existingMonthlyCommitments:
            lead.existing_loan_commitment_percent
                ? (lead.current_income || 0) * (lead.existing_loan_commitment_percent / 100)
                : 0,
        currentAge: 35,
        currentPropertyValue: lead.current_property_value,
        outstandingLoanBalance: lead.outstanding_loan_balance,
        currentMonthlyInstallment: 0,
        isUpgradingFirstHome: lead.is_first_time_buyer === false,
        interestRateProfile: 'conservative',
    });

    const whyNowPoints = getCompactWhyNowSummary(lead);

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
                                {lead.current_property_value
                                    ? formatRM(lead.current_property_value)
                                    : '—'}
                            </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        <div className="text-center flex-1">
                            <p className="text-xs text-muted-foreground">Upgrade</p>
                            <p className="font-bold text-primary">
                                {formatRM(analysis.affordability.conservativePropertyPrice)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Commitment */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Monthly Commitment
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-center flex-1">
                            <p className="text-xs text-muted-foreground">Current</p>
                            <p className="font-bold">
                                {analysis.currentMonthlyCommitment > 0
                                    ? formatRM(analysis.currentMonthlyCommitment)
                                    : '—'}
                            </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        <div className="text-center flex-1">
                            <p className="text-xs text-muted-foreground">After Upgrade</p>
                            <p className="font-bold">
                                {formatRM(analysis.newMonthlyCommitment)}
                            </p>
                        </div>
                    </div>
                    {analysis.monthlyDifference !== 0 && analysis.currentMonthlyCommitment > 0 && (
                        <div className="mt-3 text-center">
                            <Badge
                                variant={analysis.monthlyDifference > 0 ? 'secondary' : 'default'}
                                className="text-sm"
                            >
                                {analysis.monthlyDifference > 0 ? '+' : ''}
                                {formatRM(analysis.monthlyDifference)}/month
                            </Badge>
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
                    {whyNowPoints.map((point, index) => (
                        <p key={index} className="text-sm">
                            {point}
                        </p>
                    ))}
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
                Estimates based on conservative assumptions. Actual approval subject to bank assessment.
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
