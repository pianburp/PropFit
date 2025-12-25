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
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/components/radix/tabs';
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
import { User, Home, DollarSign, TrendingUp, FileText } from 'lucide-react';

interface LeadFormProps {
  lead?: Lead;
  mode: 'create' | 'edit';
}

export function LeadForm({ lead, mode }: LeadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('contact');

  // Form state - Contact
  const [name, setName] = useState(lead?.name || '');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [email, setEmail] = useState(lead?.email || '');
  const [icNumber, setIcNumber] = useState(lead?.ic_number || '');

  // Upsert notification state
  const [upsertNotification, setUpsertNotification] = useState<{
    isUpdate: boolean;
    leadName: string;
  } | null>(null);

  // Form state - Property Requirements
  const [preferredCity, setPreferredCity] = useState<City | ''>(lead?.preferred_city || '');
  const [preferredAreas, setPreferredAreas] = useState<string[]>(lead?.preferred_areas || []);
  const [intent, setIntent] = useState<Intent | ''>(lead?.intent || '');
  const [budgetRange, setBudgetRange] = useState(
    lead ? `${lead.budget_min}-${lead.budget_max}` : ''
  );
  const [moveInTimeline, setMoveInTimeline] = useState<MoveInTimeline | ''>(
    lead?.move_in_timeline || ''
  );

  // Form state - Financial
  const [incomeRange, setIncomeRange] = useState(
    lead ? `${lead.monthly_income_min}-${lead.monthly_income_max}` : ''
  );
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>(
    lead?.employment_type || ''
  );
  const [yearsInJob, setYearsInJob] = useState(lead?.years_in_current_job?.toString() || '');
  const [loanCommitment, setLoanCommitment] = useState(
    lead?.existing_loan_commitment_percent?.toString() || ''
  );
  const [previousRejection, setPreviousRejection] = useState(lead?.previous_loan_rejection || false);
  const [firstTimeBuyer, setFirstTimeBuyer] = useState(lead?.is_first_time_buyer ?? true);

  // Form state - Upgrade Analysis
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
  const [familyAlignmentStatus, setFamilyAlignmentStatus] = useState<FamilyAlignmentStatus | ''>(
    lead?.family_alignment_status || ''
  );
  const [familyAlignmentNotes, setFamilyAlignmentNotes] = useState(
    lead?.family_alignment_notes || ''
  );
  const [coApplicantIncome, setCoApplicantIncome] = useState(
    lead?.co_applicant_income?.toString() || ''
  );
  const [pendingMilestone, setPendingMilestone] = useState<LifeMilestoneType | ''>('');
  const [pendingMilestoneDate, setPendingMilestoneDate] = useState('');
  const [pendingMilestoneNotes, setPendingMilestoneNotes] = useState('');
  const [upgradeIntentSignals, setUpgradeIntentSignals] = useState<UpgradeIntentSignal[]>(
    lead?.upgrade_intent_signals || []
  );
  const [upgradeTargetPropertyType, setUpgradeTargetPropertyType] = useState<PropertyType | ''>(
    lead?.upgrade_target_property_type || ''
  );

  // Form state - Additional
  const [leaseEndDate, setLeaseEndDate] = useState(lead?.lease_end_date || '');
  const [notes, setNotes] = useState(lead?.notes || '');

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
        current_property_type: currentPropertyType || undefined,
        current_property_location: currentPropertyLocation || undefined,
        current_property_city: currentPropertyCity || undefined,
        current_property_purchase_year: currentPropertyPurchaseYear ? parseInt(currentPropertyPurchaseYear) : undefined,
        current_property_purchase_price: currentPropertyPurchasePrice ? parseInt(currentPropertyPurchasePrice) : undefined,
        family_alignment_status: familyAlignmentStatus || undefined,
        family_alignment_notes: familyAlignmentNotes || undefined,
        co_applicant_income: coApplicantIncome ? parseInt(coApplicantIncome) : undefined,
        upgrade_intent_signals: upgradeIntentSignals.length > 0 ? upgradeIntentSignals : undefined,
        upgrade_target_property_type: upgradeTargetPropertyType || undefined,
        pending_life_milestone: pendingMilestone || undefined,
        pending_life_milestone_date: pendingMilestoneDate || undefined,
        pending_life_milestone_notes: pendingMilestoneNotes || undefined,
        ic_number: icNumber || undefined,
      };


      if (mode === 'create') {
        const result = await createLead(input);
        if (result.success) {
          // Show upsert notification if this was an update to an existing lead
          if (result.isUpdate) {
            setUpsertNotification({
              isUpdate: true,
              leadName: name,
            });
            // Navigate after a short delay to show the notification
            setTimeout(() => {
              router.push(`/protected/leads/${result.lead?.id}`);
            }, 2000);
          } else {
            router.push(`/protected/leads/${result.lead?.id}`);
          }
        } else {
          setError(result.error || 'Failed to save lead');
        }
      } else {
        const result = await updateLead({ ...input, id: lead!.id });
        if (result.success) {
          router.push(`/protected/leads/${lead!.id}`);
        } else {
          setError(result.error || 'Failed to save lead');
        }
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

  // Validation helpers for tab navigation hints
  const isContactComplete = name && phone;
  const isPropertyComplete = intent && preferredCity && preferredAreas.length > 0 && budgetRange && moveInTimeline;
  const isFinancialComplete = incomeRange;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {upsertNotification && (
        <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-lg">✓</span>
          <div>
            <strong>Existing contact found!</strong>
            <p className="text-sm">We've updated {upsertNotification.leadName}'s record with the latest information.</p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
            {isContactComplete && <span className="h-2 w-2 bg-green-500 rounded-full" />}
          </TabsTrigger>
          <TabsTrigger value="property" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Property</span>
            {isPropertyComplete && <span className="h-2 w-2 bg-green-500 rounded-full" />}
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Financial</span>
            {isFinancialComplete && <span className="h-2 w-2 bg-green-500 rounded-full" />}
          </TabsTrigger>
          <TabsTrigger value="upgrade" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Upgrade</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
        </TabsList>

        <TabsContents>
          {/* Tab 1: Contact Information */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>Basic contact information for the lead</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter client name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
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
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icNumber">IC/NRIC Number</Label>
                  <Input
                    id="icNumber"
                    value={icNumber}
                    onChange={(e) => setIcNumber(e.target.value)}
                    placeholder="e.g., 901234-14-5678"
                  />
                  <p className="text-xs text-muted-foreground">Used for unique identification of returning clients</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="button" onClick={() => setActiveTab('property')}>
                Next: Property Requirements →
              </Button>
            </div>
          </TabsContent>

          {/* Tab 2: Property Requirements */}
          <TabsContent value="property" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Requirements</CardTitle>
                <CardDescription>What is the client looking for?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Intent *</Label>
                    <Select
                      value={intent || 'none'}
                      onValueChange={(v) => {
                        setIntent(v === 'none' ? '' : v as Intent);
                        setBudgetRange('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rent or Buy?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select intent...</SelectItem>
                        {Object.entries(INTENT_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timeline *</Label>
                    <Select
                      value={moveInTimeline || 'none'}
                      onValueChange={(v) => setMoveInTimeline(v === 'none' ? '' : v as MoveInTimeline)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="When?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select timeline...</SelectItem>
                        {Object.entries(TIMELINE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Select
                      value={preferredCity || 'none'}
                      onValueChange={(v) => {
                        setPreferredCity(v === 'none' ? '' : v as City);
                        setPreferredAreas([]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select city...</SelectItem>
                        {Object.entries(CITY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Budget *</Label>
                    <Select
                      value={budgetRange || 'none'}
                      onValueChange={(v) => setBudgetRange(v === 'none' ? '' : v)}
                      disabled={!intent}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={intent ? "Select budget" : "Select intent first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select budget...</SelectItem>
                        {budgetRanges.map((range) => (
                          <SelectItem key={`${range.min}-${range.max}`} value={`${range.min}-${range.max}`}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {preferredCity && (
                  <div className="space-y-3 pt-4 border-t">
                    <Label>Preferred Areas (Select one or more)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                      {availableAreas.map((area) => (
                        <div
                          key={area.value}
                          className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${preferredAreas.includes(area.value)
                            ? 'bg-primary/10 border-primary'
                            : 'border-input hover:bg-muted'
                            }`}
                          onClick={() => handleAreaToggle(area.value)}
                        >
                          <Checkbox
                            checked={preferredAreas.includes(area.value)}
                            onCheckedChange={() => handleAreaToggle(area.value)}
                          />
                          <span className="text-sm truncate">
                            {area.label}
                            <span className={`ml-1 text-xs ${area.tier === 'budget' ? 'text-green-600' :
                              area.tier === 'mid' ? 'text-blue-600' : 'text-amber-600'
                              }`}>
                              ({area.tier})
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                    {preferredAreas.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        <span className="text-sm text-muted-foreground">Selected:</span>
                        {preferredAreas.map((area) => (
                          <Badge key={area} variant="secondary" className="text-xs">
                            {availableAreas.find(a => a.value === area)?.label || area}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab('contact')}>
                ← Back
              </Button>
              <Button type="button" onClick={() => setActiveTab('financial')}>
                Next: Financial Info →
              </Button>
            </div>
          </TabsContent>

          {/* Tab 3: Financial Information */}
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
                <CardDescription>Income and financing details for qualification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Monthly Income *</Label>
                    <Select value={incomeRange || 'none'} onValueChange={(v) => setIncomeRange(v === 'none' ? '' : v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select income...</SelectItem>
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
                    <Select
                      value={employmentType || 'none'}
                      onValueChange={(v) => setEmploymentType(v === 'none' ? '' : v as EmploymentType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select employment...</SelectItem>
                        {Object.entries(EMPLOYMENT_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsInJob">Years in Current Job</Label>
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
                    <Label htmlFor="loanCommitment">Existing Loan %</Label>
                    <Input
                      id="loanCommitment"
                      type="number"
                      min="0"
                      max="100"
                      value={loanCommitment}
                      onChange={(e) => setLoanCommitment(e.target.value)}
                      placeholder="e.g., 30"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="firstTimeBuyer"
                      checked={firstTimeBuyer}
                      onCheckedChange={(checked) => setFirstTimeBuyer(checked as boolean)}
                    />
                    <Label htmlFor="firstTimeBuyer" className="cursor-pointer">
                      First-time buyer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="previousRejection"
                      checked={previousRejection}
                      onCheckedChange={(checked) => setPreviousRejection(checked as boolean)}
                    />
                    <Label htmlFor="previousRejection" className="cursor-pointer text-amber-600">
                      Previous loan rejection
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab('property')}>
                ← Back
              </Button>
              <Button type="button" onClick={() => setActiveTab('upgrade')}>
                Next: Upgrade Analysis →
              </Button>
            </div>
          </TabsContent>

          {/* Tab 4: Upgrade Analysis */}
          <TabsContent value="upgrade" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Current Property */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Current Property</CardTitle>
                  <CardDescription className="text-xs">Details about existing property for upgrade analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Property Type</Label>
                      <Select
                        value={currentPropertyType || 'none'}
                        onValueChange={(v) => setCurrentPropertyType(v === 'none' ? '' : v as PropertyType)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select type...</SelectItem>
                          {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">City</Label>
                      <Select
                        value={currentPropertyCity || 'none'}
                        onValueChange={(v) => setCurrentPropertyCity(v === 'none' ? '' : v as City)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select city...</SelectItem>
                          {Object.entries(CITY_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="currentPropertyLocation" className="text-xs">Location/Project Name</Label>
                    <Input
                      id="currentPropertyLocation"
                      value={currentPropertyLocation}
                      onChange={(e) => setCurrentPropertyLocation(e.target.value)}
                      placeholder="e.g., Residensi Harmoni"
                      className="h-9"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="currentPropertyPurchaseYear" className="text-xs flex items-center gap-1">
                        Purchase Year
                        <span className="text-primary">★</span>
                      </Label>
                      <Input
                        id="currentPropertyPurchaseYear"
                        type="number"
                        min="1990"
                        max={new Date().getFullYear()}
                        value={currentPropertyPurchaseYear}
                        onChange={(e) => setCurrentPropertyPurchaseYear(e.target.value)}
                        placeholder="e.g., 2018"
                        className={`h-9 ${!currentPropertyPurchaseYear ? 'border-primary/50' : ''}`}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Used to detect 3yr/5yr upgrade windows
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="currentPropertyPurchasePrice" className="text-xs">Purchase Price (RM)</Label>
                      <Input
                        id="currentPropertyPurchasePrice"
                        type="number"
                        value={currentPropertyPurchasePrice}
                        onChange={(e) => setCurrentPropertyPurchasePrice(e.target.value)}
                        placeholder="e.g., 350000"
                        className="h-9"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Family & Decision Makers */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Family Alignment</CardTitle>
                  <CardDescription className="text-xs">Family decision-making status and joint income</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Alignment Status</Label>
                    <Select
                      value={familyAlignmentStatus || 'none'}
                      onValueChange={(v) => setFamilyAlignmentStatus(v === 'none' ? '' : v as FamilyAlignmentStatus)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select status...</SelectItem>
                        {Object.entries(FAMILY_ALIGNMENT_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="coApplicantIncome" className="text-xs">Co-applicant Income (RM/month)</Label>
                    <Input
                      id="coApplicantIncome"
                      type="number"
                      value={coApplicantIncome}
                      onChange={(e) => setCoApplicantIncome(e.target.value)}
                      placeholder="e.g., 5000"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="familyAlignmentNotes" className="text-xs">Notes</Label>
                    <Textarea
                      id="familyAlignmentNotes"
                      value={familyAlignmentNotes}
                      onChange={(e) => setFamilyAlignmentNotes(e.target.value)}
                      placeholder="Any notes about family decision dynamics..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Life Milestone */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Life Milestone</CardTitle>
                  <CardDescription className="text-xs">Upcoming events that may trigger an upgrade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Milestone Type</Label>
                      <Select
                        value={pendingMilestone || 'none'}
                        onValueChange={(v) => setPendingMilestone(v === 'none' ? '' : v as LifeMilestoneType)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select milestone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select milestone...</SelectItem>
                          {Object.entries(LIFE_MILESTONE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pendingMilestoneDate" className="text-xs">Expected Date</Label>
                      <Input
                        id="pendingMilestoneDate"
                        type="date"
                        value={pendingMilestoneDate}
                        onChange={(e) => setPendingMilestoneDate(e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pendingMilestoneNotes" className="text-xs">Notes</Label>
                    <Textarea
                      id="pendingMilestoneNotes"
                      value={pendingMilestoneNotes}
                      onChange={(e) => setPendingMilestoneNotes(e.target.value)}
                      placeholder="Additional context about the milestone..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade Intent Signals */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Upgrade Intent Signals</CardTitle>
                  <CardDescription className="text-xs">Indicators that the client is ready to upgrade</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(UPGRADE_INTENT_LABELS).map(([value, label]) => (
                      <div
                        key={value}
                        className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${upgradeIntentSignals.includes(value as UpgradeIntentSignal)
                          ? 'bg-amber-500/10 border-amber-500'
                          : 'border-input hover:bg-muted'
                          }`}
                        onClick={() => handleIntentSignalToggle(value as UpgradeIntentSignal)}
                      >
                        <Checkbox
                          checked={upgradeIntentSignals.includes(value as UpgradeIntentSignal)}
                          onCheckedChange={() => handleIntentSignalToggle(value as UpgradeIntentSignal)}
                        />
                        <span className="text-xs">{label}</span>
                      </div>
                    ))}
                  </div>

                  {upgradeIntentSignals.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t">
                      <Label className="text-xs">Target Property Type</Label>
                      <Select
                        value={upgradeTargetPropertyType || 'none'}
                        onValueChange={(v) => setUpgradeTargetPropertyType(v === 'none' ? '' : v as PropertyType)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="What type are they upgrading to?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Select type...</SelectItem>
                          {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab('financial')}>
                ← Back
              </Button>
              <Button type="button" onClick={() => setActiveTab('notes')}>
                Next: Notes →
              </Button>
            </div>
          </TabsContent>

          {/* Tab 5: Additional Notes */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Optional details to help with follow-up</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaseEndDate">Current Lease End Date</Label>
                    <Input
                      id="leaseEndDate"
                      type="date"
                      value={leaseEndDate}
                      onChange={(e) => setLeaseEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes about this lead, conversation history, preferences, etc..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary before submit */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ready to Submit?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Contact</p>
                    <p className="font-medium">{name || '—'}</p>
                    <p className="text-xs text-muted-foreground">{phone || 'No phone'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Intent</p>
                    <p className="font-medium">{intent ? INTENT_LABELS[intent] : '—'}</p>
                    <p className="text-xs text-muted-foreground">{moveInTimeline ? TIMELINE_LABELS[moveInTimeline] : 'No timeline'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium">{preferredCity ? CITY_LABELS[preferredCity] : '—'}</p>
                    <p className="text-xs text-muted-foreground">{preferredAreas.length} area(s) selected</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-medium">{budgetRange ? budgetRanges.find(r => `${r.min}-${r.max}` === budgetRange)?.label : '—'}</p>
                    <p className="text-xs text-muted-foreground">{incomeRange ? 'Income set' : 'No income'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab('upgrade')}>
                ← Back
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? 'Saving...'
                    : mode === 'create'
                      ? 'Create & Qualify Lead'
                      : 'Update Lead'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </form>
  );
}
