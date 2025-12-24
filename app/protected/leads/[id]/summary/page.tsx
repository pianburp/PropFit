import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLead } from '@/lib/actions';
import { UpgradeSummaryCompact } from '@/components/upgrade/upgrade-summary-compact';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface SummaryPageProps {
    params: Promise<{ id: string }>;
}

export default async function SummaryPage({ params }: SummaryPageProps) {
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
        <div className="min-h-screen bg-background">
            {/* Back button - hidden when screenshotting */}
            <div className="p-4 print:hidden">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/protected/leads/${id}`}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Lead
                    </Link>
                </Button>
            </div>

            {/* Compact Summary - optimized for screenshot */}
            <UpgradeSummaryCompact lead={lead} />

            {/* Screenshot tip - hidden when screenshotting */}
            <div className="p-4 text-center print:hidden">
                <p className="text-xs text-muted-foreground">
                    📱 Take a screenshot of this page to share via WhatsApp
                </p>
            </div>
        </div>
    );
}
