import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getClientsByUpgradeStage, getOrCreateAgent } from '@/lib/actions';
import { PipelineBoard } from '@/components/upgrade/pipeline-board';

export default async function PipelinePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Ensure agent profile exists
    await getOrCreateAgent();

    // Get clients grouped by stage
    const clientsByStage = await getClientsByUpgradeStage();

    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Upgrade Pipeline</h1>
                <p className="text-muted-foreground">
                    Track and manage client upgrade opportunities
                </p>
            </div>
            <PipelineBoard clientsByStage={clientsByStage} />
        </div>
    );
}
