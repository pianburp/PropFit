import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLead, getLeadEvents } from '@/lib/actions';
import { LeadDetail } from '@/components/leads/lead-detail';

interface LeadPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadPage({ params }: LeadPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const lead = await getLead(id);

  if (!lead) {
    notFound();
  }

  const events = await getLeadEvents(id);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <LeadDetail lead={lead} events={events} />
    </div>
  );
}
