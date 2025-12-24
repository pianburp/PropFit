'use client';

import Link from 'next/link';
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
  type DashboardStats,
  CITY_LABELS,
  QUALIFICATION_STATUS_COLORS,
  QUALIFICATION_STATUS_LABELS,
  type City,
} from '@/lib/types';
import { dismissAlert } from '@/lib/actions';
import {
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Plus,
  Bell,
  X,
  ArrowRight,
} from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
}

export function Dashboard({ stats }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Leads"
          value={stats.total_leads}
          icon={<Users className="w-5 h-5" />}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          title="Qualified"
          value={stats.qualified_leads}
          icon={<CheckCircle className="w-5 h-5" />}
          color="bg-success/10 text-success"
        />
        <StatCard
          title="Stretch"
          value={stats.stretch_leads}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="bg-chart-3/10 text-chart-3"
        />
        <StatCard
          title="Not Qualified"
          value={stats.not_qualified_leads}
          icon={<XCircle className="w-5 h-5" />}
          color="bg-destructive/10 text-destructive"
        />
        <StatCard
          title="Upgrade Ready"
          value={stats.upgrade_ready_leads}
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-chart-4/10 text-chart-4"
        />
      </div>

      {/* Alerts Section */}
      {stats.pending_alerts.length > 0 && (
        <Card className="border-chart-4/30 bg-chart-4/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-chart-4" />
                <CardTitle className="text-foreground">Upgrade Alerts</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-chart-4/20 text-chart-4">
                {stats.pending_alerts.length} new
              </Badge>
            </div>
            <CardDescription>These leads may be ready for an upgrade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.pending_alerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Leads</CardTitle>
              <Button asChild size="sm">
                <Link href="/protected/leads/new">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Lead
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recent_leads.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_leads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/protected/leads/${lead.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {CITY_LABELS[lead.preferred_city as City]} • {lead.intent}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={QUALIFICATION_STATUS_COLORS[lead.qualification_status]}>
                        {lead.qualification_score}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No leads yet. Add your first lead to get started!</p>
                <Button asChild className="mt-4">
                  <Link href="/protected/leads/new">Add Lead</Link>
                </Button>
              </div>
            )}

            {stats.recent_leads.length > 0 && (
              <Button asChild variant="ghost" className="w-full mt-4">
                <Link href="/protected/leads">View All Leads</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Distribution Cards */}
        <div className="space-y-4">
          {/* By City */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leads by City</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.leads_by_city).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(stats.leads_by_city).map(([city, count]) => (
                    <div key={city} className="flex items-center justify-between">
                      <span>{CITY_LABELS[city as City]}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${(count / stats.total_leads) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No data yet</p>
              )}
            </CardContent>
          </Card>

          {/* By Qualification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Qualification Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-around">
                <QualificationStat
                  label="Qualified"
                  count={stats.qualified_leads}
                  total={stats.total_leads}
                  color="bg-success"
                />
                <QualificationStat
                  label="Stretch"
                  count={stats.stretch_leads}
                  total={stats.total_leads}
                  color="bg-chart-3"
                />
                <QualificationStat
                  label="Not Qualified"
                  count={stats.not_qualified_leads}
                  total={stats.total_leads}
                  color="bg-destructive"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/protected/leads?qualification=qualified">
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  View Qualified Leads
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/protected/leads?qualification=stretch">
                  <AlertTriangle className="w-4 h-4 mr-2 text-chart-3" />
                  View Stretch Leads
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/protected/leads?upgrade=true">
                  <TrendingUp className="w-4 h-4 mr-2 text-chart-4" />
                  View Upgrade Ready
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{title}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertItem({ alert }: { alert: DashboardStats['pending_alerts'][0] }) {
  const handleDismiss = async () => {
    await dismissAlert(alert.id);
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-chart-4/30">
      <div className="flex-1">
        <div className="font-medium text-foreground">{alert.title}</div>
        <p className="text-sm text-muted-foreground">{alert.description}</p>
        {alert.suggested_action && (
          <p className="text-sm text-chart-4 mt-1 italic">💡 {alert.suggested_action}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="secondary">
          <Link href={`/protected/leads/${alert.lead_id}`}>View Lead</Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDismiss}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function QualificationStat({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg className="w-16 h-16 -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            strokeWidth="8"
            fill="none"
            className="stroke-muted"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            strokeWidth="8"
            fill="none"
            className={color.replace('bg-', 'stroke-')}
            strokeDasharray={`${(percentage / 100) * 176} 176`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-bold">
          {count}
        </div>
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
