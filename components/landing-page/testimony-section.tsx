"use client";

import dynamic from "next/dynamic";
import { ROICalculator } from "./roi-calculator";

const AnimatedTestimonials = dynamic(
    () => import("@/components/ui/animated-testimonials").then((mod) => mod.AnimatedTestimonials),
    { ssr: false }
);

const testimonials = [
    {
        quote: "PropFit helped me identify 3 upgrade-ready clients I had completely forgotten about. Closed one within the first month - that alone paid for 4 years of subscription.",
        name: "Ahmad Razak",
        designation: "Senior Negotiator, Kuala Lumpur",
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face",
    },
    {
        quote: "The 'Why Now' justification builder is brilliant. It gives me the confidence to approach past clients with a solid reason to upgrade, not just a sales pitch.",
        name: "Sarah Lim",
        designation: "Team Leader, Penang",
        src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop&crop=face",
    },
    {
        quote: "I was skeptical at first - another CRM? But PropFit is different. It's built for upgraders. The conservative affordability calculator alone has saved me from wasting time on unqualified leads.",
        name: "Marcus Tan",
        designation: "Property Consultant, Johor Bahru",
        src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=500&fit=crop&crop=face",
    },
    {
        quote: "My team of 5 agents now consistently identifies 2-3 upgrade opportunities per month. The ROI is undeniable - one upgrade deal covers our entire year's subscription.",
        name: "Jennifer Wong",
        designation: "Agency Principal, Selangor",
        src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&fit=crop&crop=face",
    },
];

export function TestimonySection() {
    return (
        <section id="testimonials" className="py-24 bg-muted/30">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Trusted by Malaysian Agents
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">
                        Real agents, real results. See how PropFit is helping property professionals close more upgrade deals.
                    </p>
                </div>

                {/* Side by side layout: Testimonials + ROI Calculator */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Animated Testimonials */}
                    <div className="w-full">
                        <AnimatedTestimonials testimonials={testimonials} autoplay />
                    </div>

                    {/* ROI Calculator */}
                    <div className="w-full flex flex-col justify-center">
                        <ROICalculator />
                    </div>
                </div>
            </div>
        </section>
    );
}
