
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Hero() {
    return (
        <section className="relative pt-20 pb-32 overflow-hidden">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center text-center space-y-8">
                    <div className="p-1 px-3 bg-muted rounded-full text-sm font-medium text-muted-foreground mb-4">
                        🎉 New: Advanced Financial Pre-qualification
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter max-w-3xl">
                        Stop Wasting Time on <span className="text-primary">Unqualified</span> Leads
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-[700px]">
                        PropFit helps real estate agents pre-qualify leads instantly.
                        Get detailed financial insights, move-in timelines, and budget data before you ever pick up the phone.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 min-w-[300px]">
                        <Button asChild size="lg" className="h-12 px-8 text-lg">
                            <Link href="/auth/sign-up">
                                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg">
                            <Link href="/demo">
                                View Demo
                            </Link>
                        </Button>
                    </div>
                    <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" /> No credit card required
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" /> 14-day free trial
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" /> Cancel anytime
                        </div>
                    </div>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 -z-10 h-full w-full bg-white dark:bg-black">
                <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(173,109,244,0.5)] opacity-20 blur-[80px]"></div>
            </div>
        </section>
    );
}
