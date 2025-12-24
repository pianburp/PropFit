
import { Navbar } from "@/components/landing-page/navbar";
import { Hero } from "@/components/landing-page/hero";
import { Features } from "@/components/landing-page/features";
import { Pricing } from "@/components/landing-page/pricing";
import { CTA } from "@/components/landing-page/cta";
import { Footer } from "@/components/landing-page/footer";

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
