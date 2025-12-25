import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLead } from '@/lib/actions';
import { LeadForm } from '@/components/leads/lead-form';

interface EditLeadPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLeadPage({ params }: EditLeadPageProps) {
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

  return (
    <div className="w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Lead</h1>
        <p className="text-muted-foreground">
          Update {lead.name}&apos;s information
        </p>
      </div>
      <LeadForm lead={lead} mode="edit" />
    </div>
  );
}
