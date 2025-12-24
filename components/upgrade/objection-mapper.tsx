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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { type ObjectionCategory, OBJECTION_CATEGORY_LABELS } from '@/lib/types';
import {
    getAllObjectionCategories,
    formatForClipboard,
    type ObjectionExplanation,
} from '@/lib/objection-categories';
import {
    Users,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    Heart,
    UserCheck,
    Scale,
    Clock,
} from 'lucide-react';

export function ObjectionMapper() {
    const objections = getAllObjectionCategories();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Family & Spouse Objection Guide
                </CardTitle>
                <CardDescription>
                    Neutral, factual responses for common objections
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {objections.map((objection) => (
                    <ObjectionAccordion key={objection.category} objection={objection} />
                ))}

                <p className="text-xs text-muted-foreground pt-3 border-t mt-4">
                    These responses are for guidance only. Adapt to each situation.
                    Never promise loan approval or guaranteed returns.
                </p>
            </CardContent>
        </Card>
    );
}

interface ObjectionAccordionProps {
    objection: ObjectionExplanation;
}

function ObjectionAccordion({ objection }: ObjectionAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const text = formatForClipboard(objection);
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const icon = getObjectionIcon(objection.category);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-between h-auto py-3 px-4 hover:bg-muted"
                >
                    <div className="flex items-center gap-3">
                        {icon}
                        <span className="font-medium">{objection.title}</span>
                    </div>
                    {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="px-4 pb-4 space-y-3">
                    <p className="text-sm text-muted-foreground">{objection.description}</p>

                    <div className="space-y-2">
                        <h4 className="text-sm font-medium">Key Points:</h4>
                        <ul className="text-sm space-y-1">
                            {objection.keyPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Suggested Response:</h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-7 text-xs"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3 h-3 mr-1" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3 mr-1" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                        <p className="text-sm whitespace-pre-line">{objection.factualResponse}</p>
                    </div>

                    <div className="bg-chart-3/10 border border-chart-3/30 rounded-lg p-2">
                        <p className="text-xs text-chart-3">
                            ⚠️ {objection.disclaimer}
                        </p>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

function getObjectionIcon(category: ObjectionCategory) {
    const iconClass = 'w-4 h-4 text-muted-foreground';
    switch (category) {
        case 'spouse_concern':
            return <Heart className={iconClass} />;
        case 'parent_advice':
            return <UserCheck className={iconClass} />;
        case 'commitment_fear':
            return <Scale className={iconClass} />;
        case 'timing_uncertainty':
            return <Clock className={iconClass} />;
    }
}
