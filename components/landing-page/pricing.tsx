
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Info } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Pricing() {
    return (
        <section id="pricing" className="py-24">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Simple Pricing. No Long Contracts.
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">
                        Start closing more deals today. If it helps you close just one extra deal, it pays for itself.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Free Trial */}
                    <PricingCard
                        title="Free Trial"
                        price="RM 0"
                        period="/ 14 days"
                        description="Test the value before you commit."
                        features={[
                            "Full access to all features",
                            "Limit to 50 leads",
                            "No credit card required",
                            "Instant setup"
                        ]}
                        buttonText="Start Free Trial"
                        buttonVariant="outline"
                        href="/auth/sign-up"
                    />

                    {/* Founding Agent - Highlighted */}
                    <PricingCard
                        title="Founding Agent"
                        price="RM 29"
                        period="/ agent / month"
                        description="Limited to first 30 agents only."
                        features={[
                            "Everything in Free Trial",
                            "Unlimited leads",
                            "Lifetime price lock",
                            "Priority support",
                            "Early access to new features"
                        ]}
                        buttonText="Claim Offer"
                        buttonVariant="default"
                        popular={true}
                        href="/auth/sign-up?plan=founding"
                        badge="Best Value"
                    />

                    {/* Core MVP */}
                    <PricingCard
                        title="Core MVP"
                        price="RM 49"
                        period="/ agent / month"
                        description="For the serious agent."
                        features={[
                            "Unlimited leads",
                            "Lead qualification scoring",
                            "Location affordability",
                            "Financing readiness",
                            "Upgrade alerts"
                        ]}
                        buttonText="Get Started"
                        buttonVariant="secondary"
                        href="/auth/sign-up?plan=core"
                    />

                    {/* Small Agency */}
                    <PricingCard
                        title="Small Agency"
                        price="RM 199"
                        period="/ month"
                        description="For teams of up to 5 agents."
                        features={[
                            "Up to 5 agent seats",
                            "Centralized admin view",
                            "Shared lead rules",
                            "Team performance tracking",
                            "Consolidated billing"
                        ]}
                        buttonText="Contact Sales"
                        buttonVariant="outline"
                        href="mailto:sales@propfit.com"
                    />
                </div>

                <div className="mt-12 text-center text-sm text-muted-foreground">
                    <p>Prices in MYR. Cancel anytime. No hidden fees.</p>
                </div>
            </div>
        </section>
    );
}

interface PricingCardProps {
    title: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    buttonText: string;
    buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    popular?: boolean;
    href: string;
    badge?: string;
}

function PricingCard({
    title,
    price,
    period,
    description,
    features,
    buttonText,
    buttonVariant = "default",
    popular = false,
    href,
    badge
}: PricingCardProps) {
    return (
        <Card className={`flex flex-col relative ${popular ? 'border-primary shadow-lg scale-105 z-10' : ''}`}>
            {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="bg-primary text-primary-foreground px-3 py-1">
                        {badge}
                    </Badge>
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="mb-6">
                    <span className="text-3xl font-bold">{price}</span>
                    <span className="text-muted-foreground ml-1 text-sm">{period}</span>
                </div>
                <ul className="space-y-3 text-sm">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full" variant={buttonVariant}>
                    <Link href={href}>{buttonText}</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
