'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    type Lead,
    type UpgradeStage,
    UPGRADE_STAGE_LABELS,
    UPGRADE_STAGE_COLORS,
    UPGRADE_STAGE_ORDER,
    UPGRADE_READINESS_COLORS,
    UPGRADE_READINESS_LABELS,
} from '@/lib/types';
import { changeUpgradeStage } from '@/lib/actions';
import {
    Eye,
    ChevronRight,
    Clock,
    TrendingUp,
    CheckCircle,
    XCircle,
} from 'lucide-react';

interface PipelineBoardProps {
    clientsByStage: Record<UpgradeStage, Lead[]>;
}

export function PipelineBoard({ clientsByStage }: PipelineBoardProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {UPGRADE_STAGE_ORDER.map((stage) => (
                <PipelineColumn
                    key={stage}
                    stage={stage}
                    clients={clientsByStage[stage] || []}
                />
            ))}
        </div>
    );
}

interface PipelineColumnProps {
    stage: UpgradeStage;
    clients: Lead[];
}

function PipelineColumn({ stage, clients }: PipelineColumnProps) {
    const stageIcon = getStageIcon(stage);
    const stageColor = getStageColumnColor(stage);

    return (
        <div className={`rounded-lg border ${stageColor} min-h-[400px]`}>
            <div className="p-3 border-b bg-background/80 backdrop-blur sticky top-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {stageIcon}
                        <span className="font-medium text-sm">{UPGRADE_STAGE_LABELS[stage]}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {clients.length}
                    </Badge>
                </div>
            </div>
            <div className="p-2 space-y-2">
                {clients.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">
                        No clients
                    </p>
                ) : (
                    clients.map((client) => (
                        <PipelineClientCard key={client.id} client={client} currentStage={stage} />
                    ))
                )}
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

    const daysInStage = client.upgrade_stage_changed_at
        ? Math.floor(
            (Date.now() - new Date(client.upgrade_stage_changed_at).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        : 0;

    const handleMoveToNext = async () => {
        const currentIndex = UPGRADE_STAGE_ORDER.indexOf(currentStage);
        const nextStage = UPGRADE_STAGE_ORDER[currentIndex + 1];

        if (!nextStage || nextStage === 'lost') return;

        setIsMoving(true);
        await changeUpgradeStage(client.id, nextStage, 'Moved via pipeline');
        setIsMoving(false);
    };

    const canMoveNext = currentStage !== 'executed' && currentStage !== 'lost';
    const readinessState = client.upgrade_readiness_state || 'not_ready';

    return (
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
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

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{daysInStage}d</span>
                    </div>
                    <span className={UPGRADE_READINESS_COLORS[readinessState]}>
                        {UPGRADE_READINESS_LABELS[readinessState]}
                    </span>
                </div>

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
                </div>
            </CardContent>
        </Card>
    );
}

function getStageIcon(stage: UpgradeStage) {
    const iconClass = 'w-4 h-4';
    switch (stage) {
        case 'monitoring':
            return <Eye className={`${iconClass} text-slate-500`} />;
        case 'window_open':
            return <TrendingUp className={`${iconClass} text-blue-500`} />;
        case 'planning':
            return <Clock className={`${iconClass} text-amber-500`} />;
        case 'executed':
            return <CheckCircle className={`${iconClass} text-green-500`} />;
        case 'lost':
            return <XCircle className={`${iconClass} text-red-500`} />;
    }
}

function getStageColumnColor(stage: UpgradeStage) {
    switch (stage) {
        case 'monitoring':
            return 'bg-slate-50 border-slate-200';
        case 'window_open':
            return 'bg-blue-50 border-blue-200';
        case 'planning':
            return 'bg-amber-50 border-amber-200';
        case 'executed':
            return 'bg-green-50 border-green-200';
        case 'lost':
            return 'bg-red-50 border-red-200';
    }
}
