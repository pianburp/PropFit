import {
    TrendingUp,
    ShieldCheck,
    MessageSquareText,
    AlertTriangle,
    History,
    Target
} from "lucide-react";

const features = [
    {
        title: "Upgrade Readiness Score",
        description: "Know exactly when a client is financially ready to upgrade. No more guessing, no more awkward conversations.",
        icon: Target,
    },
    {
        title: "Deal Risk Flags",
        description: "Spot potential blockers early—family objections, bank rejection risks, timing issues—before they kill the deal.",
        icon: AlertTriangle,
    },
    {
        title: "Why-Now Panel",
        description: "Get clear talking points that explain the upgrade opportunity professionally. Advise, don't sell.",
        icon: MessageSquareText,
    },
    {
        title: "Financial Snapshot",
        description: "See equity position, affordability ceiling, and realistic upgrade paths at a glance. Numbers you can trust.",
        icon: TrendingUp,
    },
    {
        title: "Readiness History",
        description: "Track how each client's situation evolves over time. Know the perfect moment to reach out.",
        icon: History,
    },
    {
        title: "Conservative Assumptions",
        description: "Built-in safety margins protect your credibility. If the numbers work here, they'll work at the bank.",
        icon: ShieldCheck,
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-muted/50">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Turn upgrades from risky guesses into confident moves
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">
                        You know upgrades make money. Now get the safe, structured system that tells you when, how, and whether you should do it.
                    </p>
                </div>

                {/* Feature Cards */}
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
