'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Lead } from '@/lib/types';
import {
    generateWhyNowJustification,
    type WhyNowJustification,
    type JustificationPoint,
} from '@/lib/why-now-generator';
import {
    TrendingUp,
    Home,
    CheckCircle,
    Info,
    Calendar,
} from 'lucide-react';

interface WhyNowPanelProps {
    lead: Lead;
}

export function WhyNowPanel({ lead }: WhyNowPanelProps) {
    const justification = generateWhyNowJustification(lead);
    const hasData = justification.summary.length > 0;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            Why Now?
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Factual summary of upgrade indicators
                        </CardDescription>
                    </div>
                    {hasData && (
                        <Badge variant="outline" className="text-xs">
                            {justification.summary.length} indicator{justification.summary.length !== 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!hasData ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                        <p>Insufficient data for upgrade justification.</p>
                        <p className="mt-1 text-xs">
                            Add income history, property value, or loan balance to generate justification points.
                        </p>
                    </div>
                ) : (
                    <>
                        {justification.incomeGrowth && (
                            <JustificationCard
                                point={justification.incomeGrowth}
                                icon={<TrendingUp className="w-4 h-4 text-green-600" />}
                            />
                        )}

                        {justification.equityPosition && (
                            <JustificationCard
                                point={justification.equityPosition}
                                icon={<Home className="w-4 h-4 text-blue-600" />}
                            />
                        )}

                        {justification.affordabilityThreshold && (
                            <JustificationCard
                                point={justification.affordabilityThreshold}
                                icon={<CheckCircle className="w-4 h-4 text-primary" />}
                            />
                        )}
                    </>
                )}

                {/* Assumptions Notice */}
                <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                        <strong>Assumptions:</strong> All calculations use conservative estimates.
                        Interest rate: 5.8%. DSR limit: 70% (BNM guideline). Equity buffer: 20%.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

interface JustificationCardProps {
    point: JustificationPoint;
    icon: React.ReactNode;
}

function JustificationCard({ point, icon }: JustificationCardProps) {
    return (
        <div className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
                {icon}
                <span className="font-medium text-sm">{point.title}</span>
            </div>
            <p className="text-sm">{point.factualStatement}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{point.dataSource}</span>
            </div>
        </div>
    );
}
