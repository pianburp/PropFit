import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDashboardStats, getOrCreateAgent } from '@/lib/actions';
import { Dashboard } from '@/components/dashboard/dashboard';

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Ensure agent profile exists
  await getOrCreateAgent();

  // Get dashboard stats
  const stats = await getDashboardStats();

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your leads.
        </p>
      </div>
      <Dashboard stats={stats} />
    </div>
  );
}
