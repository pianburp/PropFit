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
    type UpgradeReadinessState,
    UPGRADE_READINESS_LABELS,
    UPGRADE_READINESS_COLORS,
} from '@/lib/types';
import {
    getReadinessStateExplanation,
    getReadinessNextSteps,
} from '@/lib/upgrade-readiness';
import {
    TrendingUp,
    Home,
    CreditCard,
    Briefcase,
    Shield,
    CheckCircle,
    AlertCircle,
    XCircle,
} from 'lucide-react';

interface ReadinessScoreCardProps {
    lead: Lead;
}

export function ReadinessScoreCard({ lead }: ReadinessScoreCardProps) {
    const score = lead.upgrade_readiness_score || 0;
    const state = (lead.upgrade_readiness_state || 'not_ready') as UpgradeReadinessState;
    const breakdown = lead.upgrade_readiness_breakdown;

    const stateExplanation = getReadinessStateExplanation(state);
    const nextSteps = breakdown ? getReadinessNextSteps(state, breakdown) : [];

    const stateIcon = getStateIcon(state);
    const progressColor = getProgressColor(state);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            {stateIcon}
                            Upgrade Readiness
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {stateExplanation}
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{score}</div>
                        <Badge className={UPGRADE_READINESS_COLORS[state]}>
                            {UPGRADE_READINESS_LABELS[state]}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Score Progress Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0</span>
                        <span>40 (Monitoring)</span>
                        <span>70 (Ready)</span>
                        <span>100</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${progressColor}`}
                            style={{ width: `${score}%` }}
                        />
                    </div>
                </div>

                {/* Score Breakdown */}
                {breakdown && (
                    <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-medium text-sm">Score Breakdown</h4>

                        <ScoreFactor
                            icon={<TrendingUp className="w-4 h-4" />}
                            label="Income Growth"
                            score={breakdown.income_growth_score}
                            maxScore={30}
                            reason={breakdown.income_growth_reason}
                        />

                        <ScoreFactor
                            icon={<Home className="w-4 h-4" />}
                            label="Equity Position"
                            score={breakdown.equity_score}
                            maxScore={25}
                            reason={breakdown.equity_reason}
                        />

                        <ScoreFactor
                            icon={<CreditCard className="w-4 h-4" />}
                            label="Debt Level"
                            score={breakdown.debt_score}
                            maxScore={20}
                            reason={breakdown.debt_reason}
                        />

                        <ScoreFactor
                            icon={<Briefcase className="w-4 h-4" />}
                            label="Employment Stability"
                            score={breakdown.employment_score}
                            maxScore={15}
                            reason={breakdown.employment_reason}
                        />

                        <ScoreFactor
                            icon={<Shield className="w-4 h-4" />}
                            label="Credit History"
                            score={breakdown.rejection_score}
                            maxScore={10}
                            reason={breakdown.rejection_reason}
                        />
                    </div>
                )}

                {/* Next Steps */}
                {nextSteps.length > 0 && (
                    <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-medium text-sm">Recommended Actions</h4>
                        <ul className="space-y-1">
                            {nextSteps.map((step, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface ScoreFactorProps {
    icon: React.ReactNode;
    label: string;
    score: number;
    maxScore: number;
    reason: string;
}

function ScoreFactor({ icon, label, score, maxScore, reason }: ScoreFactorProps) {
    const percentage = (score / maxScore) * 100;
    const color = percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    {icon}
                    <span>{label}</span>
                </div>
                <span className="font-medium">
                    {score}/{maxScore}
                </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                    className={`h-full ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-xs text-muted-foreground">{reason}</p>
        </div>
    );
}

function getStateIcon(state: UpgradeReadinessState) {
    const iconClass = 'w-5 h-5';
    switch (state) {
        case 'ready':
            return <CheckCircle className={`${iconClass} text-green-500`} />;
        case 'monitoring':
            return <AlertCircle className={`${iconClass} text-amber-500`} />;
        case 'not_ready':
            return <XCircle className={`${iconClass} text-red-500`} />;
    }
}

function getProgressColor(state: UpgradeReadinessState) {
    switch (state) {
        case 'ready':
            return 'bg-green-500';
        case 'monitoring':
            return 'bg-amber-500';
        case 'not_ready':
            return 'bg-red-500';
    }
}
