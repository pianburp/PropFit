
import dynamic from "next/dynamic";
import { Navbar } from "@/components/landing-page/navbar";
import { Hero } from "@/components/landing-page/hero";
import { Footer } from "@/components/landing-page/footer";
import { FeaturesSkeleton, PricingSkeleton, CTASkeleton } from "@/components/landing-page/skeletons";

const Features = dynamic(() => import("@/components/landing-page/features").then((mod) => mod.Features), {
  loading: () => <FeaturesSkeleton />,
});

const Pricing = dynamic(() => import("@/components/landing-page/pricing").then((mod) => mod.Pricing), {
  loading: () => <PricingSkeleton />,
});

const CTA = dynamic(() => import("@/components/landing-page/cta").then((mod) => mod.CTA), {
  loading: () => <CTASkeleton />,
});

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
