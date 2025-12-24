import { AuthButton } from "@/components/auth/auth-button";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { LayoutDashboard, Users, Home } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
          <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-6 items-center">
              <Link href="/protected" className="font-bold text-lg flex items-center gap-2">
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">PropFit</span>
              </Link>
              <div className="flex items-center gap-1">
                <Link
                  href="/protected"
                  className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link
                  href="/protected/leads"
                  className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Leads</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              {hasEnvVars && (
                <Suspense>
                  <AuthButton />
                </Suspense>
              )}
            </div>
          </div>
        </nav>
        <div className="flex-1 w-full max-w-6xl p-5">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-8 text-muted-foreground">
          <p>Lead Qualification Platform for Malaysia Real Estate Agents</p>
        </footer>
      </div>
    </main>
  );
}
