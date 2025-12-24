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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import {
    type Lead,
    type FallbackReason,
    type FallbackPlan,
    FALLBACK_REASON_LABELS,
} from '@/lib/types';
import { saveFallbackPlan } from '@/lib/actions';
import {
    CalendarClock,
    ChevronDown,
    ChevronUp,
    Save,
    Loader2,
    Check,
    RefreshCw,
} from 'lucide-react';

interface FallbackPlannerProps {
    lead: Lead;
}

export function FallbackPlanner({ lead }: FallbackPlannerProps) {
    const existingPlan = lead.fallback_plan;
    const [isOpen, setIsOpen] = useState(!!existingPlan);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const [reason, setReason] = useState<FallbackReason>(existingPlan?.reason || 'timing_not_right');
    const [reasonNotes, setReasonNotes] = useState(existingPlan?.reason_notes || '');
    const [nextReviewDate, setNextReviewDate] = useState(
        existingPlan?.next_review_date || getDefaultReviewDate()
    );
    const [advisoryNotes, setAdvisoryNotes] = useState(existingPlan?.advisory_notes || '');

    const handleSave = async () => {
        setIsLoading(true);
        setIsSaved(false);
        try {
            const result = await saveFallbackPlan(lead.id, {
                reason,
                reason_notes: reasonNotes || undefined,
                next_review_date: nextReviewDate,
                advisory_notes: advisoryNotes || undefined,
            });
            if (result.success) {
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                            <div className="text-left">
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarClock className="w-5 h-5" />
                                    If Not Upgrade
                                    {existingPlan && (
                                        <Badge variant="secondary" className="ml-2">
                                            Plan Saved
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Document reason and set next review date
                                </CardDescription>
                            </div>
                            {isOpen ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-4">
                        {/* Reason Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason upgrade not proceeding</Label>
                            <Select value={reason} onValueChange={(v) => setReason(v as FallbackReason)}>
                                <SelectTrigger id="reason">
                                    <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(FALLBACK_REASON_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reason Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="reason-notes">Additional details (optional)</Label>
                            <Textarea
                                id="reason-notes"
                                value={reasonNotes}
                                onChange={(e) => setReasonNotes(e.target.value)}
                                placeholder="Specific details about the reason..."
                                rows={2}
                            />
                        </div>

                        {/* Next Review Date */}
                        <div className="space-y-2">
                            <Label htmlFor="next-review">Next review date</Label>
                            <Input
                                id="next-review"
                                type="date"
                                value={nextReviewDate}
                                onChange={(e) => setNextReviewDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setNextReviewDate(getDateOffset(3))}
                                    className="text-xs"
                                >
                                    +3 months
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setNextReviewDate(getDateOffset(6))}
                                    className="text-xs"
                                >
                                    +6 months
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setNextReviewDate(getDateOffset(12))}
                                    className="text-xs"
                                >
                                    +1 year
                                </Button>
                            </div>
                        </div>

                        {/* Advisory Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="advisory-notes">Advisory notes for future review</Label>
                            <Textarea
                                id="advisory-notes"
                                value={advisoryNotes}
                                onChange={(e) => setAdvisoryNotes(e.target.value)}
                                placeholder="Notes to reference when reviewing this client in the future..."
                                rows={3}
                            />
                        </div>

                        {/* Save Button */}
                        <div className="flex items-center gap-3 pt-2">
                            <Button onClick={handleSave} disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : isSaved ? (
                                    <Check className="w-4 h-4 mr-2" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                {isSaved ? 'Saved!' : 'Save Plan'}
                            </Button>
                            {existingPlan && (
                                <span className="text-xs text-muted-foreground">
                                    Last saved: {new Date(existingPlan.created_at).toLocaleDateString('en-MY', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            )}
                        </div>

                        <p className="text-xs text-muted-foreground pt-2 border-t">
                            This plan is for internal reference only. No automated follow-ups will be sent to the client.
                        </p>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

function getDefaultReviewDate(): string {
    return getDateOffset(3);
}

function getDateOffset(months: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
}
