'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    type Lead,
    type LifeMilestoneType,
    LIFE_MILESTONE_LABELS,
} from '@/lib/types';
import { updateFinancialSnapshot } from '@/lib/actions';
import {
    DollarSign,
    Home,
    CreditCard,
    Calendar,
    TrendingUp,
    Check,
    Loader2,
} from 'lucide-react';

interface FinancialSnapshotProps {
    lead: Lead;
}

export function FinancialSnapshot({ lead }: FinancialSnapshotProps) {
    const [income, setIncome] = useState(lead.current_income?.toString() || '');
    const [propertyValue, setPropertyValue] = useState(
        lead.current_property_value?.toString() || ''
    );
    const [loanBalance, setLoanBalance] = useState(
        lead.outstanding_loan_balance?.toString() || ''
    );
    const [milestoneType, setMilestoneType] = useState<LifeMilestoneType | ''>('');
    const [milestoneNotes, setMilestoneNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        await updateFinancialSnapshot({
            leadId: lead.id,
            currentIncome: income ? parseInt(income) : undefined,
            currentPropertyValue: propertyValue ? parseInt(propertyValue) : undefined,
            outstandingLoanBalance: loanBalance ? parseInt(loanBalance) : undefined,
            lifeMilestone: milestoneType
                ? {
                    type: milestoneType,
                    date: new Date().toISOString().split('T')[0],
                    notes: milestoneNotes || undefined,
                }
                : undefined,
        });

        setIsSaving(false);
        setSaveSuccess(true);
        setMilestoneType('');
        setMilestoneNotes('');

        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Calculate equity if both values exist
    const equity =
        lead.current_property_value && lead.outstanding_loan_balance !== undefined
            ? lead.current_property_value - (lead.outstanding_loan_balance || 0)
            : null;

    const equityPercent =
        equity !== null && lead.current_property_value
            ? ((equity / lead.current_property_value) * 100).toFixed(0)
            : null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial Snapshot
                </CardTitle>
                <CardDescription>
                    Track income, property, and loan for upgrade readiness
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Income Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="income" className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Current Monthly Income (RM)
                        </Label>
                        <span className="text-xs text-muted-foreground">
                            Last updated: {formatDate(lead.income_last_updated)}
                        </span>
                    </div>
                    <Input
                        id="income"
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        placeholder="e.g., 8000"
                    />
                    {lead.income_history && lead.income_history.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {lead.income_history.length} income update(s) recorded
                        </p>
                    )}
                </div>

                {/* Property Value Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="propertyValue" className="flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Current Property Value (RM)
                        </Label>
                        <span className="text-xs text-muted-foreground">
                            Last updated: {formatDate(lead.property_value_last_updated)}
                        </span>
                    </div>
                    <Input
                        id="propertyValue"
                        type="number"
                        value={propertyValue}
                        onChange={(e) => setPropertyValue(e.target.value)}
                        placeholder="e.g., 500000"
                    />
                </div>

                {/* Loan Balance Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="loanBalance" className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Outstanding Loan Balance (RM)
                        </Label>
                        <span className="text-xs text-muted-foreground">
                            Last updated: {formatDate(lead.loan_balance_last_updated)}
                        </span>
                    </div>
                    <Input
                        id="loanBalance"
                        type="number"
                        value={loanBalance}
                        onChange={(e) => setLoanBalance(e.target.value)}
                        placeholder="e.g., 350000"
                    />
                </div>

                {/* Equity Display */}
                {equity !== null && (
                    <div className="p-3 rounded-lg bg-muted">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Estimated Equity</span>
                            <span
                                className={`font-bold ${equity >= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}
                            >
                                RM {equity.toLocaleString()} ({equityPercent}%)
                            </span>
                        </div>
                    </div>
                )}

                {/* Life Milestone Section */}
                <div className="space-y-2 pt-4 border-t">
                    <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Add Life Milestone
                    </Label>
                    <div className="flex gap-2">
                        <Select
                            value={milestoneType}
                            onValueChange={(v) => setMilestoneType(v as LifeMilestoneType)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(LIFE_MILESTONE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Notes (optional)"
                            value={milestoneNotes}
                            onChange={(e) => setMilestoneNotes(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                    {lead.life_milestones && lead.life_milestones.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                            {lead.life_milestones.length} milestone(s) recorded
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : saveSuccess ? (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            Saved!
                        </>
                    ) : (
                        'Update Financial Snapshot'
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
