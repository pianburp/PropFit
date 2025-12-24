"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { motion } from "motion/react";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarAuthButtonProps {
    isLoggedIn: boolean;
}

export function SidebarAuthButton({ isLoggedIn }: SidebarAuthButtonProps) {
    const { open, animate } = useSidebar();
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    if (isLoggedIn) {
        return (
            <button
                onClick={handleLogout}
                className={cn(
                    "flex items-center justify-start gap-2 group/sidebar py-2",
                    "text-neutral-700 dark:text-neutral-200 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                )}
            >
                <LogOut className="h-5 w-5 shrink-0" />
                <motion.span
                    animate={{
                        display: animate ? (open ? "inline-block" : "none") : "inline-block",
                        opacity: animate ? (open ? 1 : 0) : 1,
                    }}
                    className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                >
                    Logout
                </motion.span>
            </button>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <Link
                href="/auth/login"
                className={cn(
                    "flex items-center justify-start gap-2 group/sidebar py-2",
                    "text-neutral-700 dark:text-neutral-200"
                )}
            >
                <LogIn className="h-5 w-5 shrink-0" />
                <motion.span
                    animate={{
                        display: animate ? (open ? "inline-block" : "none") : "inline-block",
                        opacity: animate ? (open ? 1 : 0) : 1,
                    }}
                    className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                >
                    Sign in
                </motion.span>
            </Link>
            <Link
                href="/auth/sign-up"
                className={cn(
                    "flex items-center justify-start gap-2 group/sidebar py-2",
                    "text-neutral-700 dark:text-neutral-200"
                )}
            >
                <UserPlus className="h-5 w-5 shrink-0" />
                <motion.span
                    animate={{
                        display: animate ? (open ? "inline-block" : "none") : "inline-block",
                        opacity: animate ? (open ? 1 : 0) : 1,
                    }}
                    className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                >
                    Sign up
                </motion.span>
            </Link>
        </div>
    );
}
