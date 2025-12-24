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

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
    if (cityFilter !== 'all' && lead.preferred_city !== cityFilter) return false;
    if (qualificationFilter !== 'all' && lead.qualification_status !== qualificationFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
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
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const avgBudget = (lead.budget_min + lead.budget_max) / 2;

  return (
    <Link href={`/protected/leads/${lead.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{lead.name}</h3>
                {lead.is_upgrade_ready && (
                  <Badge variant="secondary" className="bg-chart-4/20 text-chart-4">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Upgrade Ready
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {lead.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {CITY_LABELS[lead.preferred_city as City]}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(lead.created_at).toLocaleDateString('en-MY')}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {INTENT_LABELS[lead.intent]} • {formatRM(avgBudget)}
                </Badge>
                <Badge variant="outline">
                  {LEAD_STATUS_LABELS[lead.status as LeadStatus]}
                </Badge>
              </div>
            </div>

            {/* Right: Score */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-center">
                <div className="text-2xl font-bold">{lead.qualification_score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <Badge className={QUALIFICATION_STATUS_COLORS[lead.qualification_status]}>
                {lead.qualification_status === 'qualified' && '✓ '}
                {lead.qualification_status === 'stretch' && '⚠ '}
                {lead.qualification_status === 'not_qualified' && '✗ '}
                {QUALIFICATION_STATUS_LABELS[lead.qualification_status]}
              </Badge>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
