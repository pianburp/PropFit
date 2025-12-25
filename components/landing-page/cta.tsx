"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DottedMap } from "@/components/ui/dotted-map";

const MAP_MARKERS = [
    { lat: 14.5995, lng: 120.9842, size: 0.8 },
    { lat: 19.076, lng: 72.8777, size: 1.2 },
    { lat: 23.8103, lng: 90.4125, size: 0.9 },
    { lat: 30.0444, lng: 31.2357, size: 1.0 },
    { lat: 39.9042, lng: 116.4074, size: 1.1 },
    { lat: -23.5505, lng: -46.6333, size: 1.2 },
    { lat: 19.4326, lng: -99.1332, size: 1.2 },
    { lat: 40.7128, lng: -74.006, size: 1.2 },
    { lat: 34.6937, lng: 135.5022, size: 0.9 },
    { lat: 41.0082, lng: 28.9784, size: 1.0 },
    { lat: 3.139, lng: 101.6869, size: 1.3 },
    { lat: 1.3521, lng: 103.8198, size: 1.1 },
];

export function CTA() {
    return (
        <section className="py-24">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center p-12 md:p-16 lg:p-20 bg-primary rounded-3xl text-center text-primary-foreground relative overflow-hidden min-h-[500px]">
                    {/* Dotted Map Background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <DottedMap
                            className="w-full h-full text-primary-foreground/60"
                            markers={MAP_MARKERS}
                            markerColor="#F59E0B"
                            dotRadius={0.3}
                            mapSamples={2500}
                        />
                    </div>

                    {/* Gradient overlays for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/60 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-transparent pointer-events-none"></div>

                    {/* Content */}
                    <div className="relative z-10 space-y-6 max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl text-primary-foreground drop-shadow-lg">
                            Ready to upgrade clients with confidence?
                        </h2>
                        <p className="text-primary-foreground/90 md:text-xl lg:text-2xl drop-shadow-md">
                            Join agents who turned upgrade anxiety into their highest-commission deals.
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
