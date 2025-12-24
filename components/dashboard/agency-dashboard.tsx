'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AgencyDashboardStats } from '@/lib/server/application/services';
import {
    UPGRADE_STAGE_LABELS,
    UPGRADE_READINESS_LABELS,
    UPGRADE_READINESS_COLORS,
    UPGRADE_STAGE_COLORS,
    type UpgradeStage,
    type UpgradeReadinessState,
} from '@/lib/types';
import {
    Users,
    TrendingUp,
    CheckCircle,
    Target,
    Calendar,
    ArrowRight,
} from 'lucide-react';

interface AgencyDashboardProps {
    stats: AgencyDashboardStats;
}

export function AgencyDashboard({ stats }: AgencyDashboardProps) {
    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Clients"
                    value={stats.totalClients}
                    icon={<Users className="w-5 h-5" />}
                    color="bg-primary/10 text-primary"
                />
                <MetricCard
                    title="Ready for Upgrade"
                    value={stats.clientsByReadinessState['ready'] || 0}
                    icon={<Target className="w-5 h-5" />}
                    color="bg-success/10 text-success"
                />
                <MetricCard
                    title="Executed This Month"
                    value={stats.upgradesExecutedThisMonth}
                    icon={<CheckCircle className="w-5 h-5" />}
                    color="bg-chart-4/10 text-chart-4"
                />
                <MetricCard
                    title="Executed This Year"
                    value={stats.upgradesExecutedThisYear}
                    icon={<Calendar className="w-5 h-5" />}
                    color="bg-chart-3/10 text-chart-3"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Readiness Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Clients by Readiness State
                        </CardTitle>
                        <CardDescription>
                            How many clients are ready for upgrade conversations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(['ready', 'monitoring', 'not_ready'] as UpgradeReadinessState[]).map((state) => {
                                const count = stats.clientsByReadinessState[state] || 0;
                                const percentage = stats.totalClients > 0
                                    ? (count / stats.totalClients) * 100
                                    : 0;

                                return (
                                    <div key={state} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <Badge className={UPGRADE_READINESS_COLORS[state]}>
                                                {UPGRADE_READINESS_LABELS[state]}
                                            </Badge>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${state === 'ready' ? 'bg-success' :
                                                        state === 'monitoring' ? 'bg-chart-3' : 'bg-destructive'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Pipeline Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Clients by Pipeline Stage
                        </CardTitle>
                        <CardDescription>
                            Where clients are in the upgrade journey
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {(['monitoring', 'window_open', 'planning', 'executed', 'lost'] as UpgradeStage[]).map((stage) => {
                                const count = stats.clientsByUpgradeStage[stage] || 0;
                                const percentage = stats.totalClients > 0
                                    ? (count / stats.totalClients) * 100
                                    : 0;

                                return (
                                    <div key={stage} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <Badge className={UPGRADE_STAGE_COLORS[stage]}>
                                                {UPGRADE_STAGE_LABELS[stage]}
                                            </Badge>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${stage === 'executed' ? 'bg-success' :
                                                        stage === 'lost' ? 'bg-destructive' :
                                                            stage === 'planning' ? 'bg-chart-3' :
                                                                stage === 'window_open' ? 'bg-primary' : 'bg-muted-foreground'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Members (Admin only) */}
            {stats.isAdmin && stats.teamMembers.length > 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Team Members
                        </CardTitle>
                        <CardDescription>
                            Agents in your agency
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {stats.teamMembers.map((agent) => (
                                <div
                                    key={agent.id}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                                >
                                    <div>
                                        <div className="font-medium">{agent.full_name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {agent.role === 'admin' ? 'Admin' : 'Agent'}
                                        </div>
                                    </div>
                                    <Badge variant="secondary">
                                        {agent.subscription_status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href="/protected/pipeline">
                            View Pipeline
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/protected/leads?readiness=ready">
                            View Ready Clients
                            <Target className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function MetricCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
                    <div>
                        <div className="text-2xl font-bold">{value}</div>
                        <div className="text-xs text-muted-foreground">{title}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
