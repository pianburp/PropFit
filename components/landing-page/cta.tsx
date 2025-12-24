
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTA() {
    return (
        <section className="py-24">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center p-12 bg-primary rounded-3xl text-center text-primary-foreground relative overflow-hidden">
                    <div className="relative z-10 space-y-6 max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-primary-foreground">
                            Ready to streamline your lead qualification?
                        </h2>
                        <p className="text-primary-foreground/80 md:text-xl">
                            Join thousands of agents who are saving time and closing more deals with PropFit.
                        </p>
                        <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-lg font-semibold">
                            <Link href="/auth/sign-up">Start Your Free Trial</Link>
                        </Button>
                        <p className="text-sm text-primary-foreground/60">
                            No credit card required. Cancel anytime.
                        </p>
                    </div>

                    {/* Decorative background circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
                </div>
            </div>
        </section>
    );
}
