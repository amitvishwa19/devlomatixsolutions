'use client';
import { Navbar } from "./_components/Navbar";
import { Hero } from "./_components/Hero";
import { Features } from "./_components/Features";
import { Stats } from "./_components/Stats";
import { Industries } from "./_components/Industries";

import { Pricing } from "./_components/Pricing";
import { Testimonials } from "./_components/Testimonials";
import { FAQ } from "./_components/FAQ";
import { CTA } from "./_components/CTA";
import { Footer } from "./_components/Footer";
import { ChatbotWidget } from "./_components/ChatbotWidget";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <Industries />

      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
