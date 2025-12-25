
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
import { ROICalculator } from "./roi-calculator";

export function Pricing() {
    return (
        <section id="pricing" className="py-24">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        One Upgrade Pays for a Year
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">
                        Close one extra upgrade deal and PropFit pays for itself. No hidden fees, no per-deal commissions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Free Trial */}
                    <PricingCard
                        title="Free Trial"
                        price="RM 0"
                        period="/ 14 days"
                        description="See the value before you commit."
                        features={[
                            "Full access to all features",
                            "Up to 10 clients",
                            "No credit card required",
                            "Instant setup"
                        ]}
                        buttonText="Start Free Trial"
                        buttonVariant="outline"
                        href="/auth/sign-up"
                    />

                    {/* Solo Agent - Highlighted */}
                    <PricingCard
                        title="Solo Agent"
                        price="RM 99"
                        period="/ month"
                        description="For serious agents who close upgrades."
                        features={[
                            "Upgrade readiness detection",
                            "Conservative affordability calculator",
                            "Upgrade pipeline tracking",
                            "One-page client summary",
                            "\"Why Now?\" justification builder",
                            "Full client ownership & history"
                        ]}
                        buttonText="Get Started"
                        buttonVariant="default"
                        popular={true}
                        href="/auth/sign-up?plan=solo"
                        badge="Most Popular"
                    />

                    {/* Team / Small Agency */}
                    <PricingCard
                        title="Team"
                        price="RM 299"
                        period="/ month"
                        description="For agencies with up to 5 agents."
                        features={[
                            "Everything in Solo Agent",
                            "Up to 5 agent seats",
                            "Team visibility dashboard",
                            "Client reassignment",
                            "Upgrade conversion tracking",
                            "SOP consistency for juniors"
                        ]}
                        buttonText="Start Team Plan"
                        buttonVariant="secondary"
                        href="/auth/sign-up?plan=team"
                    />

                    {/* Larger Agency */}
                    <PricingCard
                        title="Agency"
                        price="RM 79"
                        period="/ agent / month"
                        description="For teams of 6+ agents."
                        features={[
                            "Everything in Team",
                            "Unlimited agent seats",
                            "Readiness heatmap dashboard",
                            "Standardised upgrade playbooks",
                            "Performance comparison",
                            "Audit logs & principal visibility"
                        ]}
                        buttonText="Contact Us"
                        buttonVariant="outline"
                        href="mailto:hello@propfit.my"
                    />
                </div>

                <div className="mt-12 text-center text-sm text-muted-foreground space-y-2">
                    <p>Flat monthly subscription. No commission fees. Cancel anytime.</p>
                    <p className="text-xs">Prices in MYR. All plans include email support.</p>
                </div>

                {/* Conservative ROI Calculator */}
                <div className="mt-16 max-w-3xl mx-auto">
                    <ROICalculator />
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
                            <Check className="h-4 w-4 text-success shrink-0" />
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
