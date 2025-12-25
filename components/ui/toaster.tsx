'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * Toast Provider - Global toast notifications
 * 
 * Wrap your app with this component to enable toast notifications.
 * Uses sonner for lightweight, accessible toasts.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'group toast bg-background text-foreground border-border shadow-lg',
          title: 'text-foreground font-semibold',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
          error: 'bg-destructive text-destructive-foreground border-destructive',
          success: 'bg-green-500 text-white border-green-600',
        },
      }}
      expand
      richColors
      closeButton
    />
  );
}

// Re-export toast function for convenience
export { toast } from 'sonner';
