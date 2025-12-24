'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    type Lead,
    type ConversationStep,
    type ConversationTimeline as ConversationTimelineType,
    CONVERSATION_STEP_LABELS,
    CONVERSATION_STEP_ORDER,
} from '@/lib/types';
import { updateConversationStep } from '@/lib/actions';
import {
    ListChecks,
    Check,
    Circle,
    ChevronDown,
    ChevronUp,
    Loader2,
    MessageSquare,
} from 'lucide-react';

interface ConversationTimelineProps {
    lead: Lead;
}

const DEFAULT_TIMELINE: ConversationTimelineType = {
    financial_validation: { completed: false },
    soft_discussion: { completed: false },
    family_alignment: { completed: false },
    property_matching: { completed: false },
    execution: { completed: false },
};

const STEP_DESCRIPTIONS: Record<ConversationStep, string> = {
    financial_validation: 'Confirm income, expenses, and current commitments are accurate and up-to-date.',
    soft_discussion: 'Have an initial conversation about upgrade possibilities without pressure.',
    family_alignment: 'Ensure spouse/family members are informed and aligned on the decision.',
    property_matching: 'Identify suitable properties within the calculated budget range.',
    execution: 'Proceed with property viewing, loan application, and purchase.',
};

export function ConversationTimeline({ lead }: ConversationTimelineProps) {
    const timeline = lead.conversation_timeline || DEFAULT_TIMELINE;
    const completedCount = CONVERSATION_STEP_ORDER.filter(
        step => timeline[step]?.completed
    ).length;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <ListChecks className="w-5 h-5" />
                            Conversation Timeline
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Advisory steps for upgrade discussions
                        </CardDescription>
                    </div>
                    <Badge variant="outline">
                        {completedCount}/{CONVERSATION_STEP_ORDER.length}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-1">
                {CONVERSATION_STEP_ORDER.map((step, index) => (
                    <TimelineStep
                        key={step}
                        leadId={lead.id}
                        step={step}
                        stepNumber={index + 1}
                        data={timeline[step] || { completed: false }}
                        isLast={index === CONVERSATION_STEP_ORDER.length - 1}
                    />
                ))}

                <p className="text-xs text-muted-foreground pt-3 border-t mt-4">
                    This timeline is advisory only. Steps are not mandatory and can be completed in any order based on client situation.
                </p>
            </CardContent>
        </Card>
    );
}

interface TimelineStepProps {
    leadId: string;
    step: ConversationStep;
    stepNumber: number;
    data: { completed: boolean; completed_at?: string; notes?: string };
    isLast: boolean;
}

function TimelineStep({ leadId, step, stepNumber, data, isLast }: TimelineStepProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [notes, setNotes] = useState(data.notes || '');
    const [isLoading, setIsLoading] = useState(false);
    const [localCompleted, setLocalCompleted] = useState(data.completed);

    const handleToggleComplete = async () => {
        setIsLoading(true);
        try {
            const newCompleted = !localCompleted;
            const result = await updateConversationStep(leadId, step, newCompleted, notes);
            if (result.success) {
                setLocalCompleted(newCompleted);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        setIsLoading(true);
        try {
            await updateConversationStep(leadId, step, localCompleted, notes);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            {/* Timeline line */}
            {!isLast && (
                <div
                    className={`absolute left-4 top-10 w-0.5 h-[calc(100%-20px)] ${localCompleted ? 'bg-success' : 'bg-muted'
                        }`}
                />
            )}

            <div className={`flex items-start gap-3 p-2 rounded-lg ${isExpanded ? 'bg-muted/50' : ''}`}>
                {/* Step indicator */}
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${localCompleted
                            ? 'bg-success text-success-foreground'
                            : 'bg-muted text-muted-foreground border'
                        }`}
                >
                    {localCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${localCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                {CONVERSATION_STEP_LABELS[step]}
                            </span>
                            {data.notes && <MessageSquare className="w-3 h-3 text-muted-foreground" />}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-6 w-6 p-0"
                        >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5">
                        {STEP_DESCRIPTIONS[step]}
                    </p>

                    {data.completed_at && (
                        <p className="text-xs text-success mt-1">
                            Completed: {new Date(data.completed_at).toLocaleDateString('en-MY', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </p>
                    )}

                    {isExpanded && (
                        <div className="mt-3 space-y-3">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`step-${step}`}
                                    checked={localCompleted}
                                    onCheckedChange={handleToggleComplete}
                                    disabled={isLoading}
                                />
                                <label
                                    htmlFor={`step-${step}`}
                                    className="text-sm cursor-pointer"
                                >
                                    Mark as completed
                                </label>
                                {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Notes (optional):
                                </label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add notes about this step..."
                                    rows={2}
                                    className="text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSaveNotes}
                                    disabled={isLoading || notes === (data.notes || '')}
                                >
                                    Save Notes
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
