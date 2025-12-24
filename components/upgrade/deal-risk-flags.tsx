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
                    <div className="flex items-center gap-2 text-green-600 py-2">
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
            bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
            icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
            badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        },
        medium: {
            bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
            icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
            badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        },
        low: {
            bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
            icon: <Info className="w-4 h-4 text-blue-600" />,
            badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
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
