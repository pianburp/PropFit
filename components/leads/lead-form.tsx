'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createLead, updateLead } from '@/lib/actions';
import {
  CITY_LABELS,
  INTENT_LABELS,
  TIMELINE_LABELS,
  EMPLOYMENT_LABELS,
  INCOME_RANGES,
  RENT_BUDGET_RANGES,
  BUY_BUDGET_RANGES,
  PROPERTY_TYPE_LABELS,
  FAMILY_ALIGNMENT_LABELS,
  LIFE_MILESTONE_LABELS,
  UPGRADE_INTENT_LABELS,
  type City,
  type Intent,
  type MoveInTimeline,
  type EmploymentType,
  type PropertyType,
  type FamilyAlignmentStatus,
  type LifeMilestoneType,
  type UpgradeIntentSignal,
  type Lead,
  type CreateLeadInput,
} from '@/lib/types';
import { AREAS_BY_CITY } from '@/lib/areas';
import { Home, Users, Sparkles, TrendingUp } from 'lucide-react';

interface LeadFormProps {
  lead?: Lead;
  mode: 'create' | 'edit';
}

export function LeadForm({ lead, mode }: LeadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(lead?.name || '');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [email, setEmail] = useState(lead?.email || '');
  const [incomeRange, setIncomeRange] = useState(
    lead ? `${lead.monthly_income_min}-${lead.monthly_income_max}` : ''
  );
  const [preferredCity, setPreferredCity] = useState<City | ''>(lead?.preferred_city || '');
  const [preferredAreas, setPreferredAreas] = useState<string[]>(lead?.preferred_areas || []);
  const [intent, setIntent] = useState<Intent | ''>(lead?.intent || '');
  const [budgetRange, setBudgetRange] = useState(
    lead ? `${lead.budget_min}-${lead.budget_max}` : ''
  );
  const [moveInTimeline, setMoveInTimeline] = useState<MoveInTimeline | ''>(
    lead?.move_in_timeline || ''
  );

  // Optional fields
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>(
    lead?.employment_type || ''
  );
  const [yearsInJob, setYearsInJob] = useState(lead?.years_in_current_job?.toString() || '');
  const [loanCommitment, setLoanCommitment] = useState(
    lead?.existing_loan_commitment_percent?.toString() || ''
  );
  const [previousRejection, setPreviousRejection] = useState(lead?.previous_loan_rejection || false);
  const [firstTimeBuyer, setFirstTimeBuyer] = useState(lead?.is_first_time_buyer ?? true);
  const [leaseEndDate, setLeaseEndDate] = useState(lead?.lease_end_date || '');
  const [notes, setNotes] = useState(lead?.notes || '');

  // NEW: Current Property fields (for upgrade analysis)
  const [currentPropertyType, setCurrentPropertyType] = useState<PropertyType | ''>(
    lead?.current_property_type || ''
  );
  const [currentPropertyLocation, setCurrentPropertyLocation] = useState(
    lead?.current_property_location || ''
  );
  const [currentPropertyCity, setCurrentPropertyCity] = useState<City | ''>(
    lead?.current_property_city || ''
  );
  const [currentPropertyPurchaseYear, setCurrentPropertyPurchaseYear] = useState(
    lead?.current_property_purchase_year?.toString() || ''
  );
  const [currentPropertyPurchasePrice, setCurrentPropertyPurchasePrice] = useState(
    lead?.current_property_purchase_price?.toString() || ''
  );

  // NEW: Family Alignment
  const [familyAlignmentStatus, setFamilyAlignmentStatus] = useState<FamilyAlignmentStatus | ''>(
    lead?.family_alignment_status || ''
  );
  const [familyAlignmentNotes, setFamilyAlignmentNotes] = useState(
    lead?.family_alignment_notes || ''
  );
  const [coApplicantIncome, setCoApplicantIncome] = useState(
    lead?.co_applicant_income?.toString() || ''
  );

  // NEW: Life Milestone (Upgrade Trigger)
  const [pendingMilestone, setPendingMilestone] = useState<LifeMilestoneType | ''>('');
  const [pendingMilestoneDate, setPendingMilestoneDate] = useState('');
  const [pendingMilestoneNotes, setPendingMilestoneNotes] = useState('');

  // NEW: Upgrade Intent Signals
  const [upgradeIntentSignals, setUpgradeIntentSignals] = useState<UpgradeIntentSignal[]>(
    lead?.upgrade_intent_signals || []
  );
  const [upgradeTargetPropertyType, setUpgradeTargetPropertyType] = useState<PropertyType | ''>(
    lead?.upgrade_target_property_type || ''
  );

  const handleAreaToggle = (area: string) => {
    setPreferredAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleIntentSignalToggle = (signal: UpgradeIntentSignal) => {
    setUpgradeIntentSignals((prev) =>
      prev.includes(signal) ? prev.filter((s) => s !== signal) : [...prev, signal]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse income range
      const [incomeMin, incomeMax] = incomeRange.split('-').map(Number);
      const [budgetMin, budgetMax] = budgetRange.split('-').map(Number);

      const input: CreateLeadInput = {
        name,
        phone,
        monthly_income_min: incomeMin,
        monthly_income_max: incomeMax,
        preferred_city: preferredCity as City,
        preferred_areas: preferredAreas,
        intent: intent as Intent,
        budget_min: budgetMin,
        budget_max: budgetMax,
        move_in_timeline: moveInTimeline as MoveInTimeline,
        email: email || undefined,
        employment_type: employmentType ? (employmentType as EmploymentType) : undefined,
        years_in_current_job: yearsInJob ? parseInt(yearsInJob) : undefined,
        existing_loan_commitment_percent: loanCommitment ? parseInt(loanCommitment) : undefined,
        previous_loan_rejection: previousRejection,
        is_first_time_buyer: firstTimeBuyer,
        lease_end_date: leaseEndDate || undefined,
        notes: notes || undefined,
        // NEW: Current Property
        current_property_type: currentPropertyType || undefined,
        current_property_location: currentPropertyLocation || undefined,
        current_property_city: currentPropertyCity || undefined,
        current_property_purchase_year: currentPropertyPurchaseYear ? parseInt(currentPropertyPurchaseYear) : undefined,
        current_property_purchase_price: currentPropertyPurchasePrice ? parseInt(currentPropertyPurchasePrice) : undefined,
        // NEW: Family Alignment
        family_alignment_status: familyAlignmentStatus || undefined,
        family_alignment_notes: familyAlignmentNotes || undefined,
        co_applicant_income: coApplicantIncome ? parseInt(coApplicantIncome) : undefined,
        // NEW: Upgrade Intent
        upgrade_intent_signals: upgradeIntentSignals.length > 0 ? upgradeIntentSignals : undefined,
        upgrade_target_property_type: upgradeTargetPropertyType || undefined,
        // NEW: Life Milestone
        pending_life_milestone: pendingMilestone || undefined,
        pending_life_milestone_date: pendingMilestoneDate || undefined,
        pending_life_milestone_notes: pendingMilestoneNotes || undefined,
      };

      let result;
      if (mode === 'create') {
        result = await createLead(input);
      } else {
        result = await updateLead({ ...input, id: lead!.id });
      }

      if (result.success) {
        router.push(mode === 'create' ? `/protected/leads/${result.lead?.id}` : `/protected/leads/${lead!.id}`);
      } else {
        setError(result.error || 'Failed to save lead');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const budgetRanges = intent === 'buy' ? BUY_BUDGET_RANGES : RENT_BUDGET_RANGES;
  const availableAreas = preferredCity ? AREAS_BY_CITY[preferredCity] : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
          <CardDescription>Basic contact details for the lead</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="012-345 6789"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@email.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Property Requirements</CardTitle>
          <CardDescription>What is the client looking for?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Intent *</Label>
              <Select value={intent} onValueChange={(v) => {
                setIntent(v as Intent);
                setBudgetRange(''); // Reset budget when intent changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Rent or Buy?" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INTENT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Move-in Timeline *</Label>
              <Select value={moveInTimeline} onValueChange={(v) => setMoveInTimeline(v as MoveInTimeline)}>
                <SelectTrigger>
                  <SelectValue placeholder="When to move?" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIMELINE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preferred City *</Label>
              <Select value={preferredCity} onValueChange={(v) => {
                setPreferredCity(v as City);
                setPreferredAreas([]); // Reset areas when city changes
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Budget Range *</Label>
              <Select value={budgetRange} onValueChange={setBudgetRange} disabled={!intent}>
                <SelectTrigger>
                  <SelectValue placeholder={intent ? "Select budget" : "Select intent first"} />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={`${range.min}-${range.max}`} value={`${range.min}-${range.max}`}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Area Selection */}
          {preferredCity && (
            <div className="space-y-3">
              <Label>Preferred Areas (Select one or more)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {availableAreas.map((area) => (
                  <div
                    key={area.value}
                    className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                      preferredAreas.includes(area.value)
                        ? 'bg-primary/10 border-primary'
                        : 'border-input hover:bg-muted'
                    }`}
                    onClick={() => handleAreaToggle(area.value)}
                  >
                    <Checkbox
                      checked={preferredAreas.includes(area.value)}
                      onCheckedChange={() => handleAreaToggle(area.value)}
                    />
                    <span className="text-sm">
                      {area.label}
                      <span className={`ml-1 text-xs ${
                        area.tier === 'budget' ? 'text-success' :
                        area.tier === 'mid' ? 'text-primary' : 'text-chart-4'
                      }`}>
                        ({area.tier})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
          <CardDescription>Income and financing details for qualification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monthly Income Range *</Label>
              <Select value={incomeRange} onValueChange={setIncomeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_RANGES.map((range) => (
                    <SelectItem key={`${range.min}-${range.max}`} value={`${range.min}-${range.max}`}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as EmploymentType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMPLOYMENT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearsInJob">Years at Current Job</Label>
              <Input
                id="yearsInJob"
                type="number"
                min="0"
                value={yearsInJob}
                onChange={(e) => setYearsInJob(e.target.value)}
                placeholder="e.g., 3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanCommitment">Existing Loan Commitment (%)</Label>
              <Input
                id="loanCommitment"
                type="number"
                min="0"
                max="100"
                value={loanCommitment}
                onChange={(e) => setLoanCommitment(e.target.value)}
                placeholder="e.g., 20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="previousRejection"
                checked={previousRejection}
                onCheckedChange={(checked) => setPreviousRejection(checked as boolean)}
              />
              <Label htmlFor="previousRejection" className="cursor-pointer">
                Previous bank loan rejection
              </Label>
            </div>
            {intent === 'buy' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="firstTimeBuyer"
                  checked={firstTimeBuyer}
                  onCheckedChange={(checked) => setFirstTimeBuyer(checked as boolean)}
                />
                <Label htmlFor="firstTimeBuyer" className="cursor-pointer">
                  First-time home buyer
                </Label>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-chart-3/10 border border-chart-3/30 p-3 rounded text-sm text-chart-3">
            <strong>Note:</strong> This is a self-declared financing readiness indicator, not a bank credit report.
            Final loan approval depends on the bank&apos;s assessment.
          </div>
        </CardContent>
      </Card>

      {/* Current Property (Upgrade Analysis) */}
      <Card className="border-chart-4/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-chart-4" />
            <div>
              <CardTitle>Current Property</CardTitle>
              <CardDescription>Essential for accurate upgrade readiness analysis</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select value={currentPropertyType} onValueChange={(v) => setCurrentPropertyType(v as PropertyType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Select value={currentPropertyCity} onValueChange={(v) => setCurrentPropertyCity(v as City)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPropertyLocation">Location / Project Name</Label>
            <Input
              id="currentPropertyLocation"
              value={currentPropertyLocation}
              onChange={(e) => setCurrentPropertyLocation(e.target.value)}
              placeholder="e.g., Setia Alam, Kota Damansara, Mont Kiara"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPropertyPurchaseYear">Year Purchased</Label>
              <Input
                id="currentPropertyPurchaseYear"
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                value={currentPropertyPurchaseYear}
                onChange={(e) => setCurrentPropertyPurchaseYear(e.target.value)}
                placeholder="e.g., 2018"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPropertyPurchasePrice">Original Purchase Price (RM)</Label>
              <Input
                id="currentPropertyPurchasePrice"
                type="number"
                min="0"
                value={currentPropertyPurchasePrice}
                onChange={(e) => setCurrentPropertyPurchasePrice(e.target.value)}
                placeholder="e.g., 450000"
              />
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded text-sm text-muted-foreground">
            💡 This data enables accurate equity calculations and upgrade affordability analysis.
          </div>
        </CardContent>
      </Card>

      {/* Family Alignment (Critical for Upgrade Deals) */}
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Family & Decision Makers</CardTitle>
              <CardDescription>#1 factor in upgrade deal success</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Family Alignment Status</Label>
              <Select value={familyAlignmentStatus} onValueChange={(v) => setFamilyAlignmentStatus(v as FamilyAlignmentStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FAMILY_ALIGNMENT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coApplicantIncome">Co-Applicant / Spouse Income (RM)</Label>
              <Input
                id="coApplicantIncome"
                type="number"
                min="0"
                value={coApplicantIncome}
                onChange={(e) => setCoApplicantIncome(e.target.value)}
                placeholder="Monthly income if joint application"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="familyAlignmentNotes">Notes on Family Situation</Label>
            <Textarea
              id="familyAlignmentNotes"
              value={familyAlignmentNotes}
              onChange={(e) => setFamilyAlignmentNotes(e.target.value)}
              placeholder="e.g., Spouse prefers landed, parents advising to wait..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Life Milestone (Upgrade Trigger) */}
      <Card className="border-success/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-success" />
            <div>
              <CardTitle>Life Milestone</CardTitle>
              <CardDescription>Upcoming event that may trigger upgrade need</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Upcoming Milestone</Label>
              <Select value={pendingMilestone} onValueChange={(v) => setPendingMilestone(v as LifeMilestoneType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select milestone (if any)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {Object.entries(LIFE_MILESTONE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pendingMilestoneDate">Expected Date</Label>
              <Input
                id="pendingMilestoneDate"
                type="date"
                value={pendingMilestoneDate}
                onChange={(e) => setPendingMilestoneDate(e.target.value)}
                disabled={!pendingMilestone}
              />
            </div>
          </div>

          {pendingMilestone && (
            <div className="space-y-2">
              <Label htmlFor="pendingMilestoneNotes">Details</Label>
              <Input
                id="pendingMilestoneNotes"
                value={pendingMilestoneNotes}
                onChange={(e) => setPendingMilestoneNotes(e.target.value)}
                placeholder="e.g., First child expected in March, will need extra room..."
              />
            </div>
          )}

          <div className="bg-success/10 p-3 rounded text-sm text-success">
            🎯 Life milestones are powerful upgrade triggers. Tracking them helps you reach out at the perfect moment.
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Intent Signals */}
      <Card className="border-chart-4/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-chart-4" />
            <div>
              <CardTitle>Upgrade Intent Signals</CardTitle>
              <CardDescription>What has the client mentioned about upgrading?</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Client has mentioned (select all that apply):</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(UPGRADE_INTENT_LABELS).map(([value, label]) => (
                <div
                  key={value}
                  className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                    upgradeIntentSignals.includes(value as UpgradeIntentSignal)
                      ? 'bg-chart-4/10 border-chart-4'
                      : 'border-input hover:bg-muted'
                  }`}
                  onClick={() => handleIntentSignalToggle(value as UpgradeIntentSignal)}
                >
                  <Checkbox
                    checked={upgradeIntentSignals.includes(value as UpgradeIntentSignal)}
                    onCheckedChange={() => handleIntentSignalToggle(value as UpgradeIntentSignal)}
                  />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {upgradeIntentSignals.length > 0 && (
            <div className="space-y-2">
              <Label>Target Property Type</Label>
              <Select value={upgradeTargetPropertyType} onValueChange={(v) => setUpgradeTargetPropertyType(v as PropertyType)}>
                <SelectTrigger>
                  <SelectValue placeholder="What type are they looking to upgrade to?" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {upgradeIntentSignals.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Signals captured:</span>
              {upgradeIntentSignals.map((signal) => (
                <Badge key={signal} variant="secondary" className="bg-chart-4/20">
                  {UPGRADE_INTENT_LABELS[signal]}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Optional details to help with follow-up</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leaseEndDate">Current Lease End Date</Label>
            <Input
              id="leaseEndDate"
              type="date"
              value={leaseEndDate}
              onChange={(e) => setLeaseEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this lead..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading
            ? 'Saving...'
            : mode === 'create'
            ? 'Create & Qualify Lead'
            : 'Update Lead'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
