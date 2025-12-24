import { ProtectedSidebar } from "@/components/layout/protected-sidebar";
import { AuthButton } from "@/components/auth/auth-button";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedSidebar
      authButton={
        <Suspense fallback={<div className="h-8 w-20 animate-pulse bg-muted rounded" />}>
          <AuthButton />
        </Suspense>
      }
    >
      {children}
    </ProtectedSidebar>
  );
}
