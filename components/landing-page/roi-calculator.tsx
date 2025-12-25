"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, ArrowRight, TrendingUp } from "lucide-react";
import { formatRM, formatRMFull } from "@/lib/format";

export function ROICalculator() {
    const [currentValue, setCurrentValue] = useState(750000);
    const [targetValue, setTargetValue] = useState(950000);
    const [commissionRate, setCommissionRate] = useState(2.5);

    const SOLO_ANNUAL_PRICE = 1188;

    const calculations = useMemo(() => {
        // Ensure values are numbers
        const current = Number(currentValue) || 0;
        const target = Number(targetValue) || 0;
        const rate = Number(commissionRate) || 0;

        // Logic: Calculate incremental commission from the upgrade gap
        // If it's a pure upgrade service, the "Extra" value created is the gap.
        // Or is it the full commission on the target property?
        // User request: "Incremental commission: ~RM4k–RM6k" for 750k -> 950k.
        // Gap = 200k. 200k * 2.5% = 5,000.
        // So yes, strictly incremental commission on the VALUE ADDED.

        const incrementalValue = Math.max(0, target - current);
        const incrementalCommission = incrementalValue * (rate / 100);
        const yearsCovered = incrementalCommission > 0
            ? (incrementalCommission / SOLO_ANNUAL_PRICE).toFixed(1)
            : "0";

        return {
            incrementalValue,
            incrementalCommission,
            yearsCovered
        };
    }, [currentValue, targetValue, commissionRate]);

    return (
        <Card className="border-muted-foreground/20 bg-muted/10 overflow-hidden">
            <CardHeader className="pb-4 border-b bg-card">
                <div className="flex items-center gap-2 mb-1">
                    <Calculator className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">ROI Calculator</CardTitle>
                </div>
                <CardDescription>
                    See how one upgrade deal covers your costs.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                {/* Inputs Section */}
                <div className="p-6 space-y-5 bg-card/50">
                    <div className="space-y-2">
                        <Label htmlFor="current-value" className="text-xs font-semibold uppercase text-muted-foreground">
                            Current Property Value
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">RM</span>
                            <Input
                                id="current-value"
                                type="number"
                                className="pl-10"
                                value={currentValue}
                                onChange={(e) => setCurrentValue(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="target-value" className="text-xs font-semibold uppercase text-muted-foreground">
                            Target Upgrade Value
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">RM</span>
                            <Input
                                id="target-value"
                                type="number"
                                className="pl-10"
                                value={targetValue}
                                onChange={(e) => setTargetValue(Number(e.target.value))}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Value Increase: <span className="font-medium text-foreground">{formatRM(calculations.incrementalValue)}</span>
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="commission-rate" className="text-xs font-semibold uppercase text-muted-foreground">
                            Commission Rate
                        </Label>
                        <div className="relative">
                            <Input
                                id="commission-rate"
                                type="number"
                                className="pr-8"
                                step="0.1"
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(Number(e.target.value))}
                            />
                            <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="p-6 flex flex-col justify-center bg-muted/30">
                    <div className="mb-6 space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Incremental Commission</h4>
                        <div className="text-3xl font-bold text-success text-primary">
                            {formatRMFull(calculations.incrementalCommission)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Commission earned on the <span className="font-medium text-foreground">extra {formatRM(calculations.incrementalValue)}</span> value
                        </p>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-dashed">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">PropFit Solo (Annual):</span>
                            <span className="font-mono">RM {SOLO_ANNUAL_PRICE.toLocaleString()}</span>
                        </div>

                        <div className="rounded-lg bg-primary/10 p-4 text-center border border-primary/20">
                            <p className="text-sm text-muted-foreground mb-1">
                                This single deal pays for
                            </p>
                            <div className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                                {calculations.yearsCovered} Years
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                of PropFit subscription
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
