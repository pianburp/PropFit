
import {
    Calculator,
    Users,
    BarChart3,
    ShieldCheck,
    Clock,
    Smartphone
} from "lucide-react";

const features = [
    {
        title: "Instant Qualification",
        description: "Our smart forms ask the right questions about income, employment, and budget to score leads instantly.",
        icon: ShieldCheck,
    },
    {
        title: "Financial Readiness",
        description: "Estimate loan eligibility based on current commitments, income, and down payment capability.",
        icon: Calculator,
    },
    {
        title: "Lead CRM",
        description: "Manage all your prospects in one place. Track status from 'New' to 'Closed' with ease.",
        icon: Users,
    },
    {
        title: "Insightful Analytics",
        description: "Understand your lead pipeline with beautiful charts and conversion metrics.",
        icon: BarChart3,
    },
    {
        title: "Fast & Mobile Friendly",
        description: "Your clients can fill out qualification forms on any device, anywhere, anytime.",
        icon: Smartphone,
    },
    {
        title: "Save Hours Weekly",
        description: "Stop touring with clients who can't buy. Focus on the top 20% of ready-to-move leads.",
        icon: Clock,
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-muted/50">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Everything you need to qualify leads
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">
                        Built by agents, for agents. We know the pain of wasted viewings, so we solved it.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-start p-6 bg-background rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="p-3 bg-primary/10 rounded-lg mb-4">
                                <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
