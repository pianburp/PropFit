'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Error Boundary for Protected Routes
 * 
 * Shows a toast notification and provides a simple retry option.
 * This single error boundary handles all protected route errors.
 */
export default function ProtectedError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Protected route error:', error);
    
    // Show toast notification
    toast.error('Something went wrong', {
      description: 'An error occurred while loading this page.',
      action: {
        label: 'Retry',
        onClick: () => reset(),
      },
    });
  }, [error, reset]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-4">
      <p className="text-muted-foreground text-center max-w-md">
        Something went wrong. Please try again or go back to the previous page.
      </p>
      
      <div className="flex gap-2">
        <Button onClick={reset} variant="default" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button onClick={() => router.back()} variant="outline" size="sm">
          Go Back
        </Button>
      </div>
      
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
