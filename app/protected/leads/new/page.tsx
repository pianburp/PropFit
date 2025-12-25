import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LeadForm } from '@/components/leads/lead-form';

export default async function NewLeadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Lead</h1>
        <p className="text-muted-foreground">
          Enter the lead&apos;s details to qualify them instantly
        </p>
      </div>
      <LeadForm mode="create" />
    </div>
  );
}
