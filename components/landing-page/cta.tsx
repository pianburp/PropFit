"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/ui/globe";

const GLOBE_CONFIG = {
    width: 800,
    height: 800,
    onRender: () => { },
    devicePixelRatio: 2,
    phi: 0,
    theta: 0.3,
    dark: 1,
    diffuse: 0.4,
    mapSamples: 16000,
    mapBrightness: 1.2,
    baseColor: [0.3, 0.3, 0.3] as [number, number, number],
    markerColor: [0.9, 0.5, 0.2] as [number, number, number],
    glowColor: [0.4, 0.4, 0.5] as [number, number, number],
    markers: [
        { location: [14.5995, 120.9842] as [number, number], size: 0.03 },
        { location: [19.076, 72.8777] as [number, number], size: 0.1 },
        { location: [23.8103, 90.4125] as [number, number], size: 0.05 },
        { location: [30.0444, 31.2357] as [number, number], size: 0.07 },
        { location: [39.9042, 116.4074] as [number, number], size: 0.08 },
        { location: [-23.5505, -46.6333] as [number, number], size: 0.1 },
        { location: [19.4326, -99.1332] as [number, number], size: 0.1 },
        { location: [40.7128, -74.006] as [number, number], size: 0.1 },
        { location: [34.6937, 135.5022] as [number, number], size: 0.05 },
        { location: [41.0082, 28.9784] as [number, number], size: 0.06 },
    ],
};

export function CTA() {
    return (
        <section className="py-24">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center p-12 md:p-16 lg:p-20 bg-primary rounded-3xl text-center text-primary-foreground relative overflow-hidden min-h-[500px]">
                    {/* Globe Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                        <Globe
                            className="!absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] max-w-none"
                            config={GLOBE_CONFIG}
                        />
                    </div>

                    {/* Gradient overlays for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/60 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-transparent pointer-events-none"></div>

                    {/* Content */}
                    <div className="relative z-10 space-y-6 max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl text-primary-foreground drop-shadow-lg">
                            Ready to streamline your lead qualification?
                        </h2>
                        <p className="text-primary-foreground/90 md:text-xl lg:text-2xl drop-shadow-md">
                            Join thousands of agents who are saving time and closing more deals with PropFit.
                        </p>
                        <div className="pt-4">
                            <Button
                                asChild
                                size="lg"
                                variant="secondary"
                                className="h-14 px-10 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                            >
                                <Link href="/auth/sign-up">Start Your Free Trial</Link>
                            </Button>
                        </div>
                        <p className="text-sm text-primary-foreground/70 pt-2">
                            No credit card required. Cancel anytime.
                        </p>
                    </div>

                    {/* Decorative glow effects */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-accent/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none"></div>
                </div>
            </div>
        </section>
    );
}
