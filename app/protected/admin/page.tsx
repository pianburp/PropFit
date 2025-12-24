import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAgencyDashboardStats, getOrCreateAgent } from '@/lib/actions';
import { AgencyDashboard } from '@/components/dashboard/agency-dashboard';

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Ensure agent profile exists
    await getOrCreateAgent();

    // Get agency dashboard stats
    const stats = await getAgencyDashboardStats();

    if (!stats) {
        redirect('/protected');
    }

    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Agency Dashboard</h1>
                <p className="text-muted-foreground">
                    {stats.isAdmin
                        ? 'Team overview and upgrade metrics'
                        : 'Your upgrade metrics'}
                </p>
            </div>
            <AgencyDashboard stats={stats} />
        </div>
    );
}
