
import Link from "next/link";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { AuthButton } from "@/components/auth/auth-button";
import { Home } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <span>PropFit</span>
          </Link>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Features
          </Link>
          <Link href="#testimonials" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Testimonials
          </Link>
          <Link href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Pricing
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
