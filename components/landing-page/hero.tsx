"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export function Hero() {
    return (
        <section className="relative min-h-[80vh] h-auto pt-20 pb-32 overflow-hidden bg-background">
            {/* Flickering Grid Background */}
            <FlickeringGrid
                className="absolute inset-0 z-0 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
                squareSize={4}
                gridGap={6}
                color="rgb(139, 92, 246)"
                maxOpacity={0.5}
                flickerChance={0.1}
            />
            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center text-center space-y-8">

                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl">
                        Know Exactly When Clients Are <span className="text-primary">Ready to Upgrade</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-[700px]">
                        PropFit helps real estate agents detect upgrade opportunities in their existing client base.
                        Get upgrade readiness scores, property anniversary alerts, and the perfect talking points.
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
                    <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success" /> No credit card required
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success" /> 14-day free trial
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success" /> Cancel anytime
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
