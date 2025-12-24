'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  type City,
  type Intent,
  type MoveInTimeline,
  type EmploymentType,
  type Lead,
  type CreateLeadInput,
} from '@/lib/types';
import { AREAS_BY_CITY } from '@/lib/areas';

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

  const handleAreaToggle = (area: string) => {
    setPreferredAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
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
                        area.tier === 'budget' ? 'text-green-600' :
                        area.tier === 'mid' ? 'text-blue-600' : 'text-purple-600'
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
          <div className="bg-amber-50 border border-amber-200 p-3 rounded text-sm text-amber-800">
            <strong>Note:</strong> This is a self-declared financing readiness indicator, not a bank credit report.
            Final loan approval depends on the bank&apos;s assessment.
          </div>
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
