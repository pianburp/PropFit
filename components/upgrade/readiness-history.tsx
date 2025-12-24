'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Lead, type LeadEvent, UPGRADE_READINESS_LABELS } from '@/lib/types';
import {
    History,
    TrendingUp,
    Home,
    CreditCard,
    RefreshCw,
    Circle,
} from 'lucide-react';

interface ReadinessHistoryProps {
    lead: Lead;
    events: LeadEvent[];
}

export function ReadinessHistory({ lead, events }: ReadinessHistoryProps) {
    // Filter events relevant to readiness tracking
    const relevantEvents = events.filter(event =>
        event.event_type === 'income_updated' ||
        event.event_type === 'financial_snapshot_updated' ||
        event.event_type === 'qualification_recalculated' ||
        event.event_type === 'upgrade_stage_changed'
    );

    // Sort by date descending (most recent first)
    const sortedEvents = [...relevantEvents].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Upgrade Readiness History
                </CardTitle>
                <CardDescription>
                    Timeline of financial changes and readiness states
                </CardDescription>
            </CardHeader>
            <CardContent>
                {sortedEvents.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">
                        <p>No readiness history recorded yet.</p>
                        <p className="mt-1 text-xs">
                            History will appear as financial data is updated.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {sortedEvents.slice(0, 10).map((event, index) => (
                            <HistoryItem
                                key={event.id}
                                event={event}
                                isLast={index === sortedEvents.length - 1 || index === 9}
                            />
                        ))}
                        {sortedEvents.length > 10 && (
                            <p className="text-xs text-muted-foreground text-center pt-2">
                                Showing 10 of {sortedEvents.length} events
                            </p>
                        )}
                    </div>
                )}

                <p className="text-xs text-muted-foreground pt-3 border-t mt-4">
                    This history is read-only and maintained for trust-building and auditability.
                </p>
            </CardContent>
        </Card>
    );
}

interface HistoryItemProps {
    event: LeadEvent;
    isLast: boolean;
}

function HistoryItem({ event, isLast }: HistoryItemProps) {
    const { icon, title, description, badge } = parseEvent(event);
    const date = new Date(event.created_at);

    return (
        <div className="relative flex gap-3 pb-4">
            {/* Timeline line */}
            {!isLast && (
                <div className="absolute left-3.5 top-8 w-0.5 h-[calc(100%-16px)] bg-muted" />
            )}

            {/* Icon */}
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 z-10">
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <p className="text-sm font-medium">{title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {badge && (
                            <Badge variant="outline" className="text-xs">
                                {badge}
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {date.toLocaleDateString('en-MY', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </span>
                    </div>
                </div>

                {event.notes && (
                    <p className="text-xs bg-muted/50 rounded px-2 py-1 mt-2">
                        {event.notes}
                    </p>
                )}
            </div>
        </div>
    );
}

function parseEvent(event: LeadEvent): {
    icon: React.ReactNode;
    title: string;
    description: string;
    badge?: string;
} {
    const data = event.event_data as Record<string, unknown>;

    switch (event.event_type) {
        case 'income_updated':
            const oldIncome = data.old_income as number | undefined;
            const newIncome = data.new_income as number | undefined;
            const incomeChange = oldIncome && newIncome
                ? ((newIncome - oldIncome) / oldIncome * 100).toFixed(1)
                : null;

            return {
                icon: <TrendingUp className="w-4 h-4 text-success" />,
                title: 'Income Updated',
                description: newIncome
                    ? `Income recorded as RM ${newIncome.toLocaleString()}${incomeChange ? ` (${Number(incomeChange) > 0 ? '+' : ''}${incomeChange}%)` : ''}`
                    : 'Income data updated',
                badge: incomeChange && Number(incomeChange) > 0 ? `+${incomeChange}%` : undefined,
            };

        case 'financial_snapshot_updated':
            const updates: string[] = [];
            if (data.income_updated) updates.push('income');
            if (data.property_value_updated) updates.push('property value');
            if (data.loan_balance_updated) updates.push('loan balance');

            return {
                icon: <RefreshCw className="w-4 h-4 text-primary" />,
                title: 'Financial Snapshot Updated',
                description: updates.length > 0
                    ? `Updated: ${updates.join(', ')}`
                    : 'Financial data refreshed',
            };

        case 'qualification_recalculated':
            const newScore = data.new_score as number | undefined;
            const newState = data.new_state as string | undefined;

            return {
                icon: <CreditCard className="w-4 h-4 text-primary" />,
                title: 'Readiness Recalculated',
                description: newScore
                    ? `Score: ${newScore}/100`
                    : 'Qualification status updated',
                badge: newState ? UPGRADE_READINESS_LABELS[newState as keyof typeof UPGRADE_READINESS_LABELS] : undefined,
            };

        case 'upgrade_stage_changed':
            const fromStage = data.from_stage as string | undefined;
            const toStage = data.to_stage as string | undefined;

            return {
                icon: <Circle className="w-4 h-4 text-chart-3" />,
                title: 'Stage Changed',
                description: fromStage && toStage
                    ? `${formatStage(fromStage)} → ${formatStage(toStage)}`
                    : 'Pipeline stage updated',
            };

        default:
            return {
                icon: <Circle className="w-4 h-4 text-muted-foreground" />,
                title: formatEventType(event.event_type),
                description: 'Event recorded',
            };
    }
}

function formatEventType(type: string): string {
    return type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatStage(stage: string): string {
    const labels: Record<string, string> = {
        monitoring: 'Monitoring',
        window_open: 'Window Open',
        planning: 'Planning',
        executed: 'Executed',
        lost: 'Lost',
    };
    return labels[stage] || stage;
}
