'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  type Lead,
  CITY_LABELS,
  INTENT_LABELS,
  LEAD_STATUS_LABELS,
  QUALIFICATION_STATUS_LABELS,
  QUALIFICATION_STATUS_COLORS,
  type LeadStatus,
  type City,
} from '@/lib/types';
import { formatRM } from '@/lib/qualification-engine';
import { Phone, MapPin, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';

interface LeadListProps {
  leads: Lead[];
}

export function LeadList({ leads }: LeadListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [qualificationFilter, setQualificationFilter] = useState<string>('all');
  const [showUpgradeReady, setShowUpgradeReady] = useState<boolean>(false);

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    if (cityFilter !== 'all' && lead.preferred_city !== cityFilter) return false;
    if (qualificationFilter !== 'all' && lead.qualification_status !== qualificationFilter) return false;
    if (showUpgradeReady && !lead.is_upgrade_ready) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-background border rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">City:</span>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {Object.entries(CITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Qualification:</span>
            <Select value={qualificationFilter} onValueChange={setQualificationFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Object.entries(QUALIFICATION_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 border-l pl-4 ml-2 border-border/50">
            <Checkbox
              id="upgrade-ready"
              checked={showUpgradeReady}
              onCheckedChange={(checked) => setShowUpgradeReady(checked as boolean)}
            />
            <Label htmlFor="upgrade-ready" className="cursor-pointer">Upgrade Ready Only</Label>
          </div>

          <div className="ml-auto text-sm text-muted-foreground">
            {filteredLeads.length} of {leads.length} leads
          </div>
        </div>

        {/* Lead Cards */}
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No leads found matching your filters.</p>
            <Button asChild className="mt-4">
              <Link href="/protected/leads/new">Add Your First Lead</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const avgBudget = (lead.budget_min + lead.budget_max) / 2;

  return (
    <Link href={`/protected/leads/${lead.id}`}>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left: Main Info */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Header: Name & Status */}
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between md:justify-start md:items-center gap-3">
                  <h3 className="font-bold text-xl md:text-2xl text-foreground tracking-tight truncate">{lead.name}</h3>
                  {lead.is_upgrade_ready && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-chart-4/20 to-chart-4/10 text-chart-4 border-chart-4/20 shadow-sm shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                      Upgrade Ready
                    </Badge>
                  )}
                </div>

                {/* Primary Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-muted-foreground bg-background/50">
                    {LEAD_STATUS_LABELS[lead.status as LeadStatus]}
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground bg-background/50">
                    {INTENT_LABELS[lead.intent]}
                  </Badge>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-sm text-muted-foreground/90">
                <span className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-primary/10">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {lead.phone}
                </span>
                <span className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-purple-500/10">
                    <MapPin className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  {CITY_LABELS[lead.preferred_city as City]}
                </span>
                <span className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-orange-500/10">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  Added {new Date(lead.created_at).toLocaleDateString('en-MY')}
                </span>
                <span className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-green-500/10">
                    <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px] text-green-600">RM</span>
                  </div>
                  {formatRM(avgBudget)} target
                </span>
              </div>
            </div>

            {/* Right: Score (Simplified) */}
            <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-1 pl-4 border-l md:border-l-0 md:border-none border-border/50 min-w-[120px]">
              <div className="text-right">
                <div className="text-4xl font-black tracking-tighter text-foreground">{lead.qualification_score}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Qual. Score</div>
              </div>

              <Badge className={`mt-1 ${QUALIFICATION_STATUS_COLORS[lead.qualification_status]} shadow-none border-0`}>
                {lead.qualification_status === 'qualified' && 'Qualified'}
                {lead.qualification_status === 'stretch' && 'Stretch'}
                {lead.qualification_status === 'not_qualified' && 'Not Qualified'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
