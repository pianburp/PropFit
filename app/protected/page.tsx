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
    <div className="w-full space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your leads.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          <span>{new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
      <Dashboard stats={stats} />
    </div>
  );
}
