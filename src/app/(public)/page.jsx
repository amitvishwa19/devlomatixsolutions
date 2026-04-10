'use client';

import React from 'react';
import Navbar from './_components/Navbar';
import Hero from './_components/Hero';
import Services from './_components/Services';
import HowItWorks from './_components/HowItWorks';
import CleaningTech from './_components/CleaningTech';
import Benefits from './_components/Benefits';
import EnergySavingsCalculator from './_components/EnergySavingsCalculator';
import PlanCalculator from './_components/PlanCalculator';
import Pricing from './_components/Pricing';
import Dashboard from './_components/Dashboard';
import Gallery from './_components/Gallery';
import Tips from './_components/Tips';
import FAQ from './_components/FAQ';
import Testimonials from './_components/Testimonials';
import Contact from './_components/Contact';
import Footer from './_components/Footer';
import AIChatbot from './_components/AIChatbot';
import WhatsAppButton from './_components/WhatsAppButton';

export default function SolarBrightPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <CleaningTech />
        <Benefits />
        <EnergySavingsCalculator />
        <PlanCalculator />
        <Pricing />
        <Dashboard />
        <Gallery />
        <Tips />
        <FAQ />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
}
