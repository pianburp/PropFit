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
    CardFooter,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    calculateAffordability,
    calculateEquity,
    CALCULATOR_CONFIG,
    formatRMFull,
    type AffordabilityResult,
    type EquityResult,
} from '@/lib/affordability-calculator';
import {
    Calculator,
    Home,
    TrendingUp,
    AlertTriangle,
    Info,
} from 'lucide-react';

interface AffordabilityCalculatorProps {
    initialIncome?: number;
    initialPropertyValue?: number;
    initialLoanBalance?: number;
}

export function AffordabilityCalculator({
    initialIncome,
    initialPropertyValue,
    initialLoanBalance,
}: AffordabilityCalculatorProps) {
    // Inputs
    const [monthlyIncome, setMonthlyIncome] = useState(initialIncome?.toString() || '');
    const [existingCommitments, setExistingCommitments] = useState('');
    const [currentAge, setCurrentAge] = useState('35');
    const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(true);

    // Equity inputs
    const [propertyValue, setPropertyValue] = useState(initialPropertyValue?.toString() || '');
    const [loanBalance, setLoanBalance] = useState(initialLoanBalance?.toString() || '');

    // Results
    const [affordabilityResult, setAffordabilityResult] = useState<AffordabilityResult | null>(null);
    const [equityResult, setEquityResult] = useState<EquityResult | null>(null);
    const [showResults, setShowResults] = useState(false);

    const handleCalculate = () => {
        const income = parseInt(monthlyIncome) || 0;
        const commitments = parseInt(existingCommitments) || 0;
        const age = parseInt(currentAge) || 35;
        const propValue = parseInt(propertyValue) || 0;
        const loan = parseInt(loanBalance) || 0;

        if (income > 0) {
            const affordability = calculateAffordability({
                monthlyNetIncome: income,
                existingMonthlyCommitments: commitments,
                currentAge: age,
                isFirstTimeBuyer,
                interestRateProfile: 'conservative', // Always conservative
            });
            setAffordabilityResult(affordability);
        }

        if (propValue > 0) {
            const equity = calculateEquity({
                currentPropertyValue: propValue,
                outstandingLoanBalance: loan,
                includeSellingCosts: true,
            });
            setEquityResult(equity);
        }

        setShowResults(true);
    };

    const interestRate = CALCULATOR_CONFIG.INTEREST_RATES.conservative;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Affordability & Equity Calculator
                </CardTitle>
                <CardDescription>
                    Conservative estimates for upgrade planning (Malaysia context)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Affordability Inputs */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Affordability Calculation
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="income">Monthly Net Income (RM)</Label>
                            <Input
                                id="income"
                                type="number"
                                value={monthlyIncome}
                                onChange={(e) => setMonthlyIncome(e.target.value)}
                                placeholder="e.g., 8000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="commitments">Existing Monthly Commitments (RM)</Label>
                            <Input
                                id="commitments"
                                type="number"
                                value={existingCommitments}
                                onChange={(e) => setExistingCommitments(e.target.value)}
                                placeholder="e.g., 1500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age">Current Age</Label>
                            <Input
                                id="age"
                                type="number"
                                value={currentAge}
                                onChange={(e) => setCurrentAge(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 flex items-end">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="firstTime"
                                    checked={isFirstTimeBuyer}
                                    onCheckedChange={(checked) => setIsFirstTimeBuyer(checked as boolean)}
                                />
                                <Label htmlFor="firstTime">First-time buyer (10% downpayment)</Label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Equity Inputs */}
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Equity Calculation (if selling current property)
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="propertyValue">Current Property Value (RM)</Label>
                            <Input
                                id="propertyValue"
                                type="number"
                                value={propertyValue}
                                onChange={(e) => setPropertyValue(e.target.value)}
                                placeholder="e.g., 500000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="loanBalance">Outstanding Loan Balance (RM)</Label>
                            <Input
                                id="loanBalance"
                                type="number"
                                value={loanBalance}
                                onChange={(e) => setLoanBalance(e.target.value)}
                                placeholder="e.g., 350000"
                            />
                        </div>
                    </div>
                </div>

                {/* Assumptions Notice */}
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium">Conservative Assumptions Used:</p>
                            <ul className="mt-1 text-xs space-y-0.5">
                                <li>• Interest rate: {(interestRate.rate * 100).toFixed(1)}% p.a. ({interestRate.description})</li>
                                <li>• Max DSR: {(CALCULATOR_CONFIG.MAX_DSR_RATIO * 100).toFixed(0)}% (Bank Negara guideline)</li>
                                <li>• Equity buffer: {(CALCULATOR_CONFIG.EQUITY_BUFFER_PERCENT * 100).toFixed(0)}% held back for safety</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <Button onClick={handleCalculate} className="w-full">
                    Calculate
                </Button>

                {/* Results */}
                {showResults && (
                    <div className="space-y-4 pt-4 border-t">
                        {affordabilityResult && (
                            <div className="space-y-3">
                                <h4 className="font-medium">Affordability Results</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-muted">
                                        <div className="text-xs text-muted-foreground">Conservative Property Range</div>
                                        <div className="text-lg font-bold text-green-600">
                                            {formatRMFull(affordabilityResult.conservativePropertyPrice)}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted">
                                        <div className="text-xs text-muted-foreground">Max Monthly Installment</div>
                                        <div className="text-lg font-bold">
                                            {formatRMFull(affordabilityResult.conservativeMonthlyInstallment)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Required Downpayment</span>
                                        <span>{formatRMFull(affordabilityResult.requiredDownpayment)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Stamp Duty (est.)</span>
                                        <span>{formatRMFull(affordabilityResult.stampDuty)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Legal Fees (est.)</span>
                                        <span>{formatRMFull(affordabilityResult.legalFees)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium pt-1 border-t">
                                        <span>Total Upfront Cost (est.)</span>
                                        <span>{formatRMFull(affordabilityResult.totalUpfrontCost)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {equityResult && (
                            <div className="space-y-3">
                                <h4 className="font-medium">Equity Results</h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-muted">
                                        <div className="text-xs text-muted-foreground">Gross Equity</div>
                                        <div className="text-lg font-bold">
                                            {formatRMFull(equityResult.grossEquity)} ({equityResult.grossEquityPercent.toFixed(0)}%)
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted">
                                        <div className="text-xs text-muted-foreground">Usable Equity (after buffer)</div>
                                        <div className="text-lg font-bold text-green-600">
                                            {formatRMFull(equityResult.usableEquity)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Selling Costs (est.)</span>
                                        <span>-{formatRMFull(equityResult.sellingCosts)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Safety Buffer (20%)</span>
                                        <span>-{formatRMFull(equityResult.safetyBuffer)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium pt-1 border-t">
                                        <span>Available for Downpayment</span>
                                        <span className="text-green-600">{formatRMFull(equityResult.availableForDownpayment)}</span>
                                    </div>
                                </div>

                                {equityResult.usableEquity > 0 && (
                                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                                        <p className="text-sm text-green-800">
                                            With this equity as downpayment (10%), client could afford a property up to{' '}
                                            <span className="font-bold">{formatRMFull(equityResult.affordableUpgradeProperty)}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <div className="w-full p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                        <p className="text-xs text-amber-800">
                            <span className="font-medium">Important:</span> This is an illustrative estimate only.
                            Actual loan approval depends on bank assessment, credit score, documentation, and
                            other eligibility criteria. This is NOT a loan approval.
                        </p>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
