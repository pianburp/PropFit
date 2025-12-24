import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export async function NavbarAuthButton() {
    const supabase = await createClient();

    const { data } = await supabase.auth.getClaims();
    const isLoggedIn = !!data?.claims;

    if (isLoggedIn) {
        return (
            <Button asChild size="sm" variant="default">
                <Link href="/protected">Dashboard</Link>
            </Button>
        );
    }

    return (
        <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
                <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" variant="default">
                <Link href="/auth/sign-up">Sign up</Link>
            </Button>
        </div>
    );
}
