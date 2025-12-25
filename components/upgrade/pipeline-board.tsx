'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/animate-ui/components/radix/tabs';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    type Lead,
    type UpgradeStage,
    type LostReasonType,
    UPGRADE_STAGE_LABELS,
    UPGRADE_STAGE_ORDER,
    UPGRADE_READINESS_COLORS,
    UPGRADE_READINESS_LABELS,
    LOST_REASON_LABELS,
    FAMILY_ALIGNMENT_COLORS,
    FAMILY_ALIGNMENT_LABELS,
    type FamilyAlignmentStatus,
} from '@/lib/types';
import { changeUpgradeStage, markLeadAsLost } from '@/lib/actions';
import { formatRM } from '@/lib/qualification-engine';
import {
    Eye,
    ChevronRight,
    Clock,
    TrendingUp,
    CheckCircle,
    XCircle,
    Users,
    DollarSign,
    AlertTriangle,
    Target,
} from 'lucide-react';

interface PipelineBoardProps {
    clientsByStage: Record<UpgradeStage, Lead[]>;
}

export function PipelineBoard({ clientsByStage }: PipelineBoardProps) {
    // Calculate opportunity metrics
    const windowOpenClients = clientsByStage['window_open'] || [];
    const planningClients = clientsByStage['planning'] || [];
    const activeClients = [...windowOpenClients, ...planningClients];

    const totalOpportunityValue = activeClients.reduce((sum, client) => {
        return sum + (client.upgrade_budget_max || client.budget_max || 0);
    }, 0);

    // Estimate commission (3% for sell + buy double transaction)
    const estimatedCommission = totalOpportunityValue * 0.03;

    // Count clients with family alignment issues
    const familyAlignmentIssues = activeClients.filter(
        c => c.family_alignment_status === 'family_objection' || c.family_alignment_status === 'spouse_pending'
    ).length;

    // Get stage counts for tab badges
    const getStageCounts = (stage: UpgradeStage) => (clientsByStage[stage] || []).length;

    return (
        <div className="space-y-6">
            {/* Opportunity Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Target className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{windowOpenClients.length + planningClients.length}</div>
                                <div className="text-xs text-muted-foreground">Active Opportunities</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                                <DollarSign className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{formatRM(totalOpportunityValue)}</div>
                                <div className="text-xs text-muted-foreground">Pipeline Value</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                                <TrendingUp className="w-5 h-5 text-chart-4" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{formatRM(estimatedCommission)}</div>
                                <div className="text-xs text-muted-foreground">Est. Commission</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {familyAlignmentIssues > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                    <Users className="w-5 h-5 text-destructive" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-destructive">{familyAlignmentIssues}</div>
                                    <div className="text-xs text-muted-foreground">Family Alignment Issues</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Pipeline Tabs - Animated */}
            <Tabs defaultValue="monitoring" className="w-full">
                <TabsList className="w-full h-auto p-1">
                    {UPGRADE_STAGE_ORDER.map((stage) => (
                        <TabsTrigger
                            key={stage}
                            value={stage}
                            className="flex items-center gap-2 px-4 py-2"
                        >
                            {getStageIcon(stage)}
                            <span className="hidden sm:inline">{UPGRADE_STAGE_LABELS[stage]}</span>
                            <span className="sm:hidden">{getShortStageLabel(stage)}</span>
                            <Badge
                                variant="secondary"
                                className={`ml-1 text-xs h-5 px-1.5 ${getTabBadgeColor(stage)}`}
                            >
                                {getStageCounts(stage)}
                            </Badge>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {UPGRADE_STAGE_ORDER.map((stage) => (
                    <TabsContent key={stage} value={stage} className="mt-4">
                        <PipelineStageContent
                            stage={stage}
                            clients={clientsByStage[stage] || []}
                        />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

// Helper functions for tabs
function getShortStageLabel(stage: UpgradeStage): string {
    switch (stage) {
        case 'monitoring': return 'Monitor';
        case 'window_open': return 'Open';
        case 'planning': return 'Plan';
        case 'executed': return 'Done';
        case 'lost': return 'Lost';
    }
}

function getTabBadgeColor(stage: UpgradeStage): string {
    switch (stage) {
        case 'monitoring': return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200';
        case 'window_open': return 'bg-primary/20 text-primary';
        case 'planning': return 'bg-amber-200 dark:bg-amber-900 text-amber-700 dark:text-amber-200';
        case 'executed': return 'bg-emerald-200 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200';
        case 'lost': return 'bg-red-200 dark:bg-red-900 text-red-700 dark:text-red-200';
    }
}

interface PipelineStageContentProps {
    stage: UpgradeStage;
    clients: Lead[];
}

function PipelineStageContent({ stage, clients }: PipelineStageContentProps) {
    const stageColor = getStageColumnColor(stage);

    if (clients.length === 0) {
        return (
            <Card className={`${stageColor} border-dashed`}>
                <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        {getStageIcon(stage)}
                        <p className="text-sm">No clients in {UPGRADE_STAGE_LABELS[stage]}</p>
                        <p className="text-xs">Clients will appear here when moved to this stage</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`rounded-lg border ${stageColor} p-4`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {clients.map((client) => (
                    <PipelineClientCard key={client.id} client={client} currentStage={stage} />
                ))}
            </div>
        </div>
    );
}



interface PipelineClientCardProps {
    client: Lead;
    currentStage: UpgradeStage;
}

function PipelineClientCard({ client, currentStage }: PipelineClientCardProps) {
    const [isMoving, setIsMoving] = useState(false);
    const [showLostDialog, setShowLostDialog] = useState(false);
    const [lostReason, setLostReason] = useState<LostReasonType | ''>('');
    const [lostNotes, setLostNotes] = useState('');

    const daysInStage = client.upgrade_stage_changed_at
        ? Math.floor(
            (Date.now() - new Date(client.upgrade_stage_changed_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        : 0;

    // Stale opportunity warning (>30 days in window_open or planning)
    const isStale = (currentStage === 'window_open' || currentStage === 'planning') && daysInStage > 30;

    const handleMoveToNext = async () => {
        const currentIndex = UPGRADE_STAGE_ORDER.indexOf(currentStage);
        const nextStage = UPGRADE_STAGE_ORDER[currentIndex + 1];

        if (!nextStage || nextStage === 'lost') return;

        setIsMoving(true);
        await changeUpgradeStage(client.id, nextStage, 'Moved via pipeline');
        setIsMoving(false);
    };

    const handleMarkAsLost = async () => {
        if (!lostReason) return;

        setIsMoving(true);
        await markLeadAsLost(client.id, lostReason, lostNotes);
        setShowLostDialog(false);
        setIsMoving(false);
    };

    const canMoveNext = currentStage !== 'executed' && currentStage !== 'lost';
    const canMarkLost = currentStage !== 'executed' && currentStage !== 'lost';
    const readinessState = client.upgrade_readiness_state || 'not_ready';
    const familyStatus = client.family_alignment_status as FamilyAlignmentStatus | undefined;

    return (
        <>
            <Card className={`cursor-pointer hover:shadow-md transition-shadow ${isStale ? 'border-amber-300 dark:border-amber-700' : ''}`}>
                <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                            <Link
                                href={`/protected/leads/${client.id}`}
                                className="font-medium text-sm hover:underline truncate block"
                            >
                                {client.name}
                            </Link>
                            <p className="text-xs text-muted-foreground truncate">
                                {client.phone}
                            </p>
                        </div>
                        <Badge className={`text-xs ${UPGRADE_READINESS_COLORS[readinessState]}`}>
                            {client.upgrade_readiness_score || 0}
                        </Badge>
                    </div>

                    {/* Family Alignment Indicator */}
                    {familyStatus && familyStatus !== 'not_discussed' && (
                        <div className="mb-2">
                            <Badge variant="outline" className={`text-xs ${FAMILY_ALIGNMENT_COLORS[familyStatus]}`}>
                                <Users className="w-3 h-3 mr-1" />
                                {FAMILY_ALIGNMENT_LABELS[familyStatus]}
                            </Badge>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                            <Clock className={`w-3 h-3 ${isStale ? 'text-amber-500' : ''}`} />
                            <span className={isStale ? 'text-amber-500 font-medium' : ''}>{daysInStage}d</span>
                            {isStale && <AlertTriangle className="w-3 h-3 text-amber-500 ml-1" />}
                        </div>
                        <span className={UPGRADE_READINESS_COLORS[readinessState]}>
                            {UPGRADE_READINESS_LABELS[readinessState]}
                        </span>
                    </div>

                    {/* Opportunity Value */}
                    {(client.upgrade_budget_max || client.budget_max) && (
                        <div className="text-xs text-muted-foreground mb-2">
                            <DollarSign className="w-3 h-3 inline" />
                            {formatRM(client.upgrade_budget_max || client.budget_max)}
                        </div>
                    )}

                    <div className="flex gap-1">
                        <Button asChild size="sm" variant="ghost" className="flex-1 h-7 text-xs">
                            <Link href={`/protected/leads/${client.id}`}>
                                <Eye className="w-3 h-3 mr-1" />
                                View
                            </Link>
                        </Button>
                        {canMoveNext && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-7 text-xs"
                                onClick={handleMoveToNext}
                                disabled={isMoving}
                            >
                                <ChevronRight className="w-3 h-3 mr-1" />
                                Next
                            </Button>
                        )}
                        {canMarkLost && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-destructive hover:text-destructive"
                                onClick={() => setShowLostDialog(true)}
                            >
                                <XCircle className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Lost Reason Dialog */}
            <Dialog open={showLostDialog} onOpenChange={setShowLostDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark as Lost</DialogTitle>
                        <DialogDescription>
                            Understanding why deals don&apos;t close helps improve your upgrade process.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Why did this upgrade opportunity not proceed? *</Label>
                            <Select value={lostReason} onValueChange={(v) => setLostReason(v as LostReasonType)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(LOST_REASON_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lostNotes">Additional Notes</Label>
                            <Textarea
                                id="lostNotes"
                                value={lostNotes}
                                onChange={(e) => setLostNotes(e.target.value)}
                                placeholder="What specific factors contributed to this outcome?"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLostDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleMarkAsLost}
                            disabled={!lostReason || isMoving}
                        >
                            {isMoving ? 'Saving...' : 'Mark as Lost'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function getStageIcon(stage: UpgradeStage) {
    const iconClass = 'w-4 h-4';
    switch (stage) {
        case 'monitoring':
            return <Eye className={`${iconClass} text-muted-foreground`} />;
        case 'window_open':
            return <TrendingUp className={`${iconClass} text-primary`} />;
        case 'planning':
            return <Clock className={`${iconClass} text-chart-3`} />;
        case 'executed':
            return <CheckCircle className={`${iconClass} text-success`} />;
        case 'lost':
            return <XCircle className={`${iconClass} text-destructive`} />;
    }
}

function getStageColumnColor(stage: UpgradeStage) {
    switch (stage) {
        case 'monitoring':
            return 'bg-muted/50 border-border';
        case 'window_open':
            return 'bg-primary/5 border-primary/20';
        case 'planning':
            return 'bg-chart-3/5 border-chart-3/20';
        case 'executed':
            return 'bg-success/5 border-success/20';
        case 'lost':
            return 'bg-destructive/5 border-destructive/20';
    }
}
