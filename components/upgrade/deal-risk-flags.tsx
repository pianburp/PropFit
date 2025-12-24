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
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { type Lead, type DealRiskFlag } from '@/lib/types';
import {
    analyzeDealRisks,
    getRiskSeverity,
    hasHighRisk,
} from '@/lib/deal-risk-analyzer';
import {
    ShieldAlert,
    AlertTriangle,
    AlertCircle,
    Info,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    Lock,
} from 'lucide-react';
import { useState } from 'react';

interface DealRiskFlagsProps {
    lead: Lead;
}

export function DealRiskFlags({ lead }: DealRiskFlagsProps) {
    const risks = analyzeDealRisks(lead);
    const hasRisks = risks.length > 0;
    const hasHigh = hasHighRisk(risks);

    return (
        <Card className={hasHigh ? 'border-amber-300 dark:border-amber-700' : ''}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5" />
                            Deal Risk Flags
                            <Badge variant="outline" className="ml-2 text-xs">
                                <Lock className="w-3 h-3 mr-1" />
                                Internal Only
                            </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Potential issues that may affect deal execution
                        </CardDescription>
                    </div>
                    {hasRisks && (
                        <Badge
                            variant={hasHigh ? 'destructive' : 'secondary'}
                        >
                            {risks.length} flag{risks.length !== 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {!hasRisks ? (
                    <div className="flex items-center gap-2 text-success py-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">No risk flags detected</span>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {risks.map((risk, index) => (
                            <RiskFlagItem key={risk.type} risk={risk} />
                        ))}
                    </div>
                )}

                <p className="text-xs text-muted-foreground pt-3 border-t mt-4">
                    Risk flags are based on deterministic rules, not predictions.
                    They highlight areas that may require attention or documentation.
                </p>
            </CardContent>
        </Card>
    );
}

interface RiskFlagItemProps {
    risk: DealRiskFlag;
}

function RiskFlagItem({ risk }: RiskFlagItemProps) {
    const [isOpen, setIsOpen] = useState(false);
    const severity = getRiskSeverity(risk);

    const severityStyles = {
        high: {
            bg: 'bg-destructive/10 border-destructive/30',
            icon: <AlertTriangle className="w-4 h-4 text-destructive" />,
            badge: 'bg-destructive/20 text-destructive',
        },
        medium: {
            bg: 'bg-chart-3/10 border-chart-3/30',
            icon: <AlertCircle className="w-4 h-4 text-chart-3" />,
            badge: 'bg-chart-3/20 text-chart-3',
        },
        low: {
            bg: 'bg-primary/10 border-primary/30',
            icon: <Info className="w-4 h-4 text-primary" />,
            badge: 'bg-primary/20 text-primary',
        },
    };

    const styles = severityStyles[severity];

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className={`border rounded-lg ${styles.bg}`}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full justify-between h-auto py-3 px-4 hover:bg-transparent"
                    >
                        <div className="flex items-center gap-3">
                            {styles.icon}
                            <span className="font-medium text-sm text-left">{risk.reason}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={styles.badge} variant="secondary">
                                {severity.charAt(0).toUpperCase() + severity.slice(1)}
                            </Badge>
                            {isOpen ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                        </div>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0">
                        <div className="bg-background rounded-lg p-3 text-sm whitespace-pre-line">
                            {risk.details}
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}
