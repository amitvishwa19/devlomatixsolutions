'use client';
import { Navbar } from "../_components/Navbar";
import { Pricing } from "../_components/Pricing";
import { CTA } from "../_components/CTA";
import { FAQ } from "../_components/FAQ";
import { Footer } from "../_components/Footer";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-8">
        <Pricing />
        <FAQ />
        <CTA />
      </div>
      <Footer />
    </div>
  );
}
