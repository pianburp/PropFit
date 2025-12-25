
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturesSkeleton() {
    return (
        <section className="py-24 bg-muted/50">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <Skeleton className="h-10 w-[60%] md:w-[40%]" />
                    <Skeleton className="h-6 w-[80%] md:w-[60%]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-start p-6 bg-background rounded-xl shadow-sm border h-[240px]">
                            <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                            <Skeleton className="h-6 w-[70%] mb-2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[90%] mt-1" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function PricingSkeleton() {
    return (
        <section className="py-24">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <Skeleton className="h-10 w-[50%] md:w-[30%]" />
                    <Skeleton className="h-6 w-[70%] md:w-[50%]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={`flex flex-col p-6 rounded-xl border h-[400px] ${i === 1 ? 'border-primary shadow-lg scale-105' : ''}`}>
                            <Skeleton className="h-8 w-[60%] mb-2" />
                            <Skeleton className="h-4 w-[80%] mb-6" />
                            <Skeleton className="h-12 w-[40%] mb-4" />
                            <div className="space-y-3 flex-1">
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <Skeleton key={j} className="h-4 w-full" />
                                ))}
                            </div>
                            <Skeleton className="h-10 w-full mt-6" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function CTASkeleton() {
    return (
        <section className="py-24">
            <div className="container px-4 md:px-6">
                <div className="rounded-3xl bg-primary/10 min-h-[500px] w-full flex flex-col items-center justify-center p-12 md:p-16 lg:p-20 relative overflow-hidden">
                    <div className="space-y-6 max-w-2xl w-full flex flex-col items-center z-10">
                        <Skeleton className="h-12 w-[80%] md:w-[60%] bg-primary/20" />
                        <Skeleton className="h-8 w-[90%] md:w-[70%] bg-primary/20" />
                        <Skeleton className="h-14 w-48 mt-4 bg-primary/20" />
                        <Skeleton className="h-4 w-60 mt-2 bg-primary/20" />
                    </div>
                </div>
            </div>
        </section>
    );
}
