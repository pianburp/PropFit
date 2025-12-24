'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { updateLeadStatus, deleteLead, logContact } from '@/lib/actions';
import {
  type Lead,
  type LeadEvent,
  CITY_LABELS,
  INTENT_LABELS,
  LEAD_STATUS_LABELS,
  TIMELINE_LABELS,
  EMPLOYMENT_LABELS,
  QUALIFICATION_STATUS_LABELS,
  QUALIFICATION_STATUS_COLORS,
  FINANCING_READINESS_LABELS,
  FINANCING_READINESS_COLORS,
  type LeadStatus,
  type City,
  type FinancingReadiness,
} from '@/lib/types';
import { formatRM, formatRMFull } from '@/lib/qualification-engine';
import { getAreaLabel } from '@/lib/areas';
// New upgrade feature components
import { WhyNowPanel } from '@/components/upgrade/why-now-panel';
import { ObjectionMapper } from '@/components/upgrade/objection-mapper';
import { ConversationTimeline } from '@/components/upgrade/conversation-timeline';
import { DealRiskFlags } from '@/components/upgrade/deal-risk-flags';
import { ReadinessHistory } from '@/components/upgrade/readiness-history';
import { FallbackPlanner } from '@/components/upgrade/fallback-planner';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  TrendingUp,
  Edit,
  Trash2,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Target,
  CreditCard,
  Zap,
} from 'lucide-react';

interface LeadDetailProps {
  lead: Lead;
  events: LeadEvent[];
}

