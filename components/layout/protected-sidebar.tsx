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
        icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
        label: "Clients",
        href: "/protected/leads",
        icon: <Users className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
        label: "Pipeline",
        href: "/protected/pipeline",
        icon: <TrendingUp className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
        label: "Agency",
        href: "/protected/admin",
        icon: <Building2 className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
];

const Logo = () => {
    return (
        <Link
            href="/protected"
            className="font-bold flex items-center gap-2 text-sm text-black dark:text-white py-1 relative z-20"
        >
            <House className="h-5 w-5 shrink-0 text-black dark:text-white" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-semibold text-black dark:text-white whitespace-pre"
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
            className="font-bold flex items-center gap-2 text-sm text-black dark:text-white py-1 relative z-20"
        >
            <House className="h-5 w-5 shrink-0 text-black dark:text-white" />
        </Link>
    );
};

export function ProtectedSidebar({ children, authButton }: { children: React.ReactNode; authButton?: ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className={cn(
                "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
                "min-h-screen"
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <ThemeSwitcher />
                        </div>
                        {hasEnvVars && authButton}
                    </div>
                </SidebarBody>
            </Sidebar>
            <div className="flex flex-1">
                <div className="flex flex-col w-full h-full">
                    <main className="flex-1 p-4 md:p-8 overflow-auto bg-white dark:bg-neutral-900">
                        {children}
                    </main>
                    <footer className="w-full flex items-center justify-center border-t border-neutral-200 dark:border-neutral-700 text-center text-xs py-4 text-muted-foreground bg-white dark:bg-neutral-900">
                        <p>Lead Qualification Platform for Malaysia Real Estate Agents</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
