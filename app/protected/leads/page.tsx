import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLeads } from '@/lib/actions';
import { LeadList } from '@/components/leads/lead-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const leads = await getLeads();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground">
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