export function LeadDetail({ lead, events }: LeadDetailProps) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setUpdating(true);
    try {
      await updateLeadStatus(lead.id, newStatus);
      setStatus(newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    setDeleting(true);
    try {
      await deleteLead(lead.id);
      router.push('/protected/leads');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogContact = async () => {
    await logContact(lead.id);
    router.refresh();
  };

  const avgIncome = (lead.monthly_income_min + lead.monthly_income_max) / 2;
  const avgBudget = (lead.budget_min + lead.budget_max) / 2;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{lead.name}</h1>
            {lead.is_upgrade_ready && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <TrendingUp className="w-3 h-3 mr-1" />
                Upgrade Ready
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {lead.phone}
            </span>
            {lead.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {lead.email}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {CITY_LABELS[lead.preferred_city as City]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => handleStatusChange(v as LeadStatus)} disabled={updating}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleLogContact} title="Log Contact">
            <MessageSquare className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="icon" asChild>
            <Link href={`/protected/leads/${lead.id}/edit`} title="Edit">
              <Edit className="w-4 h-4" />
            </Link>
          </Button>

          <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleting} title="Delete">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Qualification Score Card */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{lead.qualification_score}</div>
              <Badge className={`text-base px-4 py-1 ${QUALIFICATION_STATUS_COLORS[lead.qualification_status]}`}>
                {lead.qualification_status === 'qualified' && <CheckCircle className="w-4 h-4 mr-1" />}
                {lead.qualification_status === 'stretch' && <AlertTriangle className="w-4 h-4 mr-1" />}
                {lead.qualification_status === 'not_qualified' && <XCircle className="w-4 h-4 mr-1" />}
                {QUALIFICATION_STATUS_LABELS[lead.qualification_status]}
              </Badge>
            </div>

            {/* Score Breakdown */}
            <div className="md:col-span-3">
              <h4 className="font-medium mb-3">Score Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ScoreItem
                  icon={<CreditCard className="w-4 h-4" />}
                  label="Income"
                  score={lead.qualification_breakdown?.income_score || 0}
                  weight="40%"
                />
                <ScoreItem
                  icon={<MapPin className="w-4 h-4" />}
                  label="Location"
                  score={lead.qualification_breakdown?.location_score || 0}
                  weight="30%"
                />
                <ScoreItem
                  icon={<Target className="w-4 h-4" />}
                  label="Financing"
                  score={lead.qualification_breakdown?.credit_score || 0}
                  weight="20%"
                />
                <ScoreItem
                  icon={<Zap className="w-4 h-4" />}
                  label="Urgency"
                  score={lead.qualification_breakdown?.urgency_score || 0}
                  weight="10%"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="upgrade-tools">Upgrade Tools</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Property Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Intent" value={INTENT_LABELS[lead.intent]} />
                <DetailRow
                  label={lead.intent === 'rent' ? 'Budget (Monthly)' : 'Budget'}
                  value={`${formatRMFull(lead.budget_min)} - ${formatRMFull(lead.budget_max)}`}
                />
                <DetailRow label="Preferred City" value={CITY_LABELS[lead.preferred_city as City]} />
                <DetailRow
                  label="Preferred Areas"
                  value={
                    lead.preferred_areas.length > 0
                      ? lead.preferred_areas.map((a) => getAreaLabel(lead.preferred_city as City, a)).join(', ')
                      : 'Not specified'
                  }
                />
                <DetailRow label="Timeline" value={TIMELINE_LABELS[lead.move_in_timeline]} />
                {lead.lease_end_date && (
                  <DetailRow
                    label="Current Lease Ends"
                    value={new Date(lead.lease_end_date).toLocaleDateString('en-MY')}
                  />
                )}
              </CardContent>
            </Card>

            {/* Financial Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow
                  label="Monthly Income"
                  value={`${formatRMFull(lead.monthly_income_min)} - ${formatRMFull(lead.monthly_income_max)}`}
                />
                {lead.employment_type && (
                  <DetailRow label="Employment" value={EMPLOYMENT_LABELS[lead.employment_type]} />
                )}
                {lead.years_in_current_job !== undefined && lead.years_in_current_job !== null && (
                  <DetailRow label="Job Tenure" value={`${lead.years_in_current_job} years`} />
                )}
                {lead.existing_loan_commitment_percent !== undefined && lead.existing_loan_commitment_percent !== null && (
                  <DetailRow label="Existing Loans" value={`${lead.existing_loan_commitment_percent}% of income`} />
                )}
                <DetailRow
                  label="Previous Rejection"
                  value={lead.previous_loan_rejection ? 'Yes' : 'No'}
                />
                {lead.intent === 'buy' && (
                  <DetailRow
                    label="First-Time Buyer"
                    value={lead.is_first_time_buyer ? 'Yes' : 'No'}
                  />
                )}

                {/* Financing Readiness */}
                {lead.financing_readiness && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Financing Readiness</span>
                      <Badge className={FINANCING_READINESS_COLORS[lead.financing_readiness as FinancingReadiness]}>
                        {FINANCING_READINESS_LABELS[lead.financing_readiness as FinancingReadiness]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on self-declared information. Not a bank credit report.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {lead.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{lead.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Qualification Analysis</CardTitle>
              <CardDescription>Detailed breakdown of scoring factors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnalysisSection
                title="Income Analysis"
                score={lead.qualification_breakdown?.income_score || 0}
                analysis={lead.qualification_breakdown?.details?.income_analysis || 'No analysis available'}
                icon={<CreditCard className="w-5 h-5" />}
              />
              <AnalysisSection
                title="Location Fit"
                score={lead.qualification_breakdown?.location_score || 0}
                analysis={lead.qualification_breakdown?.details?.location_analysis || 'No analysis available'}
                icon={<MapPin className="w-5 h-5" />}
              />
              <AnalysisSection
                title="Financing Readiness"
                score={lead.qualification_breakdown?.credit_score || 0}
                analysis={lead.qualification_breakdown?.details?.credit_analysis || 'No analysis available'}
                icon={<Target className="w-5 h-5" />}
              />
              <AnalysisSection
                title="Urgency Assessment"
                score={lead.qualification_breakdown?.urgency_score || 0}
                analysis={lead.qualification_breakdown?.details?.urgency_analysis || 'No analysis available'}
                icon={<Zap className="w-5 h-5" />}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Area Suggestions</CardTitle>
              <CardDescription>
                Areas that match this lead&apos;s budget in {CITY_LABELS[lead.preferred_city as City]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lead.suggested_areas && lead.suggested_areas.length > 0 ? (
                <div className="space-y-3">
                  {lead.suggested_areas.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${suggestion.fit === 'perfect'
                        ? 'bg-green-50 border-green-200'
                        : suggestion.fit === 'stretch'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{suggestion.area}</h4>
                          <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            suggestion.fit === 'perfect'
                              ? 'bg-green-100 text-green-800'
                              : suggestion.fit === 'stretch'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {suggestion.fit === 'perfect' && '✓ Perfect'}
                          {suggestion.fit === 'stretch' && '⚠ Stretch'}
                          {suggestion.fit === 'alternative' && '→ Alternative'}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2">
                        Budget range: {formatRM(suggestion.estimated_budget.min)} -{' '}
                        {formatRM(suggestion.estimated_budget.max)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No suggestions available</p>
              )}
            </CardContent>
          </Card>

          {/* Upgrade Triggers */}
          {lead.upgrade_triggers && lead.upgrade_triggers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Upgrade Triggers
                </CardTitle>
                <CardDescription>This lead shows signs of upgrade readiness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lead.upgrade_triggers.map((trigger, index) => (
                    <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{trigger.type.replace(/_/g, ' ')}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(trigger.triggered_at).toLocaleDateString('en-MY')}
                        </span>
                      </div>
                      <p className="text-sm">{trigger.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {event.event_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.created_at).toLocaleString('en-MY')}
                          </span>
                        </div>
                        {event.notes && <p className="text-sm text-muted-foreground">{event.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No activity recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upgrade Tools Tab */}
        <TabsContent value="upgrade-tools" className="space-y-6">
          {/* Top Row: Why Now + Deal Risk Flags */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WhyNowPanel lead={lead} />
            <DealRiskFlags lead={lead} />
          </div>

          {/* Conversation Timeline */}
          <ConversationTimeline lead={lead} />

          {/* Bottom Row: Objection Mapper + Readiness History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ObjectionMapper />
            <ReadinessHistory lead={lead} events={events} />
          </div>

          {/* Fallback Planner */}
          <FallbackPlanner lead={lead} />

          {/* Link to WhatsApp Summary */}
          <div className="flex justify-center pt-4">
            <Button variant="outline" asChild>
              <Link href={`/protected/leads/${lead.id}/summary`}>
                📱 View WhatsApp-Ready Summary
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ScoreItem({
  icon,
  label,
  score,
  weight,
}: {
  icon: React.ReactNode;
  label: string;
  score: number;
  weight: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 45) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="text-center p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-center gap-1 mb-1 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
      <div className="text-xs text-muted-foreground">{weight} weight</div>
    </div>
  );
}

function AnalysisSection({
  title,
  score,
  analysis,
  icon,
}: {
  title: string;
  score: number;
  analysis: string;
  icon: React.ReactNode;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800';
    if (score >= 45) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="font-medium">{title}</h4>
        </div>
        <Badge className={getScoreColor(score)}>{score}/100</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{analysis}</p>
    </div>
  );
}
