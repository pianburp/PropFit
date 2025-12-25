import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserX, ArrowLeft, Plus } from 'lucide-react';

export default function LeadNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UserX className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Lead not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            This lead doesn&apos;t exist or you don&apos;t have permission to view it.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild variant="default">
              <Link href="/protected/leads">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Leads
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/protected/leads/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Lead
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
