import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLeads } from '@/lib/actions';
import { LeadList } from '@/components/leads/lead-list';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const leads = await getLeads();

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Database</h1>
          <p className="text-muted-foreground mt-1">
            Manage and qualify your property leads
          </p>
        </div>
        <Button asChild>
          <Link href="/protected/leads/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Link>
        </Button>
      </div>
      <LeadList leads={leads} />
    </div>
  );
}
