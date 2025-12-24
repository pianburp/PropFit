
import { Navbar } from "@/components/landing-page/navbar";
import { Hero } from "@/components/landing-page/hero";
import dynamic from "next/dynamic";
const Features = dynamic(() => import("@/components/landing-page/features").then(mod => mod.Features));
const Pricing = dynamic(() => import("@/components/landing-page/pricing").then(mod => mod.Pricing));
const CTA = dynamic(() => import("@/components/landing-page/cta").then(mod => mod.CTA));
const Footer = dynamic(() => import("@/components/landing-page/footer").then(mod => mod.Footer));

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
