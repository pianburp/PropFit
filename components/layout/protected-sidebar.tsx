"use client";

import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { useState, ReactNode } from "react";
import { LayoutDashboard, Users, TrendingUp, Building2, House } from "lucide-react";
import {
    Sidebar,
    SidebarBody,
    SidebarLink,
} from "@/components/ui/sidebar";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const links = [
    {
        label: "Dashboard",
        href: "/protected",
        icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-foreground/70" />,
    },
    {
        label: "Clients",
        href: "/protected/leads",
        icon: <Users className="h-5 w-5 shrink-0 text-foreground/70" />,
    },
    {
        label: "Pipeline",
        href: "/protected/pipeline",
        icon: <TrendingUp className="h-5 w-5 shrink-0 text-foreground/70" />,
    },
    {
        label: "Agency",
        href: "/protected/admin",
        icon: <Building2 className="h-5 w-5 shrink-0 text-foreground/70" />,
    },
];

const Logo = () => {
    return (
        <Link
            href="/protected"
            className="font-bold flex items-center gap-2 text-sm text-foreground py-1 relative z-20"
        >
            <House className="h-5 w-5 shrink-0 text-foreground" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-foreground whitespace-pre"
            >
                PropFit
            </motion.span>
        </Link>
    );
};

const LogoIcon = () => {
    return (
        <Link
            href="/protected"
            className="font-bold flex items-center gap-2 text-sm text-foreground py-1 relative z-20"
        >
            <House className="h-5 w-5 shrink-0 text-foreground" />
        </Link>
    );
};

export function ProtectedSidebar({ children, authButton }: { children: React.ReactNode; authButton?: ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className={cn(
                "flex flex-col md:flex-row bg-background w-full flex-1 mx-auto overflow-hidden",
                "min-h-screen"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between h-full">
                    {/* Navigation section */}
                    <div className="flex flex-col overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    {/* Footer section - stays at bottom */}
                    <div className="flex flex-col gap-3 pt-4 mt-auto border-t border-sidebar-border">
                        <div className="flex items-center gap-2">
                            <ThemeSwitcher />
                        </div>
                        {hasEnvVars && authButton}
                    </div>
                </SidebarBody>
            </Sidebar>
            <div className="flex flex-1">
                <div className="flex flex-col w-full h-full">
                    <main className="flex-1 p-4 md:p-8 overflow-auto bg-background">
                        {children}
                    </main>
                    <footer className="w-full flex items-center justify-center border-t border-border text-center text-xs py-4 text-muted-foreground bg-background">
                        <p>Lead Qualification Platform for Malaysia Real Estate Agents</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
